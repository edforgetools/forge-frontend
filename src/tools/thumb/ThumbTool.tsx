import { useEffect, useRef, useState } from "react";

type Stage = "pick" | "capture" | "edit";
export default function ThumbTool() {
  const [stage, setStage] = useState<Stage>("pick");
  const [videoUrl, setVideoUrl] = useState("");   // picked video
  const [imgUrl, setImgUrl] = useState("");       // captured frame

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [ovUrl, setOvUrl] = useState("");
  const [ovScale, setOvScale] = useState(1);
  const [ovPos, setOvPos] = useState({ x: 960, y: 540 });

  const [editMode, setEditMode] = useState<"base" | "overlay">("base");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<null | "base" | "overlay">(null);
  const dragStart = useRef<{x:number;y:number}|null>(null);
  const saved = useRef<{x:number;y:number}|null>(null);

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

  useEffect(() => { draw(); }, [scale, offset, ovUrl, ovScale, ovPos]);

  function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/^video\//.test(f.type)) return alert("Pick a video file");
    setVideoUrl(URL.createObjectURL(f));
    setStage("capture");
  }

  function onPickOverlay(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (!/image\/(png|jpeg|webp)/.test(f.type)) return alert("Overlay must be PNG/JPEG/WEBP");
    setOvUrl(URL.createObjectURL(f));
  }

  async function captureFrame() {
    const v = videoRef.current!;
    if (!v || v.readyState < 2) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    setImgUrl(c.toDataURL("image/jpeg", 0.98));
    setStage("edit");
  }

  function clampOffsets(imgW:number,imgH:number,sc:number) {
    const w = imgW * sc, h = imgH * sc;
    let { x, y } = offset;
    if (x > 0) x = 0; if (y > 0) y = 0;
    if (x + w < 1280) x = 1280 - w;
    if (y + h < 720)  y = 720 - h;
    return { x, y };
  }

  function draw() {
    const c = canvasRef.current; if (!c || !imgUrl) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0,0,c.width,c.height);
    const img = new Image();
    img.onload = () => {
      const pos = clampOffsets(img.width, img.height, scale);
      if (pos.x!==offset.x || pos.y!==offset.y) setOffset(pos);
      ctx.drawImage(img, pos.x, pos.y, img.width*scale, img.height*scale);
      if (ovUrl) {
        const o = new Image();
        o.onload = () => {
          const base = Math.min(c.width, c.height) / 3;
          const ow = base * ovScale;
          const oh = (o.height / o.width) * ow;
          ctx.drawImage(o, ovPos.x - ow/2, ovPos.y - oh/2, ow, oh);
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
    dragging.current = editMode==="overlay" ? "overlay" : "base";
    dragStart.current = { x: e.clientX, y: e.clientY };
    saved.current = dragging.current==="overlay" ? { ...ovPos } : { ...offset };
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || !dragStart.current || !saved.current) return;
    const dx = e.clientX - dragStart.current.x, dy = e.clientY - dragStart.current.y;
    dragging.current === "base"
      ? setOffset({ x: saved.current.x + dx, y: saved.current.y + dy })
      : setOvPos({ x: saved.current.x + dx, y: saved.current.y + dy });
  }
  function onPointerUp(e: React.PointerEvent) {
    dragging.current = null; dragStart.current = null; saved.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  async function exportUnder2MB() {
    const src = canvasRef.current!; const out = document.createElement("canvas");
    out.width = 1280; out.height = 720; out.getContext("2d")!.drawImage(src, 0, 0);
    for (let q=0.92; q>=0.5; q-=0.04) {
      const blob = await new Promise<Blob|null>(r=>out.toBlob(b=>r(b),"image/jpeg",q));
      if (blob && blob.size <= 2_000_000) {
        const url = URL.createObjectURL(blob); const a = document.createElement("a");
        a.href = url; a.download = "forge_thumb.jpg"; a.click(); URL.revokeObjectURL(url); return;
      }
    }
    alert("Could not compress to ≤2 MB. Try less zoom or a smaller overlay.");
  }

  return (
    <div className="space-y-4">
      {stage==="pick" && <input type="file" accept="video/*" onChange={onPickVideo} />}
      {stage==="capture" && (
        <div className="space-y-2">
          <video ref={videoRef} src={videoUrl} controls style={{ maxWidth: "100%" }} />
          <button className="btn" onClick={captureFrame}>Capture Frame</button>
        </div>
      )}
      {stage==="edit" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Edit:</label>
            <button className="btn" onClick={()=>setEditMode("base")} disabled={editMode==="base"}>Base</button>
            <button className="btn" onClick={()=>setEditMode("overlay")} disabled={editMode==="overlay"}>Overlay</button>
            <div className="ml-4 text-xs opacity-70">Canvas is fixed 1280×720.</div>
          </div>
          <div
            onWheel={onWheel} onPointerDown={onPointerDown}
            onPointerMove={onPointerMove} onPointerUp={onPointerUp}
            style={{ width: 1280, maxWidth: "100%" }}
          >
            <canvas ref={canvasRef} width={1280} height={720}
              style={{ width:"100%", touchAction:"none", border:"1px solid #555" }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm">Zoom</label>
              <input type="range" min={minScale} max={minScale*3} step={0.01}
                     value={scale} onChange={(e)=>setScale(parseFloat(e.target.value))}
                     disabled={editMode!=="base"} />
            </div>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onPickOverlay} />
              <label className="text-sm">Overlay size</label>
              <input type="range" min={0.3} max={3} step={0.01}
                     value={ovScale} onChange={(e)=>setOvScale(parseFloat(e.target.value))}/>
            </div>
            <button className="btn" onClick={exportUnder2MB}>Export ≤2 MB</button>
            <button className="btn" onClick={()=>setStage("pick")}>Start Over</button>
          </div>
        </div>
      )}
    </div>
  );
}
