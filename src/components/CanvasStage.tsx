import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  useCanvasStore,
  TextOverlay as TextOverlayType,
  LogoOverlay,
} from "@/state/canvasStore";
import { CanvasTextOverlay } from "./CanvasTextOverlay";
import { CropOverlay } from "./CropOverlay";
import { LayerHost } from "./LayerHost";
import { startHeatmapTracking, stopHeatmapTracking } from "@/lib/heatmap";
import { useViewportScale } from "@/hooks/useViewportScale";
import { checkAndRestoreViewport, saveViewportState } from "@/state/session";
import { modalActions } from "@/state/modalStore";

interface CanvasStageProps {
  onDragStateChange?: (isDragging: boolean) => void;
}

export function CanvasStage({ onDragStateChange }: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    setCrop,
  } = useCanvasStore();

  // Layer selection hook available for future use
  // const { selectedOverlay } = useLayerSelection();

  // Get aspect ratio value for viewport scale calculation
  const getAspectRatioValue = (aspect: string): number => {
    switch (aspect) {
      case "16:9":
        return 16 / 9;
      case "1:1":
        return 1;
      case "9:16":
        return 9 / 16;
      default:
        return 16 / 9;
    }
  };

  // Use viewport scale hook
  const { viewportScale } = useViewportScale(containerRef, {
    targetAspectRatio: getAspectRatioValue(aspect),
    zoom,
    minZoom: 0.5,
    maxZoom: 2,
  });

  // Session restore guard
  // Session restore functionality
  const checkAndSaveViewport = async (viewport: {
    width: number;
    height: number;
  }) => {
    const wasRestored = await checkAndRestoreViewport(viewport);
    await saveViewportState(viewport);
    return wasRestored;
  };

  // Animation frame ref for smooth redraws
  const animationFrameRef = useRef<number | undefined>(undefined);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size to match crop area with proper pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    const logicalWidth = crop.w;
    const logicalHeight = crop.h;

    // Set logical size for CSS
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    // Set actual canvas size for high DPI displays
    canvas.width = logicalWidth * pixelRatio;
    canvas.height = logicalHeight * pixelRatio;

    // Scale context to match device pixel ratio for crisp rendering
    ctx.scale(pixelRatio, pixelRatio);

    // Draw background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

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
        logicalWidth,
        logicalHeight
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
      drawGrid(ctx, logicalWidth, logicalHeight);
    }

    // Draw safe zone if enabled
    if (showSafeZone) {
      drawSafeZone(ctx, logicalWidth, logicalHeight);
    }

    // Draw crop overlay if active
    if (crop.active) {
      drawCropOverlay(ctx, logicalWidth, logicalHeight);
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
    overlay: TextOverlayType | LogoOverlay,
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

    // Draw selection outline with improved styling
    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);

      // Draw main outline
      ctx.strokeRect(
        -overlay.w / 2 - 2,
        -overlay.h / 2 - 2,
        overlay.w + 4,
        overlay.h + 4
      );

      // Draw inner highlight
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        -overlay.w / 2 - 1,
        -overlay.h / 2 - 1,
        overlay.w + 2,
        overlay.h + 2
      );

      ctx.restore();
    }

    ctx.restore();
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    logicalWidth: number,
    logicalHeight: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;

    const gridSize = 20;
    const scaledGridSize = gridSize * zoom;

    // Draw vertical lines
    for (let x = 0; x <= logicalWidth; x += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, logicalHeight);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= logicalHeight; y += scaledGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(logicalWidth, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawSafeZone = (
    ctx: CanvasRenderingContext2D,
    logicalWidth: number,
    logicalHeight: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const safeZoneWidth = logicalWidth * 0.9;
    const safeZoneHeight = logicalHeight * 0.9;

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

  const drawCropOverlay = (
    ctx: CanvasRenderingContext2D,
    logicalWidth: number,
    logicalHeight: number
  ) => {
    // Draw aspect ratio guide based on current aspect
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const guideWidth = logicalWidth * 0.8;

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

  // Session restore guard - check viewport on mount and when viewport changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkViewport = async () => {
      const rect = container.getBoundingClientRect();
      const viewportDimensions = {
        width: rect.width,
        height: rect.height,
      };

      // Only check if we have meaningful dimensions
      if (viewportDimensions.width > 0 && viewportDimensions.height > 0) {
        await checkAndSaveViewport(viewportDimensions);
      }
    };

    // Check on mount
    checkViewport();

    // Set up ResizeObserver to check when viewport changes
    const resizeObserver = new ResizeObserver(() => {
      checkViewport();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkAndSaveViewport]);

  // Canvas-focused keyboard shortcuts
  const handleCanvasKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      // Only handle ? key when canvas is focused
      if (event.key === "?") {
        event.preventDefault();
        modalActions.openShortcuts();
      }
    },
    []
  );

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      data-testid="canvas-stage"
    >
      <div className="relative bg-gray-100 rounded-2xl shadow-lg p-4 md:p-6 w-full max-w-4xl h-full">
        <div
          ref={containerRef}
          className="border border-neutral-200 rounded-xl shadow-sm bg-white overflow-hidden relative mx-auto h-full flex items-center justify-center"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Letterbox areas */}
          {viewportScale.letterboxTop > 0 && (
            <div
              className="absolute top-0 left-0 bg-gray-800"
              style={{
                width: "100%",
                height: `${viewportScale.letterboxTop}px`,
              }}
            />
          )}
          {viewportScale.letterboxBottom > 0 && (
            <div
              className="absolute bottom-0 left-0 bg-gray-800"
              style={{
                width: "100%",
                height: `${viewportScale.letterboxBottom}px`,
              }}
            />
          )}
          {viewportScale.letterboxLeft > 0 && (
            <div
              className="absolute top-0 left-0 bg-gray-800"
              style={{
                width: `${viewportScale.letterboxLeft}px`,
                height: "100%",
              }}
            />
          )}
          {viewportScale.letterboxRight > 0 && (
            <div
              className="absolute top-0 right-0 bg-gray-800"
              style={{
                width: `${viewportScale.letterboxRight}px`,
                height: "100%",
              }}
            />
          )}

          <canvas
            ref={canvasRef}
            className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: `-${(crop.h * viewportScale.scale) / 2}px`,
              marginLeft: `-${(crop.w * viewportScale.scale) / 2}px`,
              maxWidth: "100%",
              maxHeight: "100%",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleCanvasKeyDown}
            tabIndex={13}
            role="img"
            aria-label="Canvas for editing images and overlays"
            aria-describedby="canvas-description shortcuts-hint"
          />

          {/* Render text overlays as separate components with LayerHost */}
          <LayerHost
            onDragStart={() => {
              setIsDragging(true);
              onDragStateChange?.(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              onDragStateChange?.(false);
            }}
            className="absolute inset-0"
          >
            {overlays
              .filter((overlay) => !overlay.hidden && overlay.type === "text")
              .sort((a, b) => a.z - b.z)
              .map((overlay) => (
                <CanvasTextOverlay
                  key={overlay.id}
                  overlay={overlay as TextOverlayType}
                />
              ))}
          </LayerHost>

          {/* Crop Overlay */}
          <CropOverlay
            cropArea={{
              x: crop.x,
              y: crop.y,
              width: crop.w,
              height: crop.h,
            }}
            canvasWidth={crop.w}
            canvasHeight={crop.h}
            isVisible={crop.active}
            onCropChange={(newCrop) => {
              setCrop(newCrop);
            }}
          />
        </div>

        {!hasContent && (
          <div className="absolute inset-4 md:inset-6 flex items-center justify-center bg-white rounded-xl">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No content loaded</div>
              <div className="text-sm">
                Upload an image or video to get started
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas info - Hidden on mobile to save space */}
      {hasContent && (
        <div
          id="canvas-description"
          className="hidden md:block mt-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-200"
          role="status"
          aria-live="polite"
        >
          Canvas: {Math.round(crop.w)} × {Math.round(crop.h)} • {aspect} aspect
          ratio
        </div>
      )}

      {/* Hidden hint for screen readers about shortcuts */}
      <div id="shortcuts-hint" className="sr-only" aria-hidden="true">
        Press the question mark key (?) to open keyboard shortcuts help
      </div>
    </div>
  );
}
