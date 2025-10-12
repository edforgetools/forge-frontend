import { useState, useCallback } from "react";
import { useCanvasStore } from "@/state/canvasStore";
import { useSnapthumbStore } from "@/lib/snapthumb-state";
import { AccessibleCanvasStage } from "./AccessibleCanvasStage";
import { LazySnapthumbCanvas, LazyControls } from "./LazySnapthumbCanvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, Settings, Grid3X3 } from "lucide-react";

interface UnifiedCanvasProps {
  onDragStateChange?: (isDragging: boolean) => void;
}

export function UnifiedCanvas({ onDragStateChange }: UnifiedCanvasProps) {
  const [isSnapthumbMode, setIsSnapthumbMode] = useState(false);
  const [showSnapthumbControls, setShowSnapthumbControls] = useState(false);

  const { image, videoSrc, overlays } = useCanvasStore();
  const snapthumbConfig = useSnapthumbStore((state) => state.config);

  const hasContent = image || videoSrc;
  const hasOverlays = overlays.length > 0;

  // Convert canvas store image to background image URL for SnapthumbCanvas
  const getBackgroundImageUrl = useCallback(() => {
    if (image) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL("image/jpeg", 0.9);
      }
    }
    return undefined;
  }, [image]);

  // Convert overlays to overlay image for SnapthumbCanvas
  const getOverlayImageUrl = useCallback(() => {
    if (hasOverlays) {
      // For now, we'll use the first logo overlay as the overlay image
      const logoOverlay = overlays.find((overlay) => overlay.type === "logo");
      if (logoOverlay) {
        return (logoOverlay as { src: string }).src;
      }
    }
    return undefined;
  }, [overlays, hasOverlays]);

  const handlePositionChange = useCallback(() => {
    // Update canvas store with SnapthumbCanvas position changes
    if (hasOverlays) {
      const logoOverlay = overlays.find((overlay) => overlay.type === "logo");
      if (logoOverlay) {
        // Update the overlay position based on SnapthumbCanvas calculations
        // This would need to be implemented based on your specific requirements
      }
    }
  }, [overlays, hasOverlays]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mode Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="snapthumb-mode" className="text-sm font-medium">
            Snapthumb Mode
          </Label>
          <input
            id="snapthumb-mode"
            type="checkbox"
            checked={isSnapthumbMode}
            onChange={(e) => setIsSnapthumbMode(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {isSnapthumbMode && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSnapthumbControls(!showSnapthumbControls)}
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSnapthumbControls ? "Hide" : "Show"} Controls
          </Button>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex gap-4">
        {/* Canvas */}
        <div className="flex-1">
          {isSnapthumbMode ? (
            <LazySnapthumbCanvas
              backgroundImage={getBackgroundImageUrl()}
              overlayImage={getOverlayImageUrl()}
              className="w-full h-full"
              onPositionChange={handlePositionChange}
            />
          ) : (
            <AccessibleCanvasStage onDragStateChange={onDragStateChange} />
          )}
        </div>

        {/* Snapthumb Controls Sidebar */}
        {isSnapthumbMode && showSnapthumbControls && (
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Grid3X3 className="w-4 h-4" />
                  Snapthumb Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    Canvas: {snapthumbConfig.canvasWidth} ×{" "}
                    {snapthumbConfig.canvasHeight}
                  </div>
                  <div>Position: {snapthumbConfig.gridPosition}</div>
                  <div>Scale: {Math.round(snapthumbConfig.scale * 100)}%</div>
                  <div>Opacity: {snapthumbConfig.opacity}%</div>
                  <div>Quality: {snapthumbConfig.quality}</div>
                </div>
              </CardContent>
            </Card>

            <LazyControls className="max-h-96 overflow-y-auto" />
          </div>
        )}
      </div>

      {/* Mode Info */}
      {isSnapthumbMode && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Camera className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900">
                Snapthumb Mode Active
              </div>
              <div className="text-blue-700">
                Use the 9-grid positioning system and smart cropping for
                optimized thumbnails.
                {!hasContent && " Upload content to get started."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
