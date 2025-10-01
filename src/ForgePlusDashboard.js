import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { apiCaptions, apiTranscribe, apiLog } from "./lib/api";
import { logEvent } from "./lib/logEvent";
import UndoRedoBar from "./components/UndoRedoBar";
import { useUndoRedoWithState } from "./hooks/useUndoRedo";
const LS_KEY = "forge_v1_state_v2";
export default function ForgePlusDashboard() {
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(null);
    const [err, setErr] = useState(null);
    // Use undo/redo hook for text state management
    const [state, updateState, undoRedo] = useUndoRedoWithState({
        transcript: "",
        tweet: "",
        instagram: "",
        tone: "default",
    });
    const { transcript, tweet, instagram, tone } = state;
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const s = JSON.parse(raw);
                updateState({
                    transcript: s.transcript || "",
                    tweet: s.tweet || "",
                    instagram: s.instagram || "",
                    tone: s.tone || "default",
                });
            }
        }
        catch { }
    }, [updateState]);
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
        const okSize = f.size <= 1_000_000_000;
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
            const r = await apiTranscribe(file);
            updateState({
                ...state,
                transcript: r.text || "",
                tweet: "",
                instagram: "",
            });
        }
        catch (e) {
            setErr(e.message || "Transcription error");
            logEvent("error_transcribe", {
                message: e.message,
                fileName: file.name,
                fileSize: file.size,
            });
        }
        finally {
            setBusy(null);
        }
    }
    async function genCaptions() {
        setBusy("captions");
        setErr(null);
        try {
            const j = await apiCaptions({ transcript, tone });
            updateState({
                ...state,
                tweet: j.tweet || "",
                instagram: j.instagram || "",
            });
            await apiLog("info", "captions_generated", { len: transcript.length });
        }
        catch (e) {
            setErr(e.message || "Captions error");
            logEvent("error_captions", {
                message: e.message,
                transcriptLength: transcript.length,
                tone,
            });
        }
        finally {
            setBusy(null);
        }
    }
    async function downloadZip() {
        setBusy("zip");
        setErr(null);
        try {
            // Not yet implemented on server. Stub for now:
            alert("ExportZip endpoint not implemented in mock server");
        }
        catch (e) {
            setErr(e.message || "Export error");
            logEvent("error_export", { message: e.message });
        }
        finally {
            setBusy(null);
        }
    }
    useEffect(() => {
        ``;
        function onKey(e) {
            const meta = e.metaKey || e.ctrlKey;
            if (meta && e.key.toLowerCase() === "enter" && transcript.trim()) {
                e.preventDefault();
                genCaptions();
            }
            if (meta &&
                e.key.toLowerCase() === "s" &&
                tweet.trim() &&
                instagram.trim()) {
                e.preventDefault();
                downloadZip();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [transcript, tweet, instagram]);
    return (_jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "video-upload", className: "block text-sm text-text-primary", children: "Upload video file" }), _jsx("input", { id: "video-upload", type: "file", accept: "video/*,.mp4,.mov,.m4v,.webm", onChange: onUpload, "aria-describedby": "video-upload-help" }), _jsx("div", { id: "video-upload-help", className: "text-sm text-text-muted", children: "Upload a video file (MP4, MOV, M4V, or WebM) up to 1GB to transcribe" }), _jsx("button", { className: "btn", disabled: !canTranscribe || !!busy, onClick: transcribe, "aria-describedby": "transcribe-help", children: busy === "transcribe" ? "Transcribing…" : "Transcribe" }), _jsx("span", { id: "transcribe-help", className: "sr-only", children: "Transcribe the uploaded video to generate text" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "tone-select", className: "text-sm text-text-primary", children: "Tone" }), _jsxs("select", { id: "tone-select", value: tone, onChange: (e) => updateState({ ...state, tone: e.target.value }), className: "border rounded px-2 py-1 text-sm bg-bg-secondary text-text-primary", "aria-describedby": "tone-help", children: [_jsx("option", { value: "default", children: "default" }), _jsx("option", { value: "hype", children: "hype" }), _jsx("option", { value: "educational", children: "educational" })] }), _jsx("span", { id: "tone-help", className: "sr-only", children: "Select the tone for generated captions" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UndoRedoBar, { canUndo: undoRedo.canUndo, canRedo: undoRedo.canRedo, onUndo: undoRedo.undo, onRedo: undoRedo.redo, disabled: !!busy }), _jsx("div", { className: "text-xs text-gray-400", children: "Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo" })] })] }), err && (_jsx("pre", { role: "alert", className: "text-red-500 text-xs whitespace-pre-wrap", children: err })), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "transcript-textarea", className: "block text-sm font-medium text-text-primary", children: "Transcript" }), _jsx("textarea", { id: "transcript-textarea", className: "w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary", value: transcript, onChange: (e) => updateState({ ...state, transcript: e.target.value }), placeholder: "Transcript will appear here\u2026", "aria-describedby": "transcript-help" }), _jsx("div", { id: "transcript-help", className: "text-sm text-text-muted", children: "Edit the transcript text or paste your own content" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "btn", disabled: !canCaption || !!busy, onClick: genCaptions, children: busy === "captions" ? "Generating…" : "Generate 2 Captions" }), _jsx("button", { className: "btn", disabled: !canZip || !!busy, onClick: downloadZip, children: busy === "zip" ? "Packaging…" : "Download Zip" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "tweet-textarea", className: "block text-sm font-medium text-text-primary", children: "Tweet" }), _jsx("textarea", { id: "tweet-textarea", className: "w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary", value: tweet, onChange: (e) => updateState({ ...state, tweet: e.target.value }), "aria-describedby": "tweet-help" }), _jsx("div", { id: "tweet-help", className: "text-sm text-text-muted", children: "Generated Twitter caption" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "instagram-textarea", className: "block text-sm font-medium text-text-primary", children: "Instagram" }), _jsx("textarea", { id: "instagram-textarea", className: "w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary", value: instagram, onChange: (e) => updateState({ ...state, instagram: e.target.value }), "aria-describedby": "instagram-help" }), _jsx("div", { id: "instagram-help", className: "text-sm text-text-muted", children: "Generated Instagram caption" })] })] })] }));
}
