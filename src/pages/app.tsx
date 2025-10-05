import { useState, useCallback } from "react";
import { CanvasStage } from "../components/CanvasStage";
import { FrameGrabber } from "../components/FrameGrabber";
import { Cropper } from "../components/Cropper";
import { Overlay } from "../components/Overlay";
import { ExportBar } from "../components/ExportBar";
import { useCanvas } from "../hooks/useCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AppPageProps {
  onBack: () => void;
}

export default function AppPage({ onBack }: AppPageProps) {
  const [canvasState, canvasActions] = useCanvas();
  const [currentMedia, setCurrentMedia] = useState<
    HTMLImageElement | HTMLVideoElement | null
  >(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showCropOverlay, setShowCropOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFrameCaptured = useCallback(
    (media: HTMLImageElement | HTMLVideoElement, type: "image" | "video") => {
      setCurrentMedia(media);
      setMediaType(type);
      setError(null);

      if (type === "image") {
        // Draw image to canvas
        canvasActions.drawImage(media as HTMLImageElement);
      } else if (type === "video") {
        // For video, we'll extract a frame at the current timestamp
        const video = media as HTMLVideoElement;
        const timestamp = video.currentTime || video.duration / 2;
        canvasActions.drawVideoFrame(video, timestamp);
      }
    },
    [canvasActions]
  );

  const handleCropComplete = useCallback(
    (newCropArea: { x: number; y: number; width: number; height: number }) => {
      setCropArea(newCropArea);

      // Redraw with crop area
      if (currentMedia && mediaType === "image") {
        canvasActions.drawImage(currentMedia as HTMLImageElement, newCropArea);
      }
    },
    [currentMedia, mediaType, canvasActions]
  );

  const handleCropChange = useCallback(
    (newCropArea: { x: number; y: number; width: number; height: number }) => {
      setCropArea(newCropArea);
    },
    []
  );

  const handleToggleCropOverlay = useCallback(() => {
    setShowCropOverlay(!showCropOverlay);
  }, [showCropOverlay]);

  const handleExport = useCallback(
    async (
      format?: "image/jpeg" | "image/webp" | "image/png",
      quality?: number
    ) => {
      try {
        return await canvasActions.exportCanvas(format, quality);
      } catch (error) {
        console.error("Export error:", error);
        throw error;
      }
    },
    [canvasActions]
  );

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error("App error:", errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Snapthumb Editor
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {currentMedia && (
              <div className="text-sm text-gray-600">
                {mediaType === "image" ? "📷" : "🎬"}
                {currentMedia instanceof HTMLImageElement ? " Image" : " Video"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-red-800 text-sm">⚠️ {error}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Tools */}
            <div className="lg:col-span-1 space-y-4">
              <FrameGrabber
                onFrameCaptured={handleFrameCaptured}
                onError={handleError}
              />
              <Cropper
                onCropComplete={handleCropComplete}
                sourceImage={currentMedia || undefined}
                canvasWidth={canvasState.width}
                canvasHeight={canvasState.height}
                showCropOverlay={showCropOverlay}
                onToggleCropOverlay={handleToggleCropOverlay}
              />
              <Overlay />
            </div>

            {/* Center Panel - Canvas */}
            <div className="lg:col-span-2">
              <CanvasStage
                cropArea={cropArea || undefined}
                showCropOverlay={showCropOverlay}
                onCropChange={handleCropChange}
                canvasState={canvasState}
                canvasActions={canvasActions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Export */}
      <div className="flex-shrink-0">
        <ExportBar
          onExport={handleExport}
          hasContent={canvasState.hasContent}
        />
      </div>
    </div>
  );
}
