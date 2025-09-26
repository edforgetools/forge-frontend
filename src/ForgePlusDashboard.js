import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "./lib/api";
const LS_KEY = "forge_v1_state_v2";
export default function ForgePlusDashboard() {
    const [file, setFile] = useState(null);
    const [transcript, setTranscript] = useState("");
    const [tweet, setTweet] = useState("");
    const [instagram, setInstagram] = useState("");
    const [tone, setTone] = useState("default");
    const [busy, setBusy] = useState(null);
    const [err, setErr] = useState(null);
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                setTranscript(s.transcript || "");
                setTweet(s.tweet || "");
                setInstagram(s.instagram || "");
                setTone(s.tone || "default");
            }
        }
        catch { }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => {
            const s = { transcript, tweet, instagram, tone };
            localStorage.setItem(LS_KEY, JSON.stringify(s));
        }, 300);
        return () => clearTimeout(t);
    }, [transcript, tweet, instagram, tone]);
    const canTranscribe = useMemo(() => !!file, [file]);
    const canCaption = useMemo(() => transcript.trim().length > 0, [transcript]);
    const canZip = useMemo(() => tweet.trim() && instagram.trim(), [tweet, instagram]);
    function validateFile(f) {
        const okType = /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
        const okSize = f.size <= 1000000000;
        if (!okType)
            return "Unsupported file type. Use MP4/MOV/WebM.";
        if (!okSize)
            return "File too large. Max 1 GB.";
        return null;
    }
    async function onUpload(e) {
        setErr(null);
        const f = e.target.files?.[0] || null;
        if (!f)
            return;
        const v = validateFile(f);
        if (v) {
            setFile(null);
            setErr(v);
            return;
        }
        setFile(f);
    }
    async function transcribe() {
        if (!file)
            return;
        setBusy("transcribe");
        setErr(null);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const r = await fetch(api("/api/transcribe"), { method: "POST", body: fd });
            if (!r.ok) {
                const msg = await r.text();
                throw new Error(`Transcribe failed: ${r.status} ${msg}`);
            }
            const j = await r.json();
            setTranscript(j.transcript || "");
            setTweet("");
            setInstagram("");
        }
        catch (e) {
            setErr(e.message || "Transcription error");
        }
        finally {
            setBusy(null);
        }
    }
    async function genCaptions() {
        setBusy("captions");
        setErr(null);
        try {
            const r = await fetch(api("/api/captions"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, tone }),
            });
            if (!r.ok) {
                const msg = await r.text();
                throw new Error(`Captions failed: ${r.status} ${msg}`);
            }
            const j = await r.json();
            setTweet(j.tweet || "");
            setInstagram(j.instagram || "");
        }
        catch (e) {
            setErr(e.message || "Captions error");
        }
        finally {
            setBusy(null);
        }
    }
    async function downloadZip() {
        setBusy("zip");
        setErr(null);
        try {
            const r = await fetch(api("/api/exportZip"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, tweet, instagram }),
            });
            if (!r.ok) {
                const msg = await r.text();
                throw new Error(`Export failed: ${r.status} ${msg}`);
            }
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "forge_export.zip";
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (e) {
            setErr(e.message || "Export error");
        }
        finally {
            setBusy(null);
        }
    }
    useEffect(() => {
        function onKey(e) {
            const meta = e.metaKey || e.ctrlKey;
            if (meta && e.key.toLowerCase() === "enter" && transcript.trim()) {
                e.preventDefault();
                genCaptions();
            }
            if (meta && e.key.toLowerCase() === "s" && tweet.trim() && instagram.trim()) {
                e.preventDefault();
                downloadZip();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [transcript, tweet, instagram]);
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("input", { type: "file", accept: "video/*,.mp4,.mov,.m4v,.webm", onChange: onUpload }), _jsx("button", { className: "btn", disabled: !canTranscribe || !!busy, onClick: transcribe, children: busy === "transcribe" ? "Transcribing…" : "Transcribe" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm", children: "Tone" }), _jsxs("select", { value: tone, onChange: (e) => setTone(e.target.value), className: "border rounded px-2 py-1 text-sm", "aria-label": "Tone selector", children: [_jsx("option", { value: "default", children: "default" }), _jsx("option", { value: "hype", children: "hype" }), _jsx("option", { value: "educational", children: "educational" })] })] })] }), err && _jsx("pre", { role: "alert", className: "text-red-500 text-xs whitespace-pre-wrap", children: err }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium", children: "Transcript" }), _jsx("textarea", { className: "w-full border rounded p-2 h-32", value: transcript, onChange: (e) => setTranscript(e.target.value), placeholder: "Transcript will appear here\u2026" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn", disabled: !canCaption || !!busy, onClick: genCaptions, children: busy === "captions" ? "Generating…" : "Generate 2 Captions" }), _jsx("button", { className: "btn", disabled: !canZip || !!busy, onClick: downloadZip, children: busy === "zip" ? "Packaging…" : "Download Zip" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Tweet" }), _jsx("textarea", { className: "w-full border rounded p-2 h-32", value: tweet, onChange: (e) => setTweet(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium", children: "Instagram" }), _jsx("textarea", { className: "w-full border rounded p-2 h-32", value: instagram, onChange: (e) => setInstagram(e.target.value) })] })] })] }));
}
