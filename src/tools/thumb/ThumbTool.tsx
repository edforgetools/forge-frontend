import { useEffect, useRef, useState } from "react";

type Stage = "pick" | "capture" | "edit";
type EditTab = "base" | "overlay" | "text";

const CW = 1280;
const CH = 720;
const EDGE_PAD_IMG = 40;   // default gutter for image overlays
const EDGE_PAD_TXT = 64;   // default gutter for text
const SNAP_TOL = 28;       // snap distance in canvas px
const TS_SAFE = { right: 140, bottom: 80 }; // YouTube duration badge area

export default function ThumbTool() {
  const [stage, setStage] = useState<Stage>("pick");
  const [tab, setTab] = useState<EditTab>("base");

  // video + captured frame
  const [videoUrl, setVideoUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  // base image transform (fit 1280x720)
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // image overlay
  const [ovUrl, setOvUrl] = useState("");
  const [ovScale, setOvScale] = useState(1);
  const [ovPos, setOvPos] = useState({ x: CW / 2, y: CH / 2 });
  const [ovAlpha, setOvAlpha] = useState(1);
  const [ovAR, setOvAR] = useState<number | null>(null); // h/w

  // text overlay
  const [txt, setTxt] = useState("YOUR TITLE");
  const [txtPos, setTxtPos] = useState({ x: CW / 2, y: 120 });
  const [txtSize, setTxtSize] = useState(96);
  const [txtAlpha, setTxtAlpha] = useState(1);
  const [txtStrokeW, setTxtStrokeW] = useState(6);
  const [txtFill, setTxtFill] = useState("#ffffff");
  const [txtStroke, setTxtStroke] = useState("#000000");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<null | "base" | "overlay" | "text">(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const saved = useRef<{ x: number; y: number } | null>(null);

  function measureTextPx(text: string, size: number) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = `bold ${size}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    const w = ctx.measureText(text).width;
    const h = size * 1.2;
    return { w, h };
  }

  function snapSmart(
    center: { x: number; y: number },
    box: { w: number; h: number },
    kind: "image" | "text",
    opts: { flush?: boolean } = {}
  ) {
    const pad = opts.flush ? 0 : kind === "text" ? EDGE_PAD_TXT : EDGE_PAD_IMG;
    const { w, h } = box;

    const leftX = w / 2 + pad;
    const rightX = CW - w / 2 - pad;
    const topY = h / 2 + pad;
    const bottomY = CH - h / 2 - pad;

    const xGuides = [leftX, CW / 2, CW / 3, (2 * CW) / 3, rightX];
    const yGuides = [topY, CH / 2, CH / 3, (2 * CH) / 3, bottomY];

    let { x, y } = center;

    let bestDx = SNAP_TOL + 1;
    for (const gx of xGuides) {
      const d = Math.abs(x - gx);
      if (d < bestDx) {
        bestDx = d;
        x = gx;
      }
    }

    let bestDy = SNAP_TOL + 1;
    for (const gy of yGuides) {
      const d = Math.abs(y - gy);
      if (d < bestDy) {
        bestDy = d;
        y = gy;
      }
    }

    x = Math.max(w / 2, Math.min(CW - w / 2, x));
    y = Math.max(h / 2, Math.min(CH - h / 2, y));

    const wouldHitTS = x + w / 2 > CW - TS_SAFE.right && y + h / 2 > CH - TS_SAFE.bottom;
    if (wouldHitTS) {
      x = CW - TS_SAFE.right - w / 2 - (opts.flush ? 0 : pad);
      y = Math.min(y, CH - TS_SAFE.bottom - h / 2 - (opts.flush ? 0 : pad));
    }

    return { x, y };
  }

  useEffect(() => {
    if (!imgUrl) return;
    const img = new Image();
    img.onload = () => {
      const cover = Math.max(CW / img.width, CH / img.height);
      setMinScale(cover);
      setScale(cover);
      setOffset({ x: (CW - img.width * cover) / 2, y: (CH - img.height * cover) / 2 });
      draw();
    };
    img.src = imgUrl;
  }, [imgUrl]);

  useEffect(() => {
    draw();
  }, [scale, offset, ovUrl, ovScale, ovPos, ovAlpha, ovAR, txt, txtPos, txtSize, txtAlpha, txtStrokeW, txtFill, txtStroke]);

  function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^video\//.test(f.type)) return alert("Pick a video file");
    videoUrl && URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(f));
    setStage("capture");
  }

  function onPickOverlay(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpeg|webp)/.test(f.type)) return alert("Overlay must be PNG/JPEG/WEBP");
    ovUrl && URL.revokeObjectURL(ovUrl);
    const url = URL.createObjectURL(f);
    setOvUrl(url);
    setOvPos({ x: CW / 2, y: CH / 2 });
    setOvScale(1);
    setOvAlpha(1);
    const probe = new Image();
    probe.onload = () => setOvAR(probe.height / probe.width);
    probe.src = url;
  }

  async function captureFrame() {
    const v = videoRef.current!;
    if (!v || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    imgUrl && URL.revokeObjectURL(imgUrl);
    setImgUrl(c.toDataURL("image/jpeg", 0.98));
    setStage("edit");
  }

  function clampOffsets(imgW: number, imgH: number, sc: number) {
    const w = imgW * sc,
      h = imgH * sc;
    let x = offset.x,
      y = offset.y;
    if (x > 0) x = 0;
    if (y > 0) y = 0;
    if (x + w < CW) x = CW - w;
    if (y + h < CH) y = CH - h;
    return { x, y };
  }

  function draw() {
    const c = canvasRef.current;
    if (!c || !imgUrl) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);

    const img = new Image();
    img.onload = () => {
      const pos = clampOffsets(img.width, img.height, scale);
      if (pos.x !== offset.x || pos.y !== offset.y) setOffset(pos);
      ctx.drawImage(img, pos.x, pos.y, img.width * scale, img.height * scale);

      if (ovUrl) {
        const o = new Image();
        o.onload = () => {
          const base = Math.min(c.width, c.height) / 3;
          const ow = base * ovScale;
          const oh = ow * (ovAR ?? o.height / o.width);
          ctx.save();
          ctx.globalAlpha = ovAlpha;
          ctx.drawImage(o, ovPos.x - ow / 2, ovPos.y - oh / 2, ow, oh);
          ctx.restore();
        };
        o.src = ovUrl;
      }

      if (txt && txtSize > 0) {
        ctx.save();
        ctx.globalAlpha = txtAlpha;
        ctx.font = `bold ${txtSize}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
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
    };
    img.src = imgUrl;
  }

  function onWheel(e: React.WheelEvent) {
    if (tab !== "base") return;
    const next = Math.max(minScale, scale + (e.deltaY > 0 ? -0.05 : 0.05));
    setScale(next);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!imgUrl) return;
    const which: EditTab = tab;
    dragging.current = which === "base" ? "base" : which === "overlay" ? "overlay" : "text";
    dragStart.current = { x: e.clientX, y: e.clientY };
    saved.current =
      dragging.current === "base" ? { ...offset } : dragging.current === "overlay" ? { ...ovPos } : { ...txtPos };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !dragStart.current || !saved.current) return;
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const fx = c.width / rect.width;
    const fy = c.height / rect.height;
    const dx = (e.clientX - dragStart.current.x) * fx;
    const dy = (e.clientY - dragStart.current.y) * fy;

    if (dragging.current === "base") setOffset({ x: saved.current.x + dx, y: saved.current.y + dy });
    else if (dragging.current === "overlay") setOvPos({ x: saved.current.x + dx, y: saved.current.y + dy });
    else setTxtPos({ x: saved.current.x + dx, y: saved.current.y + dy });
  }

  function onPointerUp(e: React.PointerEvent) {
    const flush = e.altKey; // Alt/Option = flush to edge
    if (dragging.current === "overlay") {
      const base = Math.min(CW, CH) / 3;
      const ow = base * ovScale;
      const oh = ow * (ovAR ?? 1);
      setOvPos((p) => snapSmart(p, { w: ow, h: oh }, "image", { flush }));
    }
    if (dragging.current === "text") {
      const { w, h } = measureTextPx(txt, txtSize);
      setTxtPos((p) => snapSmart(p, { w, h }, "text", { flush }));
    }
    dragging.current = null;
    dragStart.current = null;
    saved.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  function stamp() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  async function exportUnder2MB() {
    const src = canvasRef.current!;
    if (!src) return;
    const out = document.createElement("canvas");
    out.width = CW;
    out.height = CH;
    out.getContext("2d")!.drawImage(src, 0, 0);
    for (let q = 0.92; q >= 0.5; q -= 0.04) {
      const blob = await new Promise<Blob | null>((r) => out.toBlob((b) => r(b), "image/jpeg", q));
      if (blob && blob.size <= 2_000_000) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `forge_thumb_${stamp()}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    }
    alert("Could not compress to ≤2 MB. Try less zoom or smaller overlays.");
  }

  function startOver() {
    videoUrl && URL.revokeObjectURL(videoUrl);
    ovUrl && URL.revokeObjectURL(ovUrl);
    setVideoUrl("");
    setImgUrl("");
    setOvUrl("");
    setScale(1);
    setMinScale(1);
    setOffset({ x: 0, y: 0 });
    setOvScale(1);
    setOvPos({ x: CW / 2, y: CH / 2 });
    setOvAlpha(1);
    setOvAR(null);
    setTxt("YOUR TITLE");
    setTxtPos({ x: CW / 2, y: 120 });
    setTxtSize(96);
    setTxtAlpha(1);
    setTxtStrokeW(6);
    setTxtFill("#ffffff");
    setTxtStroke("#000000");
    setTab("base");
    setStage("pick");
  }

  return (
    <div className="space-y-4">
      {stage === "pick" && <input type="file" accept="video/*" onChange={onPickVideo} />}

      {stage === "capture" && (
        <div className="space-y-2">
          <video ref={videoRef} src={videoUrl} controls style={{ maxWidth: "100%" }} />
          <button className="btn" onClick={captureFrame}>
            Capture Frame
          </button>
        </div>
      )}

      {stage === "edit" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Edit:</label>
            <button className="btn" onClick={() => setTab("base")} disabled={tab === "base"}>
              Base
            </button>
            <button className="btn" onClick={() => setTab("overlay")} disabled={tab === "overlay"}>
              Image overlay
            </button>
            <button className="btn" onClick={() => setTab("text")} disabled={tab === "text"}>
              Text
            </button>
            <div className="ml-4 text-xs opacity-70">Tip: hold Alt/Option to snap flush to edges.</div>
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
              style={{ width: "100%", touchAction: "none", border: "1px solid #555" }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Base */}
            <div className="flex items-center gap-2">
              <label className="text-sm">Zoom</label>
              <input
                type="range"
                min={minScale}
                max={minScale * 3}
                step={0.01}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                disabled={tab !== "base"}
              />
            </div>

            {/* Image overlay */}
            <div className="flex items-center gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickOverlay} />
              <label className="text-sm">Overlay size</label>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.01}
                value={ovScale}
                onChange={(e) => setOvScale(parseFloat(e.target.value))}
                disabled={!ovUrl || tab !== "overlay"}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm">Overlay opacity</label>
              <input
                className="block w-[240px]"
                type="range"
                min={0.2}
                max={1}
                step={0.01}
                value={ovAlpha}
                onChange={(e) => setOvAlpha(parseFloat(e.target.value))}
                disabled={!ovUrl || tab !== "overlay"}
              />
            </div>

            {/* Text overlay */}
            <div className="flex items-center gap-2 w-full">
              <label className="text-sm">Text</label>
              <input
                className="flex-1 min-w-[220px] border px-2 py-1 bg-transparent"
                value={txt}
                onChange={(e) => setTxt(e.target.value)}
                disabled={tab !== "text"}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Size</label>
              <input
                type="range"
                min={24}
                max={220}
                step={1}
                value={txtSize}
                onChange={(e) => setTxtSize(parseInt(e.target.value))}
                disabled={tab !== "text"}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Opacity</label>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.01}
                value={txtAlpha}
                onChange={(e) => setTxtAlpha(parseFloat(e.target.value))}
                disabled={tab !== "text"}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Stroke</label>
              <input
                type="range"
                min={0}
                max={16}
                step={1}
                value={txtStrokeW}
                onChange={(e) => setTxtStrokeW(parseInt(e.target.value))}
                disabled={tab !== "text"}
              />
              <input type="color" value={txtStroke} onChange={(e) => setTxtStroke(e.target.value)} disabled={tab !== "text"} />
              <label className="text-sm">Fill</label>
              <input type="color" value={txtFill} onChange={(e) => setTxtFill(e.target.value)} disabled={tab !== "text"} />
            </div>

            <button className="btn" onClick={exportUnder2MB}>
              Export ≤2 MB
            </button>
            <button className="btn" onClick={startOver}>
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
