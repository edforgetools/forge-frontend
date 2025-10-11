import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/Button";
import { useCanvasStore } from "@/state/canvasStore";
import { Lock, RotateCcw } from "lucide-react";

export function CropPanel() {
  const { crop, image, videoSrc, setCrop } = useCanvasStore();
  const [autoCrop, setAutoCrop] = useState(true);
  const [lockAspectRatio] = useState(true); // Always locked for Snapthumb

  const hasContent = image || videoSrc;

  useEffect(() => {
    if (hasContent && autoCrop && !crop.active) {
      // Auto-enable crop when content is loaded
      setCrop({ active: true });
    }
  }, [hasContent, autoCrop, crop.active, setCrop]);

  const handleCropChange = (field: keyof typeof crop, value: number) => {
    if (lockAspectRatio && (field === "w" || field === "h")) {
      // Maintain 16:9 aspect ratio
      const targetRatio = 16 / 9;
      if (field === "w") {
        const newHeight = value / targetRatio;
        setCrop({ [field]: value, h: newHeight });
      } else if (field === "h") {
        const newWidth = value * targetRatio;
        setCrop({ [field]: value, w: newWidth });
      }
    } else {
      setCrop({ [field]: value });
    }
  };

  const handleSliderChange = (field: keyof typeof crop, values: number[]) => {
    handleCropChange(field, values[0] ?? 0);
  };

  const resetToAutoCrop = () => {
    if (image) {
      const newCrop = calculateAutoCrop(image);
      setCrop(newCrop);
    } else if (videoSrc) {
      // Default crop for video
      setCrop({
        x: 0,
        y: 0,
        w: 1280,
        h: 720,
        active: true,
      });
    }
  };

  if (!hasContent) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-4">
          Upload an image or video to enable cropping
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-crop"
              checked={autoCrop}
              onCheckedChange={(checked) => setAutoCrop(checked as boolean)}
            />
            <Label htmlFor="auto-crop" className="text-sm font-medium">
              Auto-crop on load
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={true}
              className="h-8 w-8 p-0 opacity-50"
              title="16:9 aspect ratio is locked for Snapthumb"
            >
              <Lock className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToAutoCrop}
              className="h-8 px-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Crop dimensions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop-x" className="text-sm">
                X Position
              </Label>
              <div className="space-y-2">
                <Input
                  id="crop-x"
                  type="number"
                  value={Math.round(crop.x)}
                  onChange={(e) =>
                    handleCropChange("x", Number(e.target.value))
                  }
                  className="h-8"
                />
                <Slider
                  value={[crop.x]}
                  onValueChange={(values) => handleSliderChange("x", values)}
                  max={image ? image.width - crop.w : 1920 - crop.w}
                  step={1}
                  className="w-full"
                  aria-label={`Crop X position: ${Math.round(crop.x)} pixels`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop-y" className="text-sm">
                Y Position
              </Label>
              <div className="space-y-2">
                <Input
                  id="crop-y"
                  type="number"
                  value={Math.round(crop.y)}
                  onChange={(e) =>
                    handleCropChange("y", Number(e.target.value))
                  }
                  className="h-8"
                />
                <Slider
                  value={[crop.y]}
                  onValueChange={(values) => handleSliderChange("y", values)}
                  max={image ? image.height - crop.h : 1080 - crop.h}
                  step={1}
                  className="w-full"
                  aria-label={`Crop Y position: ${Math.round(crop.y)} pixels`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop-w" className="text-sm">
                Width
              </Label>
              <div className="space-y-2">
                <Input
                  id="crop-w"
                  type="number"
                  value={Math.round(crop.w)}
                  onChange={(e) =>
                    handleCropChange("w", Number(e.target.value))
                  }
                  className="h-8"
                />
                <Slider
                  value={[crop.w]}
                  onValueChange={(values) => handleSliderChange("w", values)}
                  max={image ? image.width : 1920}
                  min={100}
                  step={1}
                  className="w-full"
                  aria-label={`Crop width: ${Math.round(crop.w)} pixels`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crop-h" className="text-sm">
                Height
              </Label>
              <div className="space-y-2">
                <Input
                  id="crop-h"
                  type="number"
                  value={Math.round(crop.h)}
                  onChange={(e) =>
                    handleCropChange("h", Number(e.target.value))
                  }
                  className="h-8"
                />
                <Slider
                  value={[crop.h]}
                  onValueChange={(values) => handleSliderChange("h", values)}
                  max={image ? image.height : 1080}
                  min={100}
                  step={1}
                  className="w-full"
                  aria-label={`Crop height: ${Math.round(crop.h)} pixels`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aspect ratio info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              16:9 Aspect Ratio (Required for Snapthumb)
            </div>
            <div className="text-xs">{(crop.w / crop.h).toFixed(2)}:1</div>
          </div>
          {Math.abs(crop.w / crop.h - 16 / 9) > 0.01 && (
            <div className="text-amber-600 mt-1">⚠️ Not exactly 16:9</div>
          )}
          <div className="text-blue-600 mt-1">
            🔒 16:9 aspect ratio is enforced for Snapthumb
          </div>
        </div>

        {/* Quick preset buttons */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900">Quick Presets</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const targetRatio = 16 / 9;
                const newHeight = crop.w / targetRatio;
                setCrop({ h: newHeight });
              }}
              className="text-xs"
            >
              16:9
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const targetRatio = 1;
                const newHeight = crop.w / targetRatio;
                setCrop({ h: newHeight });
              }}
              className="text-xs"
            >
              1:1
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateAutoCrop(image: HTMLImageElement | ImageBitmap): {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
} {
  const imgWidth = image.width;
  const imgHeight = image.height;
  const targetRatio = 16 / 9;

  let cropWidth = imgWidth;
  let cropHeight = imgHeight;
  let cropX = 0;
  let cropY = 0;

  const currentRatio = imgWidth / imgHeight;

  if (currentRatio > targetRatio) {
    // Image is wider than 16:9, crop width
    cropWidth = imgHeight * targetRatio;
    cropX = (imgWidth - cropWidth) / 2;
  } else if (currentRatio < targetRatio) {
    // Image is taller than 16:9, crop height
    cropHeight = imgWidth / targetRatio;
    cropY = (imgHeight - cropHeight) / 2;
  }

  return {
    x: cropX,
    y: cropY,
    w: cropWidth,
    h: cropHeight,
    active: true,
  };
}
