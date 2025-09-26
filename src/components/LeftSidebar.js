import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VideoImport } from '@/features/upload/VideoImport';
import { useEditorStore } from '@/lib/store';
import { fToDataUrl } from '@/lib/dom';
export function LeftSidebar() {
    return (_jsxs("aside", { className: "w-72 border-r border-neutral-800 p-3 space-y-4 overflow-y-auto", children: [_jsx("h2", { className: "text-sm font-semibold", children: "Assets" }), _jsx(VideoImport, {}), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm", children: "Logo" }), _jsx("input", { type: "file", accept: "image/png,image/svg+xml", onChange: async (e) => {
                            const f = e.target.files?.[0];
                            if (!f)
                                return;
                            const dataUrl = await fToDataUrl(f);
                            const id = crypto.randomUUID();
                            const s = useEditorStore.getState();
                            s.addOverlay({
                                id,
                                name: f.name,
                                x: 24,
                                y: 24,
                                w: 180,
                                h: 64,
                                opacity: 0.85,
                                dataUrl,
                            });
                            s.setSelection(id);
                        } })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-xs uppercase text-neutral-400 mb-2", children: "Tools" }), _jsxs("ul", { className: "space-y-1 text-sm", children: [_jsx("li", { children: "Crop (16:9)" }), _jsx("li", { children: "Overlay (Logo)" })] })] })] }));
}
