import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function TranscriptCard({ text, setMediaPath, setText }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    async function handleUpload(file) {
        setLoading(true);
        setStatus('Uploading…');
        try {
            const form = new FormData();
            form.append('file', file);
            const resp = await fetch('/api/transcribe', { method: 'POST', body: form });
            let data;
            try {
                data = await resp.json();
            }
            catch {
                data = { ok: false, error: 'bad_json' };
            }
            if (data?.savedPath) {
                setMediaPath(data.savedPath);
            }
            if (data?.transcript) {
                setText(data.transcript);
                setStatus('Transcribed');
            }
            else {
                setText('');
                setStatus('Transcription failed. Using uploaded file for clips.');
            }
        }
        catch (e) {
            setStatus('Upload failed.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "rounded-2xl border p-4 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Transcript" }), _jsx("label", { className: "block mb-2 text-sm", children: "Upload audio/video to transcribe" }), _jsx("input", { type: "file", accept: "audio/*,video/*", onChange: (e) => {
                    const f = e.target.files?.[0];
                    if (f)
                        handleUpload(f);
                } }), loading && _jsx("div", { className: "mt-2 text-sm", children: "Transcribing\u2026" }), status && _jsx("div", { className: "mt-1 text-xs text-neutral-600", children: status }), _jsx("textarea", { className: "mt-3 w-full h-48 border rounded p-2 text-sm", value: text, onChange: (e) => setText(e.target.value) }), _jsx("div", { className: "text-xs text-neutral-500 mt-1", children: "Export coming soon (.txt / .srt)" })] }));
}
