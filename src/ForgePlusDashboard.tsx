import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";

type Tone = "default" | "hype" | "educational";

const LS_KEY = "forge_v1_state_v2";
type Persist = { transcript: string; tweet: string; instagram: string; tone: Tone };

export default function ForgePlusDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [tweet, setTweet] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tone, setTone] = useState<Tone>("default");
  const [busy, setBusy] = useState<null | "transcribe" | "captions" | "zip">(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Persist;
        setTranscript(s.transcript || "");
        setTweet(s.tweet || "");
        setInstagram(s.instagram || "");
        setTone(s.tone || "default");
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const s: Persist = { transcript, tweet, instagram, tone };
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }, 300);
    return () => clearTimeout(t);
  }, [transcript, tweet, instagram, tone]);

  const canTranscribe = useMemo(() => !!file, [file]);
  const canCaption = useMemo(() => transcript.trim().length > 0, [transcript]);
  const canZip = useMemo(() => tweet.trim() && instagram.trim(), [tweet, instagram]);

  function validateFile(f: File) {
    const okType = /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
    const okSize = f.size <= 1_000_000_000;
    if (!okType) return "Unsupported file type. Use MP4/MOV/WebM.";
    if (!okSize) return "File too large. Max 1 GB.";
    return null;
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const v = validateFile(f);
    if (v) { setFile(null); setErr(v); return; }
    setFile(f);
  }

  async function transcribe() {
    if (!file) return;
    setBusy("transcribe"); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(api("/api/transcribe"), { method: "POST", body: fd });
      if (!r.ok) { const msg = await r.text(); throw new Error(`Transcribe failed: ${r.status} ${msg}`); }
      const j = await r.json();
      setTranscript(j.transcript || ""); setTweet(""); setInstagram("");
    } catch (e: any) { setErr(e.message || "Transcription error"); }
    finally { setBusy(null); }
  }

  async function genCaptions() {
    setBusy("captions"); setErr(null);
    try {
      const r = await fetch(api("/api/captions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, tone }),
      });
      if (!r.ok) { const msg = await r.text(); throw new Error(`Captions failed: ${r.status} ${msg}`); }
      const j = await r.json();
      setTweet(j.tweet || ""); setInstagram(j.instagram || "");
    } catch (e: any) { setErr(e.message || "Captions error"); }
    finally { setBusy(null); }
  }

  async function downloadZip() {
    setBusy("zip"); setErr(null);
    try {
      const r = await fetch(api("/api/exportZip"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, tweet, instagram }),
      });
      if (!r.ok) { const msg = await r.text(); throw new Error(`Export failed: ${r.status} ${msg}`); }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "forge_export.zip"; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setErr(e.message || "Export error"); }
    finally { setBusy(null); }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "enter" && transcript.trim()) { e.preventDefault(); genCaptions(); }
      if (meta && e.key.toLowerCase() === "s" && tweet.trim() && instagram.trim()) { e.preventDefault(); downloadZip(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transcript, tweet, instagram]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="space-y-2">
        <input type="file" accept="video/*,.mp4,.mov,.m4v,.webm" onChange={onUpload} />
        <button className="btn" disabled={!canTranscribe || !!busy} onClick={transcribe}>
          {busy === "transcribe" ? "Transcribing…" : "Transcribe"}
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm">Tone</label>
          <select
            value={tone}
            onChange={(e)=>setTone(e.target.value as Tone)}
            className="border rounded px-2 py-1 text-sm"
            aria-label="Tone selector"
          >
            <option value="default">default</option>
            <option value="hype">hype</option>
            <option value="educational">educational</option>
          </select>
        </div>
      </div>

      {err && <pre role="alert" className="text-red-500 text-xs whitespace-pre-wrap">{err}</pre>}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Transcript</label>
        <textarea className="w-full border rounded p-2 h-32" value={transcript} onChange={(e)=>setTranscript(e.target.value)} placeholder="Transcript will appear here…" />
      </div>

      <div className="flex items-center gap-2">
        <button className="btn" disabled={!canCaption || !!busy} onClick={genCaptions}>
          {busy === "captions" ? "Generating…" : "Generate 2 Captions"}
        </button>
        <button className="btn" disabled={!canZip || !!busy} onClick={downloadZip}>
          {busy === "zip" ? "Packaging…" : "Download Zip"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Tweet</label>
          <textarea className="w-full border rounded p-2 h-32" value={tweet} onChange={(e)=>setTweet(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Instagram</label>
          <textarea className="w-full border rounded p-2 h-32" value={instagram} onChange={(e)=>setInstagram(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
