import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditorStore } from "@/lib/store";
import { CropTool } from "@/features/crop/CropTool";
import { OverlayLayer } from "@/features/overlay/OverlayLayer";
import UndoRedoBar from "./UndoRedoBar";
export function EditorCanvas() {
    const frame = useEditorStore((s) => s.capturedFrame);
    const overlays = useEditorStore((s) => s.overlays);
    const canUndo = useEditorStore((s) => s.canUndo);
    const canRedo = useEditorStore((s) => s.canRedo);
    const undo = useEditorStore((s) => s.undo);
    const redo = useEditorStore((s) => s.redo);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(UndoRedoBar, { canUndo: canUndo, canRedo: canRedo, onUndo: undo, onRedo: redo }), _jsx("div", { className: "text-xs text-gray-400", children: "Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo" })] }), _jsxs("div", { className: "relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video bg-neutral-950", children: [frame ? (_jsx("img", { src: frame, alt: "captured", className: "absolute inset-0 w-full h-full object-contain" })) : (_jsx("div", { className: "grid place-items-center h-full text-neutral-500", children: "Capture a frame to begin" })), _jsx(CropTool, {}), overlays.map((o) => (_jsx(OverlayLayer, { overlay: o }, o.id)))] })] }));
}
