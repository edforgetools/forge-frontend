import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, Upload, Camera } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { UnifiedCanvas } from "./UnifiedCanvas";
import { StickyFooter } from "./StickyFooter";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { UserProfile } from "./UserProfile";
import { AuthModal } from "./AuthModal";
import { StatusBar } from "./StatusBar";
import { WireGenerate } from "./WireGenerate";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";
import { useModalStore, modalActions } from "@/state/modalStore";
import { useAutosave } from "@/hooks/useAutosave";

interface EditorLayoutProps {
  onBack: () => void;
}

export function EditorLayout({ onBack }: EditorLayoutProps) {
  const [isDragging, setIsDragging] = useState(false);

  const { image, videoSrc, overlays, selectedId } = useCanvasStore();
  const { shortcutsOpen, authOpen, authMode } = useModalStore();

  // Initialize autosave
  useAutosave();

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

      // Global shortcuts
      switch (event.key.toLowerCase()) {
        case "escape":
          if (shortcutsOpen) {
            modalActions.closeShortcuts();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, overlays, shortcutsOpen]);

  const hasContent = image || videoSrc;

  return (
    <div
      className="editor-layout h-[100dvh] bg-background"
      data-testid="editor-layout"
      role="application"
      aria-label="Snapthumb Editor"
    >
      {/* Clean Single Screen Layout */}
      <div className="flex flex-col h-full">
        {/* Minimal Header */}
        <header className="bg-surface-elevated border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="md"
                onClick={onBack}
                className="text-text-secondary hover:text-text-primary"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-text-primary" />
                <h1 className="text-lg font-medium text-text-primary">
                  Create a thumbnail
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => modalActions.openShortcuts()}
                className="text-text-secondary hover:text-text-primary"
                aria-label="Show keyboard shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              {hasContent && (
                <div className="text-xs text-text-tertiary bg-surface px-2 py-1 rounded-md">
                  {image ? "Image" : "Video"}
                </div>
              )}
              <UserProfile
                onSignInClick={() => modalActions.openAuth("signin")}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Upload Area - Only show when no content */}
          {!hasContent && (
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="w-full max-w-2xl">
                <CardContent className="p-8">
                  <div className="text-center flex flex-col gap-6">
                    <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-text-secondary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-xl font-medium text-text-primary">
                        Upload your media
                      </h2>
                      <p className="text-sm text-text-secondary">
                        Upload an image or video. Processing happens locally.
                      </p>
                    </div>
                    <UploadDropzone />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Canvas Area - Show when content is loaded */}
          {hasContent && (
            <div className="flex-1 flex flex-col">
              {/* Canvas Stage */}
              <div className="flex-1 flex items-center justify-center p-8 bg-surface">
                <div className="w-full max-w-6xl">
                  <div
                    className="canvas-aspect-box w-full flex items-center justify-center bg-surface-elevated rounded-xl border border-border shadow-sm"
                    style={{
                      aspectRatio: "16/9",
                      minHeight: "400px",
                    }}
                  >
                    <UnifiedCanvas onDragStateChange={setIsDragging} />
                  </div>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="bg-surface-elevated border-t border-border-subtle p-6">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-text-secondary">
                      {image ? "Image" : "Video"} loaded
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Wire Generate Component */}
                    <WireGenerate
                      onResult={(result) => {
                        console.log("Wire Generate Result:", result);
                      }}
                    />
                    {/* Export Button */}
                    <StickyFooter isDragging={isDragging} />
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <StatusBar />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ShortcutsSheet
        isOpen={shortcutsOpen}
        onClose={() => modalActions.closeShortcuts()}
      />

      <AuthModal
        open={authOpen}
        onOpenChange={(open) =>
          open ? modalActions.openAuth() : modalActions.closeAuth()
        }
        defaultMode={authMode}
      />
    </div>
  );
}
