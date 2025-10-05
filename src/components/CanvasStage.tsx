import { useRef, useEffect } from "react";

interface CanvasStageProps {
  className?: string;
}

export function CanvasStage({ className = "" }: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // TODO: Initialize canvas with proper dimensions
    // TODO: Set up keyboard handlers for canvas interactions
    // TODO: Handle resize events
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: Implement keyboard shortcuts
    // - Arrow keys: move selection
    // - Shift + Arrow: move by 10px
    // - Alt + Arrow: precision movement
    // - Cmd/Ctrl + Z: undo
    // - Cmd/Ctrl + Y: redo
    console.log("Canvas key pressed:", event.key);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4">Canvas</h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          className="border border-gray-300 rounded cursor-crosshair"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        />
        <div className="absolute top-2 right-2 text-xs text-gray-500">
          16:9 • 800×450
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        TODO: Canvas interactions, frame display, overlay rendering
      </div>
    </div>
  );
}
