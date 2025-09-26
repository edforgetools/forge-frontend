import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditorStore } from '@/lib/store';
export function RightPanel() {
    const selection = useEditorStore((s) => s.selection);
    const overlays = useEditorStore((s) => s.overlays);
    const setOpacity = useEditorStore((s) => s.setOverlayOpacity);
    const selected = overlays.find((o) => o.id === selection);
    return (_jsxs("aside", { className: "w-80 border-l border-neutral-800 p-3 space-y-4 overflow-y-auto", children: [_jsx("h2", { className: "text-sm font-semibold", children: "Properties" }), selected ? (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "text-xs text-neutral-400", children: ["Selected overlay: ", selected.name] }), _jsx("label", { className: "text-sm", children: "Opacity" }), _jsx("input", { type: "range", min: 0, max: 1, step: 0.01, value: selected.opacity, onChange: (e) => setOpacity(selected.id, Number(e.target.value)) })] })) : (_jsx("div", { className: "text-neutral-400 text-sm", children: "Nothing selected" }))] }));
}
