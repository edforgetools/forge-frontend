import React, { useState } from "react";
import { SnapthumbEditor } from "@/components/SnapthumbCanvas";

export default function Index() {
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [overlayImage, setOverlayImage] = useState<string>();
  const [generatedImage, setGeneratedImage] = useState<string>();

  const handleGenerate = (canvas: HTMLCanvasElement) => {
    // Convert canvas to blob and create download link
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setGeneratedImage(url);

          // Create download link
          const link = document.createElement("a");
          link.download = "snapthumb.png";
          link.href = url;
          link.click();
        }
      },
      "image/png",
      1.0
    );
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
    }
  };

  const handleOverlayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOverlayImage(url);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Snapthumb Canvas Editor
            </h1>
            <p className="text-muted-foreground">
              Create perfect thumbnails with 9-grid positioning, drag controls,
              and live preview
            </p>
          </div>

          {/* Upload Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <h3 className="font-medium mb-2">Background Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {backgroundImage && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ Background image loaded
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <h3 className="font-medium mb-2">Overlay Image</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleOverlayUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {overlayImage && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ Overlay image loaded
                </div>
              )}
            </div>
          </div>

          {/* Main Editor */}
          <SnapthumbEditor
            backgroundImage={backgroundImage}
            overlayImage={overlayImage}
            onGenerate={handleGenerate}
            className="mb-8"
          />

          {/* Generated Result */}
          {generatedImage && (
            <div className="mt-8 p-6 border border-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Generated Thumbnail
              </h3>
              <div className="flex justify-center">
                <img
                  src={generatedImage}
                  alt="Generated thumbnail"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Controls</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use 9-grid presets for quick positioning</li>
                  <li>• Drag overlay to fine-tune position</li>
                  <li>• Arrow keys: 1px movement</li>
                  <li>• Shift + Arrow: 10px movement</li>
                  <li>• Adjust scale, opacity, and padding</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live canvas preview</li>
                  <li>• URL state persistence</li>
                  <li>• Touch device support</li>
                  <li>• Background fit options</li>
                  <li>• Quality presets for export</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
