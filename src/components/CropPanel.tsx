import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCanvasStore } from "@/state/canvasStore";

export function CropPanel() {
  const { crop, image, videoSrc, setCrop } = useCanvasStore();
  const [autoCrop, setAutoCrop] = useState(true);

  const hasContent = image || videoSrc;

  useEffect(() => {
    if (hasContent && autoCrop && !crop.active) {
      // Auto-enable crop when content is loaded
      setCrop({ active: true });
    }
  }, [hasContent, autoCrop, crop.active, setCrop]);

  const handleCropChange = (field: keyof typeof crop, value: number) => {
    setCrop({ [field]: value });
  };

  const handleSliderChange = (field: keyof typeof crop, values: number[]) => {
    setCrop({ [field]: values[0] });
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
        {/* Auto-crop toggle */}
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
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aspect ratio info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="font-medium">16:9 Aspect Ratio</div>
          <div>Current: {(crop.w / crop.h).toFixed(2)}:1</div>
          {Math.abs(crop.w / crop.h - 16 / 9) > 0.01 && (
            <div className="text-amber-600">⚠️ Not exactly 16:9</div>
          )}
        </div>

        {/* Reset button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (image) {
                const newCrop = calculateAutoCrop(image);
                setCrop(newCrop);
              }
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Reset to auto-crop
          </button>
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
