import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  HelpCircle,
  Upload,
  Crop,
  Layers,
  Download,
} from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { CropPanel } from "./CropPanel";
import { OverlaysPanel } from "./OverlaysPanel";
import { CanvasStage } from "./CanvasStage";
import { CanvasToolbar } from "./CanvasToolbar";
import { StickyFooter } from "./StickyFooter";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";
import { useAutosave, useProjectManager } from "@/hooks/useAutosave";

interface AppShellProps {
  onBack: () => void;
}

export function AppShell({ onBack }: AppShellProps) {
  const [activePanel, setActivePanel] = useState<
    "upload" | "crop" | "overlays" | "export"
  >("upload");
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { image, videoSrc, overlays, selectedId } = useCanvasStore();

  // Initialize autosave
  useAutosave();
  const { createNewProject, duplicateProject, clearProject } =
    useProjectManager();

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

      // Global shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          canvasActions.redo();
        } else {
          canvasActions.undo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        setActivePanel("export");
        return;
      }

      if (event.key === "Delete" && selectedId) {
        event.preventDefault();
        canvasActions.remove(selectedId);
        return;
      }

      // Arrow keys for nudging
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.key
        ) &&
        selectedId
      ) {
        event.preventDefault();
        const nudgeAmount = event.shiftKey ? 10 : 1;
        const overlay = overlays.find((o) => o.id === selectedId);
        if (!overlay) return;

        let deltaX = 0;
        let deltaY = 0;

        switch (event.key) {
          case "ArrowUp":
            deltaY = -nudgeAmount;
            break;
          case "ArrowDown":
            deltaY = nudgeAmount;
            break;
          case "ArrowLeft":
            deltaX = -nudgeAmount;
            break;
          case "ArrowRight":
            deltaX = nudgeAmount;
            break;
        }

        canvasActions.updateOverlay(selectedId, {
          x: overlay.x + deltaX,
          y: overlay.y + deltaY,
        });
        return;
      }

      // Panel shortcuts
      switch (event.key.toLowerCase()) {
        case "u":
          event.preventDefault();
          setActivePanel("upload");
          break;
        case "c":
          event.preventDefault();
          setActivePanel("crop");
          break;
        case "o":
          event.preventDefault();
          setActivePanel("overlays");
          break;
        case "e":
          event.preventDefault();
          setActivePanel("export");
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
  }, [selectedId, overlays, showShortcuts]);

  const hasContent = image || videoSrc;

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      data-testid="app-shell"
    >
      {/* Sticky Top Toolbar - Centered */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Go back to previous page"
              tabIndex={1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Snapthumb Editor
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="text-gray-600 hover:text-gray-900"
              aria-label="Show keyboard shortcuts"
              tabIndex={2}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Shortcuts
            </Button>
            {hasContent && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {image ? "📷" : "🎬"}
                {image ? " Image" : " Video"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Toolbar Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={activePanel === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("upload")}
                className="justify-start h-10"
                aria-label="Upload panel - Upload images or videos"
                aria-pressed={activePanel === "upload"}
                tabIndex={3}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                variant={activePanel === "crop" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("crop")}
                className="justify-start h-10"
                disabled={!hasContent}
                aria-label="Crop panel - Crop and resize your image"
                aria-pressed={activePanel === "crop"}
                tabIndex={4}
              >
                <Crop className="w-4 h-4 mr-2" />
                Crop
              </Button>
              <Button
                variant={activePanel === "overlays" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("overlays")}
                className="justify-start h-10"
                disabled={!hasContent}
                aria-label="Overlays panel - Add text and logo overlays"
                aria-pressed={activePanel === "overlays"}
                tabIndex={5}
              >
                <Layers className="w-4 h-4 mr-2" />
                Overlays
              </Button>
              <Button
                variant={activePanel === "export" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("export")}
                className="justify-start h-10"
                disabled={!hasContent}
                aria-label="Export panel - Configure and download your thumbnail"
                aria-pressed={activePanel === "export"}
                tabIndex={6}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto p-6">
            {activePanel === "upload" && (
              <Card className="shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <UploadDropzone />
                </CardContent>
              </Card>
            )}
            {activePanel === "crop" && hasContent && (
              <Card className="shadow-sm rounded-2xl">
                <CropPanel />
              </Card>
            )}
            {activePanel === "overlays" && hasContent && (
              <Card className="shadow-sm rounded-2xl">
                <OverlaysPanel />
              </Card>
            )}
            {activePanel === "export" && hasContent && (
              <Card className="shadow-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 py-4">
                      <div className="text-sm font-medium mb-2">
                        Export Options
                      </div>
                      <div className="text-xs">
                        Click the Export button in the bottom-right to configure
                        and download your thumbnail.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={createNewProject}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Create a new project"
                      >
                        New Project
                      </button>
                      <button
                        onClick={duplicateProject}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label="Duplicate current project"
                      >
                        Duplicate Project
                      </button>
                      <button
                        onClick={clearProject}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Clear current project and start over"
                      >
                        Clear Project
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel - Canvas */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Canvas Toolbar */}
          <CanvasToolbar />
          
          <div className="flex-1 p-6">
            <CanvasStage />
          </div>
        </div>
      </div>

      {/* Sticky Export Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <StickyFooter />
      </div>

      {/* Shortcuts Sheet */}
      <ShortcutsSheet
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
