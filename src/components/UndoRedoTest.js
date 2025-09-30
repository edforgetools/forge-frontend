import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import UndoRedoBar from "./UndoRedoBar";
import { useUndoRedoWithState } from "../hooks/useUndoRedo";
export default function UndoRedoTest() {
    const [state, updateState, undoRedo] = useUndoRedoWithState({
        text: "Hello World",
        count: 0,
        color: "#3b82f6",
    });
    const handleTextChange = (e) => {
        updateState({ ...state, text: e.target.value });
    };
    const handleCountChange = (delta) => {
        updateState({ ...state, count: state.count + delta });
    };
    const handleColorChange = (color) => {
        updateState({ ...state, color });
    };
    return (_jsxs("div", { className: "p-6 max-w-2xl mx-auto space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-4", children: "Undo/Redo Test" }), _jsxs("div", { className: "flex items-center gap-4 p-4 bg-gray-800 rounded-lg", children: [_jsx(UndoRedoBar, { canUndo: undoRedo.canUndo, canRedo: undoRedo.canRedo, onUndo: undoRedo.undo, onRedo: undoRedo.redo }), _jsx("div", { className: "text-sm text-gray-400", children: "Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Text Input (try typing and undoing):" }), _jsx("input", { type: "text", value: state.text, onChange: handleTextChange, className: "w-full px-3 py-2 border rounded bg-gray-800 text-white", placeholder: "Type something..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Counter (try incrementing and undoing):" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => handleCountChange(-1), className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700", children: "-1" }), _jsx("span", { className: "text-2xl font-bold text-white min-w-[3rem] text-center", children: state.count }), _jsx("button", { onClick: () => handleCountChange(1), className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700", children: "+1" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-white mb-2", children: "Color (try changing and undoing):" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "color", value: state.color, onChange: (e) => handleColorChange(e.target.value), className: "w-12 h-12 rounded border" }), _jsx("div", { className: "w-12 h-12 rounded border", style: { backgroundColor: state.color } }), _jsx("span", { className: "text-white", children: state.color })] })] })] }), _jsxs("div", { className: "p-4 bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Current State:" }), _jsx("pre", { className: "text-sm text-gray-300 whitespace-pre-wrap", children: JSON.stringify(state, null, 2) })] }), _jsxs("div", { className: "p-4 bg-blue-900 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-white mb-2", children: "Test Instructions:" }), _jsxs("ol", { className: "text-sm text-blue-200 space-y-1", children: [_jsx("li", { children: "1. Type some text in the input field" }), _jsx("li", { children: "2. Press Cmd/Ctrl+Z to undo the text change" }), _jsx("li", { children: "3. Press Cmd/Ctrl+Shift+Z to redo the text change" }), _jsx("li", { children: "4. Try the same with the counter and color picker" }), _jsx("li", { children: "5. Verify that state rolls back and forward correctly" })] })] })] }));
}
