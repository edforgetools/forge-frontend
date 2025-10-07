import React, { useRef, useEffect, useState, useCallback } from "react";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";

export function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { image, videoSrc, overlays, selectedId, crop } = useCanvasStore();

  // Animation frame ref for smooth redraws
  const animationFrameRef = useRef<number>();

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

    // Draw overlays
    overlays
      .filter((overlay) => !overlay.hidden)
      .sort((a, b) => a.z - b.z)
      .forEach((overlay) => {
        drawOverlay(ctx, overlay, selectedId === overlay.id);
      });

    // Draw crop overlay if active
    if (crop.active) {
      drawCropOverlay(ctx);
    }
  }, [image, videoSrc, overlays, selectedId, crop]);

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
    } else if (overlay.type === "text") {
      const textOverlay = overlay as any;
      ctx.fillStyle = textOverlay.color;
      ctx.font = `${textOverlay.weight} ${textOverlay.size}px ${textOverlay.font}`;
      ctx.textAlign = textOverlay.align as CanvasTextAlign;
      ctx.textBaseline = "middle";

      if (textOverlay.shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.fillText(textOverlay.text, 0, 0);
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

  const drawCropOverlay = (ctx: CanvasRenderingContext2D) => {
    // Draw 16:9 aspect ratio guide
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const guideWidth = canvas.width * 0.8;
    const guideHeight = guideWidth * (9 / 16);

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
      canvasActions.select(clickedOverlay.id);
      setIsDragging(true);
      setDragStart({ x: x - clickedOverlay.x, y: y - clickedOverlay.y });
    } else {
      canvasActions.select(undefined);
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
      canvasActions.updateOverlay(selectedId, {
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedId) return;

    const overlay = overlays.find((o) => o.id === selectedId);
    if (overlay?.type === "text") {
      // Enable inline text editing
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create a temporary input for text editing
      const input = document.createElement("input");
      input.type = "text";
      input.value = (overlay as any).text;
      input.style.position = "absolute";
      input.style.left = `${rect.left + x}px`;
      input.style.top = `${rect.top + y}px`;
      input.style.fontSize = `${(overlay as any).size}px`;
      input.style.fontFamily = (overlay as any).font;
      input.style.color = (overlay as any).color;
      input.style.background = "transparent";
      input.style.border = "none";
      input.style.outline = "none";

      document.body.appendChild(input);
      input.focus();
      input.select();

      const handleInputKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === "Escape") {
          if (e.key === "Enter") {
            canvasActions.updateOverlay(selectedId, { text: input.value });
          }
          document.body.removeChild(input);
          document.removeEventListener("keydown", handleInputKeyDown);
        }
      };

      const handleInputBlur = () => {
        canvasActions.updateOverlay(selectedId, { text: input.value });
        document.body.removeChild(input);
        document.removeEventListener("keydown", handleInputKeyDown);
      };

      input.addEventListener("blur", handleInputBlur);
      document.addEventListener("keydown", handleInputKeyDown);
    }
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-sm bg-gray-50"
          style={{ width: "100%", maxWidth: "800px", height: "auto" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
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
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          Canvas: {Math.round(crop.w)} × {Math.round(crop.h)} • 16:9 aspect
          ratio
        </div>
      )}
    </div>
  );
}
