import React, { useEffect } from "react";

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  disabled?: boolean;
};

export default function UndoRedoBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled = false,
}: Props) {
  // Handle keyboard shortcuts
  useEffect(() => {
    if (disabled) return;

    function handleKeyDown(e: KeyboardEvent) {
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
      if (
        meta &&
        ((e.key.toLowerCase() === "z" && shift) || e.key.toLowerCase() === "y")
      ) {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo, disabled]);

  return (
    <div className="flex gap-2 items-center">
      <div className="relative group">
        <button
          className="btn"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          aria-label="Undo"
        >
          ⟲ Undo
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Undo (⌘/Ctrl+Z)
        </div>
      </div>
      <div className="relative group">
        <button
          className="btn"
          onClick={onRedo}
          disabled={!canRedo || disabled}
          aria-label="Redo"
        >
          ⟳ Redo
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Redo (Shift+⌘/Ctrl+Z or Ctrl+Y)
        </div>
      </div>
    </div>
  );
}
