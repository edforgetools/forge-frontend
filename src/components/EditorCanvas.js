import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditorStore } from '@/lib/store';
import { CropTool } from '@/features/crop/CropTool';
import { OverlayLayer } from '@/features/overlay/OverlayLayer';
export function EditorCanvas() {
    const frame = useEditorStore((s) => s.capturedFrame);
    const overlays = useEditorStore((s) => s.overlays);
    return (_jsxs("div", { className: "relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video bg-neutral-950", children: [frame ? (_jsx("img", { src: frame, alt: "captured", className: "absolute inset-0 w-full h-full object-contain" })) : (_jsx("div", { className: "grid place-items-center h-full text-neutral-500", children: "Capture a frame to begin" })), _jsx(CropTool, {}), overlays.map((o) => (_jsx(OverlayLayer, { overlay: o }, o.id)))] }));
}
