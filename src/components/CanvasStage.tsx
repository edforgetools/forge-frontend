import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasStore } from "@/state/canvasStore";
import { TextOverlay } from "./TextOverlay";
import { startHeatmapTracking, stopHeatmapTracking } from "@/lib/heatmap";

export function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    image,
    videoSrc,
    overlays,
    selectedId,
    crop,
    aspect,
    zoom,
    showGrid,
    showSafeZone,
    select,
    updateOverlay,
  } = useCanvasStore();

  // Animation frame ref for smooth redraws
  const animationFrameRef = useRef<number | undefined>(undefined);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size to match crop area
    canvas.width = crop.w;
    canvas.height = crop.h;

    // Draw background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image if available
    if (image) {
      const sourceX = crop.x;
      const sourceY = crop.y;
      const sourceWidth = crop.w;
      const sourceHeight = crop.h;

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    // Draw logo overlays (text overlays are rendered as separate components)
    overlays
      .filter((overlay) => !overlay.hidden && overlay.type === "logo")
      .sort((a, b) => a.z - b.z)
      .forEach((overlay) => {
        drawOverlay(ctx, overlay, selectedId === overlay.id);
      });

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx);
    }

    // Draw safe zone if enabled
    if (showSafeZone) {
      drawSafeZone(ctx);
    }

    // Draw crop overlay if active
    if (crop.active) {
      drawCropOverlay(ctx);
    }
  }, [
    image,
    videoSrc,
    overlays,
    selectedId,
    crop,
    aspect,
    zoom,
    showGrid,
    showSafeZone,
  ]);

  const drawOverlay = (
    ctx: CanvasRenderingContext2D,
    overlay: any,
    isSelected: boolean
  ) => {
    ctx.save();

    // Apply transformations
    ctx.translate(overlay.x + overlay.w / 2, overlay.y + overlay.h / 2);
    ctx.rotate((overlay.rot * Math.PI) / 180);
    ctx.globalAlpha = overlay.opacity;

    if (overlay.type === "logo") {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          -overlay.w / 2,
          -overlay.h / 2,
          overlay.w,
          overlay.h
        );
      };
      img.src = overlay.src;
    }

    // Draw selection outline
    if (isSelected) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(-overlay.w / 2, -overlay.h / 2, overlay.w, overlay.h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;

    const gridSize = 20;
    const scaledGridSize = gridSize * zoom;

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawSafeZone = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const safeZoneWidth = canvas.width * 0.9;
    const safeZoneHeight = canvas.height * 0.9;

    ctx.save();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      centerX - safeZoneWidth / 2,
      centerY - safeZoneHeight / 2,
      safeZoneWidth,
      safeZoneHeight
    );
    ctx.setLineDash([]);
    ctx.restore();
  };

  const drawCropOverlay = (ctx: CanvasRenderingContext2D) => {
    // Draw aspect ratio guide based on current aspect
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const guideWidth = canvas.width * 0.8;

    // Calculate guide height based on current aspect ratio
    let guideHeight: number;
    switch (aspect) {
      case "16:9":
        guideHeight = guideWidth * (9 / 16);
        break;
      case "1:1":
        guideHeight = guideWidth;
        break;
      case "9:16":
        guideHeight = guideWidth * (16 / 9);
        break;
      default:
        guideHeight = guideWidth * (9 / 16);
    }

    ctx.save();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(
      centerX - guideWidth / 2,
      centerY - guideHeight / 2,
      guideWidth,
      guideHeight
    );
    ctx.setLineDash([]);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an overlay
    const clickedOverlay = overlays
      .filter((overlay) => !overlay.hidden)
      .sort((a, b) => b.z - a.z)
      .find((overlay) => {
        const centerX = overlay.x + overlay.w / 2;
        const centerY = overlay.y + overlay.h / 2;
        return (
          x >= centerX - overlay.w / 2 &&
          x <= centerX + overlay.w / 2 &&
          y >= centerY - overlay.h / 2 &&
          y <= centerY + overlay.h / 2
        );
      });

    if (clickedOverlay) {
      select(clickedOverlay.id);
      setIsDragging(true);
      setDragStart({ x: x - clickedOverlay.x, y: y - clickedOverlay.y });
    } else {
      select(undefined);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const overlay = overlays.find((o) => o.id === selectedId);
    if (overlay && !overlay.locked) {
      updateOverlay(selectedId, {
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    // Double-click handling is now managed by individual overlay components
  };

  // Redraw on state changes
  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => redraw());
  }, [redraw]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const hasContent = image || videoSrc;

  // Start heatmap tracking when canvas is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && hasContent) {
      startHeatmapTracking(canvas);
    }
    
    return () => {
      stopHeatmapTracking();
    };
  }, [hasContent]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full"
      data-testid="canvas-stage"
    >
      <div className="relative bg-gray-100 rounded-2xl shadow-lg p-6">
        <div
          className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden relative"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            maxWidth: `${800 / zoom}px`,
            maxHeight: `${600 / zoom}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "800px",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            tabIndex={13}
            role="img"
            aria-label="Canvas for editing images and overlays"
            aria-describedby="canvas-description"
          />

          {/* Render text overlays as separate components */}
          {overlays
            .filter((overlay) => !overlay.hidden && overlay.type === "text")
            .sort((a, b) => a.z - b.z)
            .map((overlay) => (
              <TextOverlay
                key={overlay.id}
                overlay={overlay as any}
                isSelected={selectedId === overlay.id}
                onUpdate={(updates) => updateOverlay(overlay.id, updates)}
                onSelect={() => select(overlay.id)}
              />
            ))}
        </div>

        {!hasContent && (
          <div className="absolute inset-6 flex items-center justify-center bg-white rounded-xl">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No content loaded</div>
              <div className="text-sm">
                Upload an image or video to get started
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas info */}
      {hasContent && (
        <div
          id="canvas-description"
          className="mt-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200"
          role="status"
          aria-live="polite"
        >
          Canvas: {Math.round(crop.w)} × {Math.round(crop.h)} • {aspect} aspect
          ratio
        </div>
      )}
    </div>
  );
}
