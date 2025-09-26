import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function ClipsCard({ mediaPath }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    async function generateClips() {
        if (!mediaPath)
            return;
        setLoading(true);
        setStatus('Generating clips…');
        try {
            const resp = await fetch('/api/clips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedPath: mediaPath, count: 2 }),
            });
            const data = await resp.json();
            setStatus(data?.ok ? 'Clips generated' : 'Clip generation failed');
        }
        catch (e) {
            setStatus('Error generating clips');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "rounded-2xl border p-4 shadow-sm mt-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "Clips" }), _jsx("button", { disabled: !mediaPath || loading, onClick: generateClips, className: "px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50", children: loading ? 'Working…' : 'Generate 2 Clips' }), status && _jsx("div", { className: "mt-2 text-sm", children: status })] }));
}
