import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
export default function UndoRedoBar({ canUndo, canRedo, onUndo, onRedo, disabled = false, }) {
    // Handle keyboard shortcuts
    useEffect(() => {
        if (disabled)
            return;
        function handleKeyDown(e) {
            const meta = e.metaKey || e.ctrlKey;
            const shift = e.shiftKey;
            // Undo: Cmd/Ctrl+Z (without Shift)
            if (meta && e.key.toLowerCase() === "z" && !shift) {
                e.preventDefault();
                if (canUndo) {
                    onUndo();
                }
            }
            // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
            if (meta &&
                ((e.key.toLowerCase() === "z" && shift) || e.key.toLowerCase() === "y")) {
                e.preventDefault();
                if (canRedo) {
                    onRedo();
                }
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [canUndo, canRedo, onUndo, onRedo, disabled]);
    return (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsxs("div", { className: "relative group", children: [_jsx("button", { className: "btn", onClick: onUndo, disabled: !canUndo || disabled, "aria-label": "Undo", children: "\u27F2 Undo" }), _jsx("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap", children: "Undo (\u2318/Ctrl+Z)" })] }), _jsxs("div", { className: "relative group", children: [_jsx("button", { className: "btn", onClick: onRedo, disabled: !canRedo || disabled, "aria-label": "Redo", children: "\u27F3 Redo" }), _jsx("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap", children: "Redo (Shift+\u2318/Ctrl+Z or Ctrl+Y)" })] })] }));
}
