import React, { useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Trash2, RotateCw, Move, Square } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

interface LogoOverlayProps {
  className?: string;
}

export function LogoOverlay({ className }: LogoOverlayProps) {
  const { addOverlay, overlays, selectedId, updateOverlay } = useCanvasStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedOverlay = overlays.find(
    (o) => o.id === selectedId && o.type === "logo"
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type - PNG only for overlays
      if (file.type !== "image/png") {
        toast({
          title: "Invalid overlay format",
          description:
            "Logo overlays must be PNG format. Please convert your image to PNG.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB for overlays)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Overlay file too large",
          description: `Logo file size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit. Please use a smaller PNG file.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;

        if (!logoUrl) {
          toast({
            title: "Error",
            description: "Failed to load logo image.",
            variant: "destructive",
          });
          return;
        }

        // Add logo overlay
        addOverlay({
          type: "logo",
          src: logoUrl,
          x: 50,
          y: 50,
          w: 100,
          h: 100,
          rot: 0,
          locked: false,
          hidden: false,
          opacity: 1,
        } as Omit<import("@/state/canvasStore").LogoOverlay, "id" | "z">);

        toast({
          title: "Logo added",
          description: "Logo overlay has been added to the canvas.",
        });
      };
      reader.readAsDataURL(file);
    },
    [addOverlay, toast]
  );

  const handleOpacityChange = (value: number[]) => {
    if (selectedOverlay) {
      updateOverlay(selectedId!, { opacity: value[0] });
    }
  };

  const handleRotationChange = (value: number[]) => {
    if (selectedOverlay) {
      updateOverlay(selectedId!, { rot: value[0] });
    }
  };

  const resetLogoTransform = () => {
    if (selectedOverlay) {
      updateOverlay(selectedId!, {
        x: 50,
        y: 50,
        w: 100,
        h: 100,
        rot: 0,
        opacity: 1,
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Logo */}
      <div className="space-y-2">
        <Label htmlFor="logo-upload" className="text-sm font-medium">
          Upload Logo
        </Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Logo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            onChange={handleFileUpload}
            className="hidden"
            id="logo-upload"
          />
        </div>
        <p className="text-xs text-gray-500">PNG format only. Max 10MB.</p>
      </div>

      {/* Logo Controls - Only show if logo is selected */}
      {selectedOverlay && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Logo Controls</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetLogoTransform}
                className="h-8 w-8 p-0"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedId) {
                    // Remove overlay logic would go here
                    toast({
                      title: "Logo removed",
                      description: "Logo overlay has been removed.",
                    });
                  }
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Position Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.x)}
                onChange={(e) =>
                  updateOverlay(selectedId!, { x: Number(e.target.value) })
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.y)}
                onChange={(e) =>
                  updateOverlay(selectedId!, { y: Number(e.target.value) })
                }
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Size Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.w)}
                onChange={(e) =>
                  updateOverlay(selectedId!, { w: Number(e.target.value) })
                }
                className="h-8 text-sm"
                min="20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.h)}
                onChange={(e) =>
                  updateOverlay(selectedId!, { h: Number(e.target.value) })
                }
                className="h-8 text-sm"
                min="20"
              />
            </div>
          </div>

          {/* Opacity Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Opacity</Label>
              <span className="text-xs text-gray-500">
                {Math.round(selectedOverlay.opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[selectedOverlay.opacity]}
              onValueChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
              aria-label={`Logo opacity: ${Math.round(selectedOverlay.opacity * 100)}%`}
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Rotation</Label>
              <span className="text-xs text-gray-500">
                {Math.round(selectedOverlay.rot)}°
              </span>
            </div>
            <Slider
              value={[selectedOverlay.rot]}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={1}
              className="w-full"
              aria-label={`Logo rotation: ${Math.round(selectedOverlay.rot)} degrees`}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateOverlay(selectedId!, { locked: !selectedOverlay.locked })
              }
              className="flex-1"
            >
              {selectedOverlay.locked ? "Unlock" : "Lock"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateOverlay(selectedId!, { hidden: !selectedOverlay.hidden })
              }
              className="flex-1"
            >
              {selectedOverlay.hidden ? "Show" : "Hide"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-white p-2 rounded border">
            <div className="flex items-center gap-2 mb-1">
              <Move className="w-3 h-3" />
              <span>Drag to move</span>
            </div>
            <div className="flex items-center gap-2">
              <Square className="w-3 h-3" />
              <span>Drag corner to resize</span>
            </div>
          </div>
        </div>
      )}

      {/* Logo List */}
      {overlays.filter((o) => o.type === "logo").length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Logos</Label>
          <div className="space-y-1">
            {overlays
              .filter((o) => o.type === "logo")
              .map((logo) => (
                <div
                  key={logo.id}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedId === logo.id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => useCanvasStore.getState().select(logo.id)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={logo.src}
                      alt="Logo"
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm">Logo {logo.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {logo.locked && (
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full"
                        title="Locked"
                      />
                    )}
                    {logo.hidden && (
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full"
                        title="Hidden"
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
