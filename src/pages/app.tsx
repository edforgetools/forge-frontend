import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { CanvasStage } from "../components/CanvasStage";
import { FrameGrabber } from "../components/FrameGrabber";
import { Cropper } from "../components/Cropper";
import { Overlay } from "../components/Overlay";
import { ExportBar } from "../components/ExportBar";
import { Settings } from "../components/Settings";

// Lazy load heavy components
const ShortcutsOverlay = lazy(() => import("../components/ShortcutsOverlay"));
import { useCanvas } from "../hooks/useCanvas";
import { useOverlay } from "../hooks/useOverlay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { sessionDB } from "@/lib/db";
import type { CompressionSettings } from "@/components/CompressionSelector";

interface AppPageProps {
  onBack: () => void;
}

export default function AppPage({ onBack }: AppPageProps) {
  const [canvasState, canvasActions] = useCanvas();
  const [overlayState, overlayActions] = useOverlay();
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
  const [isRestoring, setIsRestoring] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

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
      quality?: number,
      compressionSettings?: CompressionSettings
    ) => {
      try {
        return await canvasActions.exportCanvas(
          format,
          quality,
          compressionSettings
        );
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

  // Session restore functionality
  const restoreSession = useCallback(async () => {
    if (!sessionDB.isSessionRestoreEnabled()) return;

    setIsRestoring(true);
    try {
      const sessionData = await canvasActions.restoreSession();
      if (sessionData) {
        // Restore overlays
        await overlayActions.restoreSession();

        // Restore crop area if available
        if (sessionData.cropArea) {
          setCropArea(sessionData.cropArea);
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    } finally {
      setIsRestoring(false);
    }
  }, [canvasActions, overlayActions]);

  // Save session data periodically
  const saveSession = useCallback(async () => {
    if (!sessionDB.isSessionRestoreEnabled()) return;

    try {
      await Promise.all([
        canvasActions.saveSession(),
        overlayActions.saveSession(),
      ]);
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }, [canvasActions, overlayActions]);

  // Auto-save session data when state changes
  useEffect(() => {
    const timeoutId = setTimeout(saveSession, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [canvasState, overlayState, cropArea, saveSession]);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const handleClearSession = useCallback(() => {
    setCurrentMedia(null);
    setMediaType(null);
    setCropArea(null);
    setShowCropOverlay(false);
    canvasActions.clearCanvas();
    overlayActions.clearAll();
  }, [canvasActions, overlayActions]);

  // Undo/Redo handlers - simple approach using overlay state
  const handleUndo = useCallback(() => {
    overlayActions.undo();
  }, [overlayActions]);

  const handleRedo = useCallback(() => {
    overlayActions.redo();
  }, [overlayActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Undo/Redo shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Other shortcuts
      switch (event.key.toLowerCase()) {
        case "u":
          // Upload - handled by FrameGrabber component
          break;
        case "f":
          // Capture - handled by FrameGrabber component
          break;
        case "c":
          event.preventDefault();
          handleToggleCropOverlay();
          break;
        case "v":
          // Move - could be implemented for canvas panning
          break;
        case "t":
          // Text - handled by Overlay component
          break;
        case "e":
          // Export - could trigger export dialog
          break;
        case "r":
          // Toggle Restore - could toggle session restore setting
          break;
        case "?":
          event.preventDefault();
          setShowShortcuts(true);
          break;
        case "escape":
          if (showShortcuts) {
            setShowShortcuts(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleToggleCropOverlay, showShortcuts]);

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Show keyboard shortcuts"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Shortcuts
            </Button>
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
              <Overlay
                overlayState={overlayState}
                overlayActions={overlayActions}
              />
            </div>

            {/* Center Panel - Canvas */}
            <div className="lg:col-span-2">
              {isRestoring && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-blue-800 text-sm">
                      Restoring session...
                    </span>
                  </div>
                </div>
              )}
              <CanvasStage
                cropArea={cropArea || undefined}
                showCropOverlay={showCropOverlay}
                onCropChange={handleCropChange}
                canvasState={canvasState}
                canvasActions={canvasActions}
                overlayState={overlayState}
                overlayActions={overlayActions}
              />
            </div>

            {/* Right Panel - Settings */}
            <div className="lg:col-span-1">
              <Settings onClearSession={handleClearSession} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Export */}
      <div className="flex-shrink-0">
        <ExportBar
          onExport={handleExport}
          hasContent={canvasState.hasContent}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={overlayState.historyIndex >= 0}
          canRedo={overlayState.historyIndex < overlayState.history.length - 1}
        />
      </div>

      {/* Shortcuts Overlay */}
      <Suspense fallback={<div>Loading shortcuts...</div>}>
        <ShortcutsOverlay
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      </Suspense>
    </div>
  );
}
