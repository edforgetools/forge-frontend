import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cropTo16to9 } from "@/lib/image";

interface CropperProps {
  onCropComplete?: (cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  sourceImage?: HTMLImageElement | HTMLVideoElement;
  canvasWidth?: number;
  canvasHeight?: number;
  showCropOverlay?: boolean;
  onToggleCropOverlay?: () => void;
}

export function Cropper({
  onCropComplete,
  sourceImage,
  canvasWidth = 800,
  canvasHeight = 450,
  showCropOverlay = false,
  onToggleCropOverlay,
}: CropperProps) {
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  });
  const [isActive, setIsActive] = useState(false);
  const [autoCropEnabled, setAutoCropEnabled] = useState(true);

  // Auto-crop when source image changes
  useEffect(() => {
    if (
      sourceImage &&
      autoCropEnabled &&
      sourceImage instanceof HTMLImageElement
    ) {
      const autoCrop = cropTo16to9(sourceImage);
      setCropArea({
        x: autoCrop.x,
        y: autoCrop.y,
        width: autoCrop.width,
        height: autoCrop.height,
      });
    }
  }, [sourceImage, autoCropEnabled, canvasWidth, canvasHeight]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isActive) return;

    const step = event.shiftKey ? 10 : 1;
    const precision = event.altKey ? 0.1 : 1;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        setCropArea((prev) => ({
          ...prev,
          x: Math.max(0, prev.x - step * precision),
        }));
        break;
      case "ArrowRight":
        event.preventDefault();
        setCropArea((prev) => ({
          ...prev,
          x: Math.min(
            (sourceImage?.width || canvasWidth) - prev.width,
            prev.x + step * precision
          ),
        }));
        break;
      case "ArrowUp":
        event.preventDefault();
        setCropArea((prev) => ({
          ...prev,
          y: Math.max(0, prev.y - step * precision),
        }));
        break;
      case "ArrowDown":
        event.preventDefault();
        setCropArea((prev) => ({
          ...prev,
          y: Math.min(
            (sourceImage?.height || canvasHeight) - prev.height,
            prev.y + step * precision
          ),
        }));
        break;
      case "Enter":
        event.preventDefault();
        onCropComplete?.(cropArea);
        break;
      case "Escape":
        event.preventDefault();
        setIsActive(false);
        break;
    }
  };

  const handleAutoCrop = () => {
    if (sourceImage && sourceImage instanceof HTMLImageElement) {
      const autoCrop = cropTo16to9(sourceImage);
      setCropArea({
        x: autoCrop.x,
        y: autoCrop.y,
        width: autoCrop.width,
        height: autoCrop.height,
      });
    }
  };

  const handleReset = () => {
    setCropArea({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    });
  };

  const aspectRatio = 16 / 9;
  const currentAspectRatio = cropArea.width / cropArea.height;
  const isCorrectAspectRatio =
    Math.abs(currentAspectRatio - aspectRatio) < 0.01;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">16:9 Crop</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="crop-active"
            className="text-sm font-medium text-gray-700"
          >
            Crop Area
          </Label>
          <div className="flex space-x-2">
            <Button
              id="crop-active"
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Active" : "Inactive"}
            </Button>
            {sourceImage && (
              <Button
                size="sm"
                variant={showCropOverlay ? "default" : "outline"}
                onClick={onToggleCropOverlay}
                className="text-xs"
              >
                {showCropOverlay ? "Hide Overlay" : "Show Overlay"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label
              htmlFor="crop-x"
              className="block text-xs text-gray-500 mb-1"
            >
              X Position
            </Label>
            <Input
              id="crop-x"
              type="number"
              value={Math.round(cropArea.x)}
              onChange={(e) =>
                setCropArea((prev) => ({ ...prev, x: Number(e.target.value) }))
              }
              className="text-xs"
              onKeyDown={handleKeyDown}
              disabled={!isActive}
            />
          </div>
          <div>
            <Label
              htmlFor="crop-y"
              className="block text-xs text-gray-500 mb-1"
            >
              Y Position
            </Label>
            <Input
              id="crop-y"
              type="number"
              value={Math.round(cropArea.y)}
              onChange={(e) =>
                setCropArea((prev) => ({ ...prev, y: Number(e.target.value) }))
              }
              className="text-xs"
              onKeyDown={handleKeyDown}
              disabled={!isActive}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <Label
              htmlFor="crop-width"
              className="block text-xs text-gray-500 mb-1"
            >
              Width
            </Label>
            <Input
              id="crop-width"
              type="number"
              value={Math.round(cropArea.width)}
              onChange={(e) => {
                const newWidth = Number(e.target.value);
                const newHeight = newWidth / aspectRatio;
                setCropArea((prev) => ({
                  ...prev,
                  width: newWidth,
                  height: newHeight,
                }));
              }}
              className="text-xs"
              disabled={!isActive}
            />
          </div>
          <div>
            <Label
              htmlFor="crop-height"
              className="block text-xs text-gray-500 mb-1"
            >
              Height
            </Label>
            <Input
              id="crop-height"
              type="number"
              value={Math.round(cropArea.height)}
              onChange={(e) => {
                const newHeight = Number(e.target.value);
                const newWidth = newHeight * aspectRatio;
                setCropArea((prev) => ({
                  ...prev,
                  width: newWidth,
                  height: newHeight,
                }));
              }}
              className="text-xs"
              disabled={!isActive}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="auto-crop"
            checked={autoCropEnabled}
            onChange={(e) => setAutoCropEnabled(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="auto-crop" className="text-xs text-gray-600">
            Auto-crop on image load
          </Label>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAutoCrop}
            disabled={!sourceImage || sourceImage instanceof HTMLVideoElement}
            className="flex-1 text-xs"
          >
            Auto Crop
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="flex-1 text-xs"
          >
            Reset
          </Button>
        </div>

        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Size:</span>
            <span>
              {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Aspect Ratio:</span>
            <span
              className={
                isCorrectAspectRatio ? "text-green-600" : "text-orange-600"
              }
            >
              {currentAspectRatio.toFixed(2)} {isCorrectAspectRatio ? "✓" : "⚠"}
            </span>
          </div>
        </div>

        {isActive && (
          <Button
            size="sm"
            onClick={() => onCropComplete?.(cropArea)}
            className="w-full"
          >
            Apply Crop
          </Button>
        )}
      </div>
    </div>
  );
}
