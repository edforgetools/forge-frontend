import {
  type OverlayItem,
  type OverlayState,
  type OverlayActions,
} from "@/hooks/useOverlay";
import { CropOverlay } from "./CropOverlay";
import { motion } from "framer-motion";
import type { CanvasState, CanvasActions } from "@/hooks/useCanvas";

interface CanvasStageProps {
  className?: string;
  cropArea?: { x: number; y: number; width: number; height: number };
  showCropOverlay?: boolean;
  onCropChange?: (cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  canvasState: CanvasState;
  canvasActions: CanvasActions;
  overlayState: OverlayState;
  overlayActions: OverlayActions;
}

export function CanvasStage({
  className = "",
  cropArea,
  showCropOverlay = false,
  onCropChange,
  canvasState,
  canvasActions,
  overlayState,
  overlayActions,
}: CanvasStageProps) {
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
      // Undo/Redo is now handled at the app level
      case "a":
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          // Select all overlays (future enhancement)
        }
        break;
      case "l":
        if (overlayState.selectedId) {
          event.preventDefault();
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.toggleLock(overlay.id);
          }
        }
        break;
      case "v":
        if (overlayState.selectedId) {
          event.preventDefault();
          const overlay = overlayState.items.find(
            (item) => item.id === overlayState.selectedId
          );
          if (overlay) {
            overlayActions.toggleVisibility(overlay.id);
          }
        }
        break;
      case "Enter":
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          // Trigger export (this will be handled by ExportBar)
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
        {overlayState.selectedId === overlay.id && !overlay.locked && (
          <>
            <motion.div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newWidth = Math.max(20, overlay.width - info.offset.x);
                const newHeight = Math.max(20, overlay.height - info.offset.y);
                const newX = overlay.x + info.offset.x;
                const newY = overlay.y + info.offset.y;
                overlayActions.resizeOverlay(overlay.id, newWidth, newHeight);
                overlayActions.moveOverlay(overlay.id, newX, newY);
              }}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newWidth = Math.max(20, overlay.width + info.offset.x);
                const newHeight = Math.max(20, overlay.height - info.offset.y);
                const newY = overlay.y + info.offset.y;
                overlayActions.resizeOverlay(overlay.id, newWidth, newHeight);
                overlayActions.moveOverlay(overlay.id, overlay.x, newY);
              }}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newWidth = Math.max(20, overlay.width - info.offset.x);
                const newHeight = Math.max(20, overlay.height + info.offset.y);
                const newX = overlay.x + info.offset.x;
                overlayActions.resizeOverlay(overlay.id, newWidth, newHeight);
                overlayActions.moveOverlay(overlay.id, newX, overlay.y);
              }}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => {
                const newWidth = Math.max(20, overlay.width + info.offset.x);
                const newHeight = Math.max(20, overlay.height + info.offset.y);
                overlayActions.resizeOverlay(overlay.id, newWidth, newHeight);
              }}
              whileDrag={{ scale: 1.2 }}
            />
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

        {/* Crop overlay */}
        {showCropOverlay && cropArea && (
          <CropOverlay
            cropArea={cropArea}
            canvasWidth={canvasState.width}
            canvasHeight={canvasState.height}
            isVisible={showCropOverlay}
            onCropChange={onCropChange}
          />
        )}

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
      </div>
    </div>
  );
}
