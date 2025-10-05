import { useCanvas } from "@/hooks/useCanvas";
import { useOverlay, type OverlayItem } from "@/hooks/useOverlay";
import { motion } from "framer-motion";

interface CanvasStageProps {
  className?: string;
}

export function CanvasStage({ className = "" }: CanvasStageProps) {
  const [canvasState, canvasActions] = useCanvas();
  const [overlayState, overlayActions] = useOverlay();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const precision = event.altKey ? 0.1 : 1;

    switch (event.key) {
      case "ArrowLeft":
        if (overlayState.selectedId) {
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.moveOverlay(
              overlayState.selectedId,
              overlay.x - step * precision,
              overlay.y
            );
          }
        }
        break;
      case "ArrowRight":
        if (overlayState.selectedId) {
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.moveOverlay(
              overlayState.selectedId,
              overlay.x + step * precision,
              overlay.y
            );
          }
        }
        break;
      case "ArrowUp":
        if (overlayState.selectedId) {
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.moveOverlay(
              overlayState.selectedId,
              overlay.x,
              overlay.y - step * precision
            );
          }
        }
        break;
      case "ArrowDown":
        if (overlayState.selectedId) {
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.moveOverlay(
              overlayState.selectedId,
              overlay.x,
              overlay.y + step * precision
            );
          }
        }
        break;
      case "Delete":
        if (overlayState.selectedId) {
          overlayActions.removeOverlay(overlayState.selectedId);
        }
        break;
      case "z":
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          if (event.shiftKey) {
            overlayActions.redo();
          } else {
            overlayActions.undo();
          }
        }
        break;
      case "y":
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          overlayActions.redo();
        }
        break;
    }
  };

  const renderOverlay = (overlay: OverlayItem) => {
    if (!overlay.visible) return null;

    return (
      <motion.div
        key={overlay.id}
        className={`absolute border-2 ${
          overlayState.selectedId === overlay.id
            ? "border-blue-500 bg-blue-50"
            : "border-transparent hover:border-gray-400"
        } cursor-move select-none`}
        style={{
          left: overlay.x,
          top: overlay.y,
          width: overlay.width,
          height: overlay.height,
        }}
        onClick={() => overlayActions.selectOverlay(overlay.id)}
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => {
          overlayActions.moveOverlay(
            overlay.id,
            overlay.x + info.offset.x,
            overlay.y + info.offset.y
          );
        }}
        whileDrag={{ scale: 1.05 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {overlay.type === "text" ? (
          <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-90 rounded text-black font-semibold text-sm p-1">
            {overlay.content}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-90 rounded text-gray-600 font-semibold text-xs">
            {overlay.content}
          </div>
        )}

        {/* Resize handles */}
        {overlayState.selectedId === overlay.id && (
          <>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Canvas</h2>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            16:9 • {canvasState.width}×{canvasState.height}
          </div>
          {canvasState.isLoading && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          )}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasActions.canvasRef}
          width={canvasState.width}
          height={canvasState.height}
          className="border border-gray-300 rounded cursor-crosshair bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Canvas for thumbnail editing"
        />

        {/* Overlay container */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {overlayState.items.map(renderOverlay)}
          </div>
        </div>

        {!canvasState.hasContent && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-sm">Upload a video or image to get started</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <div>
          {overlayState.items.length > 0 && (
            <span>
              {overlayState.items.length} overlay
              {overlayState.items.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={overlayActions.undo}
            disabled={overlayState.historyIndex === 0}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded"
          >
            Undo
          </button>
          <button
            onClick={overlayActions.redo}
            disabled={
              overlayState.historyIndex === overlayState.history.length - 1
            }
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded"
          >
            Redo
          </button>
        </div>
      </div>
    </div>
  );
}
