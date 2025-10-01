import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import UndoRedoBar from "../../components/UndoRedoBar";
import PlanSelector from "../../components/PlanSelector";
import ExportModal from "../../components/ExportModal";
import {
  TEXT_PRESETS,
  TextPreset,
  getAvailablePresets,
  isPresetPremium,
} from "../../presets/textPresets";
import { logEvent } from "../../lib/logEvent";
import {
  getCurrentPlan,
  canRemoveWatermark,
  hasPremiumPresets,
  hasUnlimitedExports,
  type Plan,
} from "../../lib/plan";
import {
  trackFirstFileUpload,
  trackFirstExport,
  trackToolUse,
  trackActivity,
  trackError,
  trackPremiumFeatureAttempt,
  trackContentShare,
  trackActivation,
} from "../../lib/metrics";

/** ===== Types ===== */
type Stage = "pick" | "edit";
type Aspect = "16:9" | "9:16" | "1:1";

/** ===== Constants ===== */
const SNAP_TOL = 6; // px
const EDGE_PAD_IMG = 40; // px
const EDGE_PAD_TXT = 64; // px
const MAX_UNDO = 50;
const DEFAULT_ASPECT: Aspect = "16:9";

/** ===== Helpers ===== */
function dimsForAspect(a: Aspect) {
  switch (a) {
    case "16:9":
      return { w: 1280, h: 720 };
    case "9:16":
      return { w: 720, h: 1280 };
    case "1:1":
      return { w: 1080, h: 1080 };
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function measureTextPx(
  txt: string,
  size: number,
  fontFamily: string,
  fontWeight: string
) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  const width = ctx.measureText(txt || " ").width;
  const height = size * 1.2;
  return {
    w: Math.max(1, Math.round(width)),
    h: Math.max(1, Math.round(height)),
  };
}

/** Smart snap of a point to canvas bounds with padding and tolerance */
function snapSmart(
  p: { x: number; y: number },
  box: { w: number; h: number },
  canvas: { w: number; h: number },
  kind: "image" | "text",
  flush: boolean
) {
  const pad = flush ? 0 : kind === "image" ? EDGE_PAD_IMG : EDGE_PAD_TXT;
  const left = pad + box.w / 2;
  const right = canvas.w - pad - box.w / 2;
  const top = pad + box.h / 2;
  const bottom = canvas.h - pad - box.h / 2;

  let { x, y } = p;
  let snapLines: { x?: number; y?: number } = {};

  // X snaps
  if (Math.abs(x - left) <= SNAP_TOL) {
    x = left;
    snapLines.x = left;
  } else if (Math.abs(x - right) <= SNAP_TOL) {
    x = right;
    snapLines.x = right;
  } else if (Math.abs(x - canvas.w / 2) <= SNAP_TOL) {
    x = canvas.w / 2;
    snapLines.x = canvas.w / 2;
  }

  // Y snaps
  if (Math.abs(y - top) <= SNAP_TOL) {
    y = top;
    snapLines.y = top;
  } else if (Math.abs(y - bottom) <= SNAP_TOL) {
    y = bottom;
    snapLines.y = bottom;
  } else if (Math.abs(y - canvas.h / 2) <= SNAP_TOL) {
    y = canvas.h / 2;
    snapLines.y = canvas.h / 2;
  }

  // Clamp to bounds
  x = clamp(x, left, right);
  y = clamp(y, top, bottom);
  return { x: Math.round(x), y: Math.round(y), snapLines };
}

/** Watermark drawing */
function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const badge = "Made with Forge";
  const pad = Math.round(Math.min(W, H) * 0.02);
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.font = `bold ${Math.round(
    H * 0.035
  )}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  const metrics = ctx.measureText(badge);
  const th = Math.round(H * 0.05);
  const tw = Math.ceil(metrics.width + th * 0.8);
  const x = W - tw - pad;
  const y = H - pad;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(x, y - th, tw, th);
  ctx.fillStyle = "#fff";
  ctx.fillText(badge, x + th * 0.4, y - th * 0.25);
  ctx.restore();
}

/** Draw snap lines */
function drawSnapLines(
  ctx: CanvasRenderingContext2D,
  snapLines: { x?: number; y?: number },
  canvas: { w: number; h: number }
) {
  if (!snapLines.x && !snapLines.y) return;

  ctx.save();
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.globalAlpha = 0.8;

  if (snapLines.x !== undefined) {
    ctx.beginPath();
    ctx.moveTo(snapLines.x, 0);
    ctx.lineTo(snapLines.x, canvas.h);
    ctx.stroke();
  }

  if (snapLines.y !== undefined) {
    ctx.beginPath();
    ctx.moveTo(0, snapLines.y);
    ctx.lineTo(canvas.w, snapLines.y);
    ctx.stroke();
  }

  ctx.restore();
}

/** Apply text preset to current text settings */
function applyTextPreset(
  preset: TextPreset,
  setters: {
    setTxtSize: (size: number) => void;
    setTxtFill: (fill: string) => void;
    setTxtStroke: (stroke: string) => void;
    setTxtStrokeW: (width: number) => void;
    setTxtAlpha: (alpha: number) => void;
    setTxtFontFamily: (family: string) => void;
    setTxtFontWeight: (weight: string) => void;
  }
) {
  setters.setTxtSize(preset.fontSize);
  setters.setTxtFill(preset.fill);
  setters.setTxtStroke(preset.stroke);
  setters.setTxtStrokeW(preset.strokeWidth);
  setters.setTxtAlpha(preset.opacity);
  setters.setTxtFontFamily(preset.fontFamily);
  setters.setTxtFontWeight(preset.fontWeight);
}

/** ===== Component ===== */
export default function ThumbTool() {
  /** Canvas size by aspect */
  const [aspect, setAspect] = useState<Aspect>(DEFAULT_ASPECT);
  const { w: CW, h: CH } = useMemo(() => dimsForAspect(aspect), [aspect]);

  /** Base image selection */
  const [imgUrl, setImgUrl] = useState<string>("");
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  /** Overlay image */
  const [ovUrl, setOvUrl] = useState<string>("");
  const [ovScale, setOvScale] = useState(1);
  const [ovPos, setOvPos] = useState<{ x: number; y: number }>({
    x: 200,
    y: 200,
  });
  const [ovAlpha, setOvAlpha] = useState(0.85);
  const [ovAR, setOvAR] = useState<number | null>(null); // width/height

  /** Text overlay */
  const [txt, setTxt] = useState("YOUR TITLE");
  const [txtSize, setTxtSize] = useState(72);
  const [txtPos, setTxtPos] = useState<{ x: number; y: number }>({
    x: CW / 2,
    y: Math.round(CH * 0.16),
  });
  const [txtAlpha, setTxtAlpha] = useState(1);
  const [txtFill, setTxtFill] = useState("#ffffff");
  const [txtStroke, setTxtStroke] = useState("#000000");
  const [txtStrokeW, setTxtStrokeW] = useState(8);
  const [txtFontFamily, setTxtFontFamily] = useState(
    "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
  );
  const [txtFontWeight, setTxtFontWeight] = useState("bold");

  /** Snap settings */
  const [flushSnap, setFlushSnap] = useState(false);
  const [snapLines, setSnapLines] = useState<{ x?: number; y?: number }>({});

  /** Watermark and plan */
  const [wmOn, setWmOn] = useState<boolean>(() =>
    localStorage.getItem("forge_wm_on") === "0" ? false : true
  );
  const [plan, setPlan] = useState<Plan>(getCurrentPlan);

  // For Free plan, always enforce watermark regardless of wmOn setting
  const shouldShowWatermark = wmOn || plan === "free";

  /** Export modal */
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);

  useEffect(
    () => localStorage.setItem("forge_wm_on", wmOn ? "1" : "0"),
    [wmOn]
  );

  // Update plan when it changes in localStorage or from PlanSelector
  useEffect(() => {
    const handleStorageChange = () => {
      setPlan(getCurrentPlan());
    };
    const handlePlanChange = (event: CustomEvent) => {
      setPlan(event.detail.plan);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("planChanged", handlePlanChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "planChanged",
        handlePlanChange as EventListener
      );
    };
  }, []);

  /** Stage */
  const [stage, setStage] = useState<Stage>("pick");

  /** Refs */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragging = useRef<null | "base" | "overlay" | "text">(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const saved = useRef<{ x: number; y: number } | null>(null);

  /** Undo/Redo */
  type Snap = {
    aspect: Aspect;
    imgUrl: string;
    scale: number;
    minScale: number;
    offset: { x: number; y: number };
    ov?: {
      src: string;
      pos: { x: number; y: number };
      scale: number;
      alpha: number;
      ar: number | null;
    };
    txt: {
      value: string;
      pos: { x: number; y: number };
      size: number;
      alpha: number;
      strokeW: number;
      fill: string;
      stroke: string;
      fontFamily: string;
      fontWeight: string;
    };
    flushSnap: boolean;
    wmOn: boolean;
  };
  const hist = useRef<Snap[]>([]);
  const hi = useRef<number>(-1);
  const pushSnap = useCallback(() => {
    // trim forward
    if (hi.current >= 0 && hi.current < hist.current.length - 1) {
      hist.current = hist.current.slice(0, hi.current + 1);
    }
    const snap: Snap = {
      aspect,
      imgUrl,
      scale,
      minScale,
      offset,
      ov: ovUrl
        ? { src: ovUrl, pos: ovPos, scale: ovScale, alpha: ovAlpha, ar: ovAR }
        : undefined,
      txt: {
        value: txt,
        pos: txtPos,
        size: txtSize,
        alpha: txtAlpha,
        strokeW: txtStrokeW,
        fill: txtFill,
        stroke: txtStroke,
        fontFamily: txtFontFamily,
        fontWeight: txtFontWeight,
      },
      flushSnap,
      wmOn,
    };
    hist.current.push(snap);
    if (hist.current.length > MAX_UNDO) hist.current.shift();
    hi.current = hist.current.length - 1;
  }, [
    aspect,
    imgUrl,
    scale,
    minScale,
    offset,
    ovUrl,
    ovPos,
    ovScale,
    ovAlpha,
    ovAR,
    txt,
    txtPos,
    txtSize,
    txtAlpha,
    txtStrokeW,
    txtFill,
    txtStroke,
    txtFontFamily,
    txtFontWeight,
    flushSnap,
    wmOn,
  ]);

  const applySnap = (s: Snap) => {
    setAspect(s.aspect);
    setImgUrl(s.imgUrl);
    setScale(s.scale);
    setMinScale(s.minScale);
    setOffset(s.offset);
    setWmOn(s.wmOn);
    if (s.ov?.src) {
      setOvUrl(s.ov.src);
      setOvPos(s.ov.pos);
      setOvScale(s.ov.scale);
      setOvAlpha(s.ov.alpha);
      setOvAR(s.ov.ar);
    } else {
      setOvUrl("");
      setOvAlpha(1);
      setOvScale(1);
      setOvAR(null);
    }
    setTxt(s.txt.value);
    setTxtPos(s.txt.pos);
    setTxtSize(s.txt.size);
    setTxtAlpha(s.txt.alpha);
    setTxtStrokeW(s.txt.strokeW);
    setTxtFill(s.txt.fill);
    setTxtStroke(s.txt.stroke);
    setTxtFontFamily(s.txt.fontFamily);
    setTxtFontWeight(s.txt.fontWeight);
    setFlushSnap(s.flushSnap);
  };
  const canUndo = hi.current > 0;
  const canRedo = hi.current >= 0 && hi.current < hist.current.length - 1;
  const undo = () => {
    if (!canUndo) return;
    hi.current -= 1;
    applySnap(hist.current[hi.current]);
    logEvent("undo", { historyIndex: hi.current });
  };
  const redo = () => {
    if (!canRedo) return;
    hi.current += 1;
    applySnap(hist.current[hi.current]);
    logEvent("redo", { historyIndex: hi.current });
  };

  // initial
  useEffect(() => {
    if (hi.current === -1) pushSnap();
  }, [pushSnap]);

  // draw loop
  useEffect(() => {
    draw();
  }, [
    aspect,
    imgUrl,
    scale,
    offset,
    ovUrl,
    ovPos,
    ovScale,
    ovAlpha,
    ovAR,
    txt,
    txtPos,
    txtSize,
    txtAlpha,
    txtFill,
    txtStroke,
    txtStrokeW,
    txtFontFamily,
    txtFontWeight,
    wmOn,
    snapLines,
  ]);

  // Keyboard nudge functionality
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle arrow keys when canvas is focused or when in edit mode
      if (stage !== "edit") return;

      const isArrowKey = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.key);
      if (!isArrowKey) return;

      e.preventDefault();

      const nudgeAmount = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case "ArrowUp":
          dy = -nudgeAmount;
          break;
        case "ArrowDown":
          dy = nudgeAmount;
          break;
        case "ArrowLeft":
          dx = -nudgeAmount;
          break;
        case "ArrowRight":
          dx = nudgeAmount;
          break;
      }

      // Determine which element to nudge based on current selection or last interaction
      if (ovUrl) {
        const newPos = { x: ovPos.x + dx, y: ovPos.y + dy };
        const w = CH * 0.5 * (ovAR || 1) * ovScale;
        const h = CH * 0.5 * (ovAR ? 1 : 1) * ovScale;
        const snapResult = snapSmart(
          newPos,
          { w, h },
          { w: CW, h: CH },
          "image",
          flushSnap
        );
        setOvPos({ x: snapResult.x, y: snapResult.y });
        setSnapLines(snapResult.snapLines);
      } else if (txt) {
        const newPos = { x: txtPos.x + dx, y: txtPos.y + dy };
        const { w, h } = measureTextPx(
          txt,
          txtSize,
          txtFontFamily,
          txtFontWeight
        );
        const snapResult = snapSmart(
          newPos,
          { w, h },
          { w: CW, h: CH },
          "text",
          flushSnap
        );
        setTxtPos({ x: snapResult.x, y: snapResult.y });
        setSnapLines(snapResult.snapLines);
      }

      // Add to undo history
      pushSnap();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    stage,
    ovUrl,
    ovPos,
    ovScale,
    ovAR,
    txt,
    txtPos,
    txtSize,
    txtFontFamily,
    txtFontWeight,
    flushSnap,
    CW,
    CH,
    pushSnap,
  ]);

  function onBaseFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        setImgUrl(img.src);
        // fit image to canvas
        const s = Math.max(CW / img.width, CH / img.height);
        setScale(s);
        setMinScale(s);
        setOffset({ x: CW / 2, y: CH / 2 });
        setStage("edit");
        pushSnap();

        // Track file upload
        trackFirstFileUpload("thumbnail-tool", "image");
        trackActivity("file_upload");
        trackToolUse("thumbnail-tool", "image_upload", {
          aspect,
          fileType: f.type,
        });

        logEvent("load", { type: "image", aspect });
      };
      img.src = url;
    } else if (f.type.startsWith("video/")) {
      const url = URL.createObjectURL(f);
      const v = videoRef.current!;
      v.src = url;
      v.onloadeddata = () => {
        v.currentTime = 0;
        setStage("pick");

        // Track video upload
        trackFirstFileUpload("thumbnail-tool", "video");
        trackActivity("file_upload");
        trackToolUse("thumbnail-tool", "video_upload", { fileType: f.type });
      };
    }
  }

  function captureFrameFromVideo() {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    const temp = document.createElement("canvas");
    temp.width = v.videoWidth;
    temp.height = v.videoHeight;
    const tctx = temp.getContext("2d")!;
    tctx.drawImage(v, 0, 0);
    const dataUrl = temp.toDataURL("image/jpeg", 0.98);
    setImgUrl(dataUrl);
    const s = Math.max(CW / temp.width, CH / temp.height);
    setScale(s);
    setMinScale(s);
    setOffset({ x: CW / 2, y: CH / 2 });
    setStage("edit");
    pushSnap();

    // Track frame capture
    trackActivity("frame_capture");
    trackToolUse("thumbnail-tool", "frame_capture", { aspect });
  }

  function onOverlayFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      setOvUrl(img.src);
      setOvAR(img.width / img.height);
      setOvScale(1);
      setOvPos({ x: CW - 200, y: CH - 200 });
      pushSnap();
    };
    img.src = url;
  }

  function draw() {
    const c = canvasRef.current;
    if (!c || !imgUrl) return;
    c.width = CW;
    c.height = CH;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);

    // base
    const img = new Image();
    img.onload = () => {
      const w = img.width * scale;
      const h = img.height * scale;
      const x = offset.x - w / 2;
      const y = offset.y - h / 2;
      ctx.drawImage(img, x, y, w, h);

      // overlay
      if (ovUrl) {
        const ov = new Image();
        ov.onload = () => {
          ctx.save();
          ctx.globalAlpha = ovAlpha;
          let ow = ov.width * ovScale;
          let oh = ov.height * ovScale;
          if (ovAR) {
            // bound overlay within canvas 50%
            const maxW = CW * 0.5,
              maxH = CH * 0.5;
            if (ow > maxW) {
              ow = maxW;
              oh = ow / ovAR;
            }
            if (oh > maxH) {
              oh = maxH;
              ow = oh * ovAR;
            }
          }
          ctx.drawImage(ov, ovPos.x - ow / 2, ovPos.y - oh / 2, ow, oh);
          ctx.restore();
          // text after overlay
          drawTextAndWatermark(ctx);
        };
        ov.src = ovUrl;
      } else {
        // text + watermark
        drawTextAndWatermark(ctx);
      }
    };
    img.src = imgUrl;
  }

  function drawTextAndWatermark(ctx: CanvasRenderingContext2D) {
    // text
    if (txt && txtSize > 0) {
      ctx.save();
      ctx.globalAlpha = txtAlpha;
      ctx.font = `${txtFontWeight} ${txtSize}px ${txtFontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (txtStrokeW > 0) {
        ctx.lineWidth = txtStrokeW;
        ctx.strokeStyle = txtStroke;
        ctx.strokeText(txt, txtPos.x, txtPos.y);
      }
      ctx.fillStyle = txtFill;
      ctx.fillText(txt, txtPos.x, txtPos.y);
      ctx.restore();
    }
    // watermark preview - enforce for Free plan
    if (shouldShowWatermark) drawWatermark(ctx, CW, CH);

    // Draw snap lines
    drawSnapLines(ctx, snapLines, { w: CW, h: CH });
  }

  function onWheel(e: React.WheelEvent) {
    if (!imgUrl) return;
    const delta = -e.deltaY;
    const k = delta > 0 ? 1.05 : 0.95;
    setScale((s) => clamp(s * k, minScale, minScale * 6));
  }

  function onPointerDown(e: React.PointerEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CW;
    const y = ((e.clientY - rect.top) / rect.height) * CH;
    dragStart.current = { x, y };
    saved.current = { x: offset.x, y: offset.y };

    // hit test overlay first
    if (ovUrl) {
      const ow = (ovAR ? CH * 0.5 * ovAR : 200) * ovScale; // rough
      const oh = (ovAR ? CH * 0.5 : 200) * ovScale;
      if (
        x >= ovPos.x - ow / 2 &&
        x <= ovPos.x + ow / 2 &&
        y >= ovPos.y - oh / 2 &&
        y <= ovPos.y + oh / 2
      ) {
        dragging.current = "overlay";
        return;
      }
    }
    // text hit box
    const tbox = measureTextPx(txt, txtSize, txtFontFamily, txtFontWeight);
    if (
      x >= txtPos.x - tbox.w / 2 &&
      x <= txtPos.x + tbox.w / 2 &&
      y >= txtPos.y - tbox.h / 2 &&
      y <= txtPos.y + tbox.h / 2
    ) {
      dragging.current = "text";
      return;
    }
    // otherwise base
    dragging.current = "base";
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !dragStart.current) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CW;
    const y = ((e.clientY - rect.top) / rect.height) * CH;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;

    if (dragging.current === "base" && saved.current) {
      setOffset({ x: saved.current.x + dx, y: saved.current.y + dy });
    } else if (dragging.current === "overlay") {
      const newPos = { x: ovPos.x + dx, y: ovPos.y + dy };
      setOvPos(newPos);

      // Check for snap lines during drag
      const w = CH * 0.5 * (ovAR || 1) * ovScale;
      const h = CH * 0.5 * (ovAR ? 1 : 1) * ovScale;
      const snapResult = snapSmart(
        newPos,
        { w, h },
        { w: CW, h: CH },
        "image",
        flushSnap
      );
      setSnapLines(snapResult.snapLines);
    } else if (dragging.current === "text") {
      const newPos = { x: txtPos.x + dx, y: txtPos.y + dy };
      setTxtPos(newPos);

      // Check for snap lines during drag
      const { w, h } = measureTextPx(
        txt,
        txtSize,
        txtFontFamily,
        txtFontWeight
      );
      const snapResult = snapSmart(
        newPos,
        { w, h },
        { w: CW, h: CH },
        "text",
        flushSnap
      );
      setSnapLines(snapResult.snapLines);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const flush = e.altKey || flushSnap;
    if (dragging.current === "overlay") {
      const w = CH * 0.5 * (ovAR || 1) * ovScale;
      const h = CH * 0.5 * (ovAR ? 1 : 1) * ovScale;
      const snapResult = snapSmart(
        ovPos,
        { w, h },
        { w: CW, h: CH },
        "image",
        flush
      );
      setOvPos({ x: snapResult.x, y: snapResult.y });
    }
    if (dragging.current === "text") {
      const { w, h } = measureTextPx(
        txt,
        txtSize,
        txtFontFamily,
        txtFontWeight
      );
      const snapResult = snapSmart(
        txtPos,
        { w, h },
        { w: CW, h: CH },
        "text",
        flush
      );
      setTxtPos({ x: snapResult.x, y: snapResult.y });
    }

    // Clear snap lines
    setSnapLines({});

    dragging.current = null;
    dragStart.current = null;
    saved.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    pushSnap();
  }

  async function exportUnder2MB() {
    const src = canvasRef.current!;
    if (!src) return;

    // Check watermark requirements
    if (!canRemoveWatermark() && !wmOn) {
      trackPremiumFeatureAttempt("watermark_removal", plan);
      alert(
        "Removing watermark requires Pro or Plus plan. Upgrade to export without watermark."
      );
      return;
    }

    // Check usage caps for free plan
    if (!hasUnlimitedExports()) {
      const exportCount = parseInt(
        localStorage.getItem("forge_export_count") || "0"
      );
      const maxExports = 5; // Free plan limit

      if (exportCount >= maxExports) {
        trackPremiumFeatureAttempt("unlimited_exports", plan);
        alert(
          `Free plan allows only ${maxExports} exports. Upgrade to Pro or Plus for unlimited exports.`
        );
        return;
      }

      // Increment export count
      localStorage.setItem("forge_export_count", (exportCount + 1).toString());
    }

    // Determine if watermark should be included in export
    const shouldIncludeWatermark = shouldShowWatermark;

    // Track successful export
    trackActivation("thumbnail_export", {
      aspect,
      hasWatermark: shouldIncludeWatermark,
      plan,
    });
    trackActivity("export");
    trackToolUse("thumbnail-tool", "export", {
      aspect,
      hasWatermark: shouldIncludeWatermark,
      plan,
    });

    logEvent("export", { aspect, hasWatermark: shouldIncludeWatermark, plan });
    const out = document.createElement("canvas");
    out.width = CW;
    out.height = CH;
    const octx = out.getContext("2d")!;
    octx.drawImage(src, 0, 0);

    // Add watermark to export if needed
    if (shouldIncludeWatermark) {
      drawWatermark(octx, CW, CH);
    }

    // JPEG quality ramp-down for ≤ 2 MB
    let q = 0.95;
    let blob: Blob | null = null;
    for (let i = 0; i < 10; i++) {
      const b = await new Promise<Blob | null>((res) =>
        out.toBlob((bb) => res(bb), "image/jpeg", q)
      );
      if (!b) break;
      if (b.size <= 2_000_000) {
        blob = b;
        break;
      }
      q *= 0.8;
    }
    if (!blob) {
      // final attempt PNG (may exceed)
      blob = (await new Promise<Blob | null>((res) =>
        out.toBlob((bb) => res(bb), "image/png")
      )) as Blob;
    }
    if (!blob) return;

    // Store the blob and show the export modal
    setExportedBlob(blob);
    setShowExportModal(true);
  }

  function handleDownloadAgain() {
    if (!exportedBlob) return;

    // Track content share/download
    trackContentShare("download", "thumbnail-tool");
    trackActivity("download_again");

    const url = URL.createObjectURL(exportedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thumbnail.jpg";
    a.click();
    URL.revokeObjectURL(url);
  }

  function startOver() {
    setImgUrl("");
    setOvUrl("");
    setTxt("YOUR TITLE");
    setTxtPos({ x: CW / 2, y: Math.round(CH * 0.16) });
    setScale(1);
    setMinScale(1);
    setOffset({ x: CW / 2, y: CH / 2 });
    setStage("pick");
    pushSnap();
  }

  function handlePresetSelect(preset: TextPreset) {
    applyTextPreset(preset, {
      setTxtSize,
      setTxtFill,
      setTxtStroke,
      setTxtStrokeW,
      setTxtAlpha,
      setTxtFontFamily,
      setTxtFontWeight,
    });
    pushSnap(); // Add to undo/redo history
  }

  /** ===== UI ===== */
  return (
    <div className="p-4 space-y-4 text-white">
      <div className="flex items-center gap-3 flex-wrap">
        <label htmlFor="aspect-select" className="text-sm text-text-primary">
          Aspect
        </label>
        <select
          id="aspect-select"
          className="border rounded px-2 py-1 bg-bg-secondary text-text-primary"
          value={aspect}
          onChange={(e) => setAspect(e.target.value as Aspect)}
          aria-describedby="aspect-help"
        >
          <option value="16:9">16:9 (YouTube, Landscape)</option>
          <option value="9:16">9:16 (TikTok, Instagram Stories)</option>
          <option value="1:1">1:1 (Instagram Post, Square)</option>
        </select>
        <span id="aspect-help" className="sr-only">
          Choose the aspect ratio for your thumbnail
        </span>

        {stage === "edit" && (
          <UndoRedoBar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
        )}

        <label
          htmlFor="flush-snap"
          className="ml-4 inline-flex items-center gap-2 text-sm text-text-primary"
        >
          <input
            id="flush-snap"
            type="checkbox"
            checked={flushSnap}
            onChange={(e) => setFlushSnap(e.target.checked)}
            aria-describedby="flush-snap-help"
          />
          Flush snap
          <span id="flush-snap-help" className="sr-only">
            Enable flush snap to align elements to canvas edges
          </span>
        </label>

        <div className="text-xs text-neutral-400 ml-4">
          Nudge: Arrow keys (1px) | Shift+Arrow (10px)
        </div>

        <div className="ml-auto">
          <PlanSelector />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="base-file" className="block text-sm text-text-primary">
          Upload base image or video
        </label>
        <input
          id="base-file"
          type="file"
          accept="image/*,video/*"
          onChange={onBaseFile}
          aria-describedby="base-file-help"
        />
        <div id="base-file-help" className="text-sm text-text-muted">
          Upload an image file or video to create your thumbnail. For videos,
          you can capture a frame.
        </div>
        {stage === "pick" && videoRef.current?.src && (
          <button
            className="px-3 py-1 rounded bg-neutral-700 text-text-primary hover:bg-neutral-600"
            onClick={captureFrameFromVideo}
            aria-describedby="capture-help"
          >
            Capture frame
            <span id="capture-help" className="sr-only">
              Capture current video frame as thumbnail base
            </span>
          </button>
        )}
      </div>

      {stage === "edit" && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label
                htmlFor="zoom-slider"
                className="text-sm text-text-primary"
              >
                Zoom
              </label>
              <input
                id="zoom-slider"
                type="range"
                min={minScale}
                max={minScale * 6}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                aria-describedby="zoom-help"
              />
              <span id="zoom-help" className="sr-only">
                Adjust zoom level from {minScale.toFixed(2)}x to{" "}
                {(minScale * 6).toFixed(2)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="overlay-file"
                className="px-2 py-1 rounded bg-neutral-700 cursor-pointer text-text-primary hover:bg-neutral-600"
              >
                Choose overlay
                <input
                  id="overlay-file"
                  type="file"
                  accept="image/*"
                  onChange={onOverlayFile}
                  className="hidden"
                  aria-describedby="overlay-file-help"
                />
              </label>
              <span id="overlay-file-help" className="sr-only">
                Upload an overlay image to add to your thumbnail
              </span>
              <span className="opacity-70 text-sm text-text-muted">
                {ovUrl ? "Overlay loaded" : "No overlay"}
              </span>
              <label
                htmlFor="overlay-size"
                className="text-sm text-text-primary"
              >
                Overlay size
              </label>
              <input
                id="overlay-size"
                type="range"
                min={0.2}
                max={3}
                step={0.01}
                value={ovScale}
                onChange={(e) => setOvScale(parseFloat(e.target.value))}
                aria-describedby="overlay-size-help"
              />
              <span id="overlay-size-help" className="sr-only">
                Adjust overlay size from 0.2x to 3x
              </span>
              <label
                htmlFor="overlay-opacity"
                className="text-sm text-text-primary"
              >
                Overlay opacity
              </label>
              <input
                id="overlay-opacity"
                type="range"
                min={0.05}
                max={1}
                step={0.01}
                value={ovAlpha}
                onChange={(e) => setOvAlpha(parseFloat(e.target.value))}
                aria-describedby="overlay-opacity-help"
              />
              <span id="overlay-opacity-help" className="sr-only">
                Adjust overlay opacity from 5% to 100%
              </span>
            </div>
          </div>

          <div
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ width: CW, maxWidth: "100%" }}
          >
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              style={{
                width: "100%",
                touchAction: "none",
                border: "1px solid #555",
                background: "#000",
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label htmlFor="text-input" className="sr-only">
                Text content
              </label>
              <input
                id="text-input"
                className="px-2 py-1 rounded bg-neutral-800"
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                placeholder="YOUR TITLE"
              />
            </div>

            {/* Text Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Presets</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {getAvailablePresets(hasPremiumPresets()).map((preset) => {
                  const isPremium = preset.isPremium;
                  const isLocked = isPremium && !hasPremiumPresets();

                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (isLocked) {
                          trackPremiumFeatureAttempt("premium_preset", plan);
                          alert(
                            "This preset requires Pro or Plus plan. Upgrade to access premium presets."
                          );
                          return;
                        }
                        handlePresetSelect(preset);
                        trackActivity("preset_selection");
                        trackToolUse("thumbnail-tool", "preset_apply", {
                          presetId: preset.id,
                        });
                      }}
                      className={`px-3 py-2 rounded transition-colors text-left ${
                        isLocked
                          ? "bg-neutral-800 cursor-not-allowed opacity-60"
                          : "bg-neutral-700 hover:bg-neutral-600"
                      }`}
                      title={
                        isLocked
                          ? `${preset.description} (Pro/Plus only)`
                          : preset.description
                      }
                      disabled={isLocked}
                    >
                      <div className="text-xs font-medium truncate flex items-center gap-1">
                        {preset.name}
                        {isLocked && (
                          <span className="text-yellow-400">🔒</span>
                        )}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="text-size" className="text-sm text-text-primary">
                Size
              </label>
              <input
                id="text-size"
                type="range"
                min={16}
                max={200}
                step={1}
                value={txtSize}
                onChange={(e) => setTxtSize(parseInt(e.target.value))}
                aria-describedby="text-size-help"
              />
              <span id="text-size-help" className="sr-only">
                Adjust text size from 16px to 200px
              </span>
              <label
                htmlFor="text-opacity"
                className="text-sm text-text-primary"
              >
                Opacity
              </label>
              <input
                id="text-opacity"
                type="range"
                min={0.05}
                max={1}
                step={0.01}
                value={txtAlpha}
                onChange={(e) => setTxtAlpha(parseFloat(e.target.value))}
                aria-describedby="text-opacity-help"
              />
              <span id="text-opacity-help" className="sr-only">
                Adjust text opacity from 5% to 100%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="text-stroke"
                className="text-sm text-text-primary"
              >
                Stroke
              </label>
              <input
                id="text-stroke"
                type="range"
                min={0}
                max={24}
                step={1}
                value={txtStrokeW}
                onChange={(e) => setTxtStrokeW(parseInt(e.target.value))}
                aria-describedby="text-stroke-help"
              />
              <span id="text-stroke-help" className="sr-only">
                Adjust text stroke width from 0px to 24px
              </span>
              <label htmlFor="text-stroke-color" className="sr-only">
                Stroke color
              </label>
              <input
                id="text-stroke-color"
                type="color"
                value={txtStroke}
                onChange={(e) => setTxtStroke(e.target.value)}
                aria-label="Text stroke color"
              />
              <label htmlFor="text-fill" className="text-sm text-text-primary">
                Fill
              </label>
              <label htmlFor="text-fill-color" className="sr-only">
                Fill color
              </label>
              <input
                id="text-fill-color"
                type="color"
                value={txtFill}
                onChange={(e) => setTxtFill(e.target.value)}
                aria-label="Text fill color"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1 rounded bg-neutral-700"
                onClick={exportUnder2MB}
                title={
                  !hasUnlimitedExports()
                    ? `Exports remaining: ${Math.max(
                        0,
                        5 -
                          parseInt(
                            localStorage.getItem("forge_export_count") || "0"
                          )
                      )}`
                    : "Unlimited exports"
                }
              >
                Export ≤ 2 MB
                {!hasUnlimitedExports() && (
                  <span className="ml-1 text-xs opacity-70">
                    (
                    {Math.max(
                      0,
                      5 -
                        parseInt(
                          localStorage.getItem("forge_export_count") || "0"
                        )
                    )}{" "}
                    left)
                  </span>
                )}
              </button>
              <button
                className="px-3 py-1 rounded bg-neutral-700"
                onClick={startOver}
              >
                Start Over
              </button>
              <label
                htmlFor="watermark-toggle"
                className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded transition-colors ${
                  canRemoveWatermark()
                    ? "bg-neutral-700 cursor-pointer hover:bg-neutral-600 text-text-primary"
                    : "bg-neutral-800 cursor-not-allowed opacity-60 text-text-muted"
                }`}
                title={
                  !canRemoveWatermark()
                    ? "Upgrade to Pro to remove watermark"
                    : "Toggle watermark visibility"
                }
              >
                <input
                  id="watermark-toggle"
                  type="checkbox"
                  checked={wmOn}
                  disabled={!canRemoveWatermark()}
                  onChange={(e) => {
                    if (canRemoveWatermark()) {
                      setWmOn(e.target.checked);
                      logEvent("watermark_toggle", {
                        enabled: e.target.checked,
                        plan,
                      });
                    } else {
                      // For Free plan, show upgrade message if they try to toggle
                      trackPremiumFeatureAttempt("watermark_removal", plan);
                    }
                  }}
                  className="rounded"
                  aria-describedby="watermark-help"
                />
                Remove watermark {!canRemoveWatermark() && "(Upgrade to Pro)"}
                <span id="watermark-help" className="sr-only">
                  {canRemoveWatermark()
                    ? "Toggle watermark visibility on exported thumbnails"
                    : "Watermark removal requires Pro or Plus plan"}
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Hidden video element for frame capture if needed */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownload={handleDownloadAgain}
      />
    </div>
  );
}
