import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSnapthumbStore } from "@/lib/snapthumb-state";
import { GridPosition, GRID_POSITION_MAP, CalculatedPosition } from "./types";

interface SnapthumbCanvasProps {
  backgroundImage?: string;
  overlayImage?: string;
  className?: string;
  onPositionChange?: (position: CalculatedPosition) => void;
}

export function SnapthumbCanvas({
  backgroundImage,
  overlayImage,
  className = "",
  onPositionChange,
}: SnapthumbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const config = useSnapthumbStore((state) => state.config);
  const updateConfig = useSnapthumbStore((state) => state.updateConfig);

  // Calculate overlay position and dimensions
  const calculatedPosition = useMemo((): CalculatedPosition => {
    const { canvasWidth, canvasHeight, gridPosition, padding, scale } = config;

    // Get grid anchor point (0-1 range)
    const anchor = GRID_POSITION_MAP[gridPosition];

    // Calculate overlay dimensions based on scale
    const overlayWidth = canvasWidth * scale;
    const overlayHeight = canvasHeight * scale;

    // Calculate position with padding
    let x: number;
    let y: number;

    switch (anchor.x) {
      case 0: // Left
        x = padding;
        break;
      case 0.5: // Center
        x = (canvasWidth - overlayWidth) / 2;
        break;
      case 1: // Right
        x = canvasWidth - overlayWidth - padding;
        break;
      default:
        x = 0;
    }

    switch (anchor.y) {
      case 0: // Top
        y = padding;
        break;
      case 0.5: // Center
        y = (canvasHeight - overlayHeight) / 2;
        break;
      case 1: // Bottom
        y = canvasHeight - overlayHeight - padding;
        break;
      default:
        y = 0;
    }

    // Apply drag offset
    x += dragOffset.x;
    y += dragOffset.y;

    // Clamp to canvas bounds
    x = Math.max(0, Math.min(x, canvasWidth - overlayWidth));
    y = Math.max(0, Math.min(y, canvasHeight - overlayHeight));

    return {
      x,
      y,
      width: overlayWidth,
      height: overlayHeight,
      scale,
    };
  }, [config, dragOffset]);

  // Draw canvas content
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { canvasWidth, canvasHeight, opacity, backgroundFit } = config;

    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background image if available
    if (backgroundImage) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";

      await new Promise<void>((resolve) => {
        bgImg.onload = () => {
          switch (backgroundFit) {
            case "contain":
              // Scale to fit within canvas while maintaining aspect ratio
              const bgScale = Math.min(
                canvasWidth / bgImg.width,
                canvasHeight / bgImg.height
              );
              const bgWidth = bgImg.width * bgScale;
              const bgHeight = bgImg.height * bgScale;
              const bgX = (canvasWidth - bgWidth) / 2;
              const bgY = (canvasHeight - bgHeight) / 2;
              ctx.drawImage(bgImg, bgX, bgY, bgWidth, bgHeight);
              break;

            case "cover":
              // Scale to cover entire canvas while maintaining aspect ratio
              const coverScale = Math.max(
                canvasWidth / bgImg.width,
                canvasHeight / bgImg.height
              );
              const coverWidth = bgImg.width * coverScale;
              const coverHeight = bgImg.height * coverScale;
              const coverX = (canvasWidth - coverWidth) / 2;
              const coverY = (canvasHeight - coverHeight) / 2;
              ctx.drawImage(bgImg, coverX, coverY, coverWidth, coverHeight);
              break;

            case "crop-16-9":
              // Crop to 16:9 aspect ratio
              const cropScale = Math.max(
                canvasWidth / bgImg.width,
                canvasHeight / bgImg.height
              );
              const cropWidth = bgImg.width * cropScale;
              const cropHeight = bgImg.height * cropScale;
              const cropX = (canvasWidth - cropWidth) / 2;
              const cropY = (canvasHeight - cropHeight) / 2;

              // Calculate 16:9 crop area
              const targetAspect = 16 / 9;
              const canvasAspect = canvasWidth / canvasHeight;

              let sourceX = 0;
              let sourceY = 0;
              let sourceWidth = bgImg.width;
              let sourceHeight = bgImg.height;

              if (canvasAspect > targetAspect) {
                // Canvas is wider than 16:9, crop sides
                sourceWidth = bgImg.height * targetAspect;
                sourceX = (bgImg.width - sourceWidth) / 2;
              } else {
                // Canvas is taller than 16:9, crop top/bottom
                sourceHeight = bgImg.width / targetAspect;
                sourceY = (bgImg.height - sourceHeight) / 2;
              }

              ctx.drawImage(
                bgImg,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                cropX,
                cropY,
                cropWidth,
                cropHeight
              );
              break;
          }
          resolve();
        };
        bgImg.onerror = () => resolve();
        bgImg.src = backgroundImage;
      });
    } else {
      // Draw default background
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Draw overlay image if available
    if (overlayImage) {
      const overlayImg = new Image();
      overlayImg.crossOrigin = "anonymous";

      await new Promise<void>((resolve) => {
        overlayImg.onload = () => {
          ctx.save();

          // Set opacity
          ctx.globalAlpha = opacity / 100;

          // Draw overlay at calculated position
          ctx.drawImage(
            overlayImg,
            calculatedPosition.x,
            calculatedPosition.y,
            calculatedPosition.width,
            calculatedPosition.height
          );

          ctx.restore();
          resolve();
        };
        overlayImg.onerror = () => resolve();
        overlayImg.src = overlayImage;
      });
    }

    // Notify parent of position change
    onPositionChange?.(calculatedPosition);
  }, [
    config,
    backgroundImage,
    overlayImage,
    calculatedPosition,
    onPositionChange,
  ]);

  // Handle mouse/touch events for dragging
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      // Snap to grid (10px grid)
      const snapSize = 10;
      const snappedX = Math.round(deltaX / snapSize) * snapSize;
      const snappedY = Math.round(deltaY / snapSize) * snapSize;

      setDragOffset({ x: snappedX, y: snappedY });
    },
    [isDragging, dragStart]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Update config with new position based on drag offset
    const { canvasWidth, canvasHeight, padding, scale } = config;
    const overlayWidth = canvasWidth * scale;
    const overlayHeight = canvasHeight * scale;

    // Find the nearest grid position based on final position
    const finalX = calculatedPosition.x;
    const finalY = calculatedPosition.y;

    let newGridPosition = config.gridPosition;
    let minDistance = Infinity;

    // Calculate distance to each grid position
    Object.entries(GRID_POSITION_MAP).forEach(([position, anchor]) => {
      let expectedX: number;
      let expectedY: number;

      switch (anchor.x) {
        case 0:
          expectedX = padding;
          break;
        case 0.5:
          expectedX = (canvasWidth - overlayWidth) / 2;
          break;
        case 1:
          expectedX = canvasWidth - overlayWidth - padding;
          break;
        default:
          expectedX = 0;
      }

      switch (anchor.y) {
        case 0:
          expectedY = padding;
          break;
        case 0.5:
          expectedY = (canvasHeight - overlayHeight) / 2;
          break;
        case 1:
          expectedY = canvasHeight - overlayHeight - padding;
          break;
        default:
          expectedY = 0;
      }

      const distance = Math.sqrt(
        Math.pow(finalX - expectedX, 2) + Math.pow(finalY - expectedY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        newGridPosition = position as GridPosition;
      }
    });

    // Update config if grid position changed
    if (newGridPosition !== config.gridPosition) {
      updateConfig({ gridPosition: newGridPosition });
    }

    // Reset drag offset
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, config, calculatedPosition, updateConfig]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== canvasRef.current) return;

      const step = e.shiftKey ? 10 : 1; // 10px with shift, 1px without
      let deltaX = 0;
      let deltaY = 0;

      switch (e.key) {
        case "ArrowLeft":
          deltaX = -step;
          break;
        case "ArrowRight":
          deltaX = step;
          break;
        case "ArrowUp":
          deltaY = -step;
          break;
        case "ArrowDown":
          deltaY = step;
          break;
        default:
          return;
      }

      e.preventDefault();

      // Update drag offset for keyboard movement
      setDragOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("keydown", handleKeyDown);
      return () => canvas.removeEventListener("keydown", handleKeyDown);
    }
    return undefined;
  }, []);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-neutral-200 rounded-lg cursor-move touch-none"
        style={{ maxWidth: "100%", height: "auto" }}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Grid overlay indicator */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full relative">
          {/* Draw grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#666"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Highlight current grid position */}
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 rounded"
            style={{
              left: `${GRID_POSITION_MAP[config.gridPosition].x * 100}%`,
              top: `${GRID_POSITION_MAP[config.gridPosition].y * 100}%`,
              width: `${config.scale * 100}%`,
              height: `${config.scale * 100}%`,
              transform: `translate(-${GRID_POSITION_MAP[config.gridPosition].x * 100}%, -${GRID_POSITION_MAP[config.gridPosition].y * 100}%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
