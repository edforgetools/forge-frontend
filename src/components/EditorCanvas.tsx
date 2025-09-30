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

  return (
    <div className="space-y-4">
      {/* Undo/Redo Controls */}
      <div className="flex items-center gap-4">
        <UndoRedoBar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
        <div className="text-xs text-gray-400">
          Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video bg-neutral-950">
        {frame ? (
          <img
            src={frame}
            alt="captured"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="grid place-items-center h-full text-neutral-500">
            Capture a frame to begin
          </div>
        )}
        <CropTool />
        {overlays.map((o) => (
          <OverlayLayer key={o.id} overlay={o} />
        ))}
      </div>
    </div>
  );
}
