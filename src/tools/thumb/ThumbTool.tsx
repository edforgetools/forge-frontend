import { useEffect, useRef, useState } from "react";

type Stage = "pick" | "capture" | "edit";

export default function ThumbTool() {
  const [stage, setStage] = useState<Stage>("pick");

  // video + captured frame
  const [videoUrl, setVideoUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  // base image transform (fit 1280x720)
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // overlay
  const [ovUrl, setOvUrl] = useState("");
  const [ovScale, setOvScale] = useState(1);
  const [ovPos, setOvPos] = useState({ x: 640, y: 360 }); // canvas center
  const [ovAlpha, setOvAlpha] = useState(1);
  const [ovAR, setOvAR] = useState<number | null>(null);   // overlay aspect ratio (h/w)

  const [editMode, setEditMode] = useState<"base" | "overlay">("base");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<null | "base" | "overlay">(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const saved = useRef<{ x: number; y: number } | null>(null);

  // init transforms after capture
  useEffect(() => {
    if (!imgUrl) return;
    const img = new Image();
    img.onload = () => {
      const cover = Math.max(1280 / img.width, 720 / img.height);
      setMinScale(cover);
      setScale(cover);
      setOffset({ x: (1280 - img.width * cover) / 2, y: (720 - img.height * cover) / 2 });
      draw();
    };
    img.src = imgUrl;
  }, [imgUrl]);

  // redraw on state change
  useEffect(() => {
    draw();
  }, [scale, offset, ovUrl, ovScale, ovPos, ovAlpha]);

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
    setOvPos({ x: 640, y: 360 });
    setOvScale(1);
    setOvAlpha(1);
    // read aspect ratio once
    const probe = new Image();
    probe.onload = () => setOvAR(probe.height / probe.width);
    probe.src = url;
  }

  async function captureFrame() {
    const v = videoRef.current!;
    if (!v || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    imgUrl && URL.revokeObjectURL(imgUrl);
    setImgUrl(c.toDataURL("image/jpeg", 0.98));
    setStage("edit");
  }

  function clampOffsets(imgW: number, imgH: number, sc: number) {
    const w = imgW * sc, h = imgH * sc;
    let x = offset.x, y = offset.y;
    if (x > 0) x = 0;
    if (y > 0) y = 0;
    if (x + w < 1280) x = 1280 - w;
    if (y + h < 720)  y = 720 - h;
    return { x, y };
  }

  function draw() {
    const c = canvasRef.current; if (!c || !imgUrl) return;
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
    };
    img.src = imgUrl;
  }

  function onWheel(e: React.WheelEvent) {
    if (editMode === "overlay") return;
    const next = Math.max(minScale, scale + (e.deltaY > 0 ? -0.05 : 0.05));
    setScale(next);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!imgUrl) return;
    dragging.current = editMode === "overlay" ? "overlay" : "base";
    dragStart.current = { x: e.clientX, y: e.clientY };
    saved.current  = dragging.current === "overlay" ? { ...ovPos } : { ...offset };
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

    if (dragging.current === "base") {
      setOffset({ x: saved.current.x + dx, y: saved.current.y + dy });
    } else {
      setOvPos({ x: saved.current.x + dx, y: saved.current.y + dy });
    }
  }

  function snapOverlay(center: { x: number; y: number }) {
  const CW = 1280, CH = 720;          // canvas size
  const base = Math.min(CW, CH) / 3;  // same base used in draw()
  const ow = base * ovScale;
  const oh = ow * (ovAR ?? 1);

  let { x, y } = center;
  const tol = 24; // snap distance in canvas px

  // snap X to left/right edges (overlay box flush with canvas)
  if (Math.abs(x - ow / 2) < tol) x = ow / 2;                // left edge
  if (Math.abs(CW - (x + ow / 2)) < tol) x = CW - ow / 2;    // right edge

  // snap Y to top/bottom edges
  if (Math.abs(y - oh / 2) < tol) y = oh / 2;                // top edge
  if (Math.abs(CH - (y + oh / 2)) < tol) y = CH - oh / 2;    // bottom edge

  return { x, y };
}

  function onPointerUp(e: React.PointerEvent) {
    if (dragging.current === "overlay") setOvPos((p) => snapOverlay(p));
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
    const src = canvasRef.current!; if (!src) return;
    const out = document.createElement("canvas");
    out.width = 1280; out.height = 720;
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
    alert("Could not compress to ≤2 MB. Try less zoom or a smaller overlay.");
  }

  function startOver() {
    videoUrl && URL.revokeObjectURL(videoUrl);
    ovUrl && URL.revokeObjectURL(ovUrl);
    setVideoUrl(""); setImgUrl(""); setOvUrl("");
    setScale(1); setMinScale(1); setOffset({ x: 0, y: 0 });
    setOvScale(1); setOvPos({ x: 640, y: 360 }); setOvAlpha(1); setOvAR(null);
    setEditMode("base");
    setStage("pick");
  }

  return (
    <div className="space-y-4">
      {stage === "pick" && <input type="file" accept="video/*" onChange={onPickVideo} />}

      {stage === "capture" && (
        <div className="space-y-2">
          <video ref={videoRef} src={videoUrl} controls style={{ maxWidth: "100%" }} />
          <button className="btn" onClick={captureFrame}>Capture Frame</button>
        </div>
      )}

      {stage === "edit" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Edit:</label>
            <button className="btn" onClick={() => setEditMode("base")} disabled={editMode === "base"}>Base</button>
            <button className="btn" onClick={() => setEditMode("overlay")} disabled={editMode === "overlay"}>Overlay</button>
            <div className="ml-4 text-xs opacity-70">Canvas 1280×720.</div>
          </div>

          <div
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ width: 1280, maxWidth: "100%" }}
          >
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              style={{ width: "100%", touchAction: "none", border: "1px solid #555" }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm">Zoom</label>
              <input type="range" min={minScale} max={minScale * 3} step={0.01}
                     value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))}
                     disabled={editMode !== "base"} />
            </div>

            <div className="flex items-center gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickOverlay} />
              <label className="text-sm">Overlay size</label>
              <input type="range" min={0.3} max={3} step={0.01}
                     value={ovScale} onChange={(e)=>setOvScale(parseFloat(e.target.value))}
                     disabled={!ovUrl} />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm">Overlay opacity</label>
              <input className="block w-[240px]" type="range" min={0.2} max={1} step={0.01}
                     value={ovAlpha} onChange={(e)=>setOvAlpha(parseFloat(e.target.value))}
                     disabled={!ovUrl} />
            </div>

            <button className="btn" onClick={exportUnder2MB}>Export ≤2 MB</button>
            <button className="btn" onClick={startOver}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}
