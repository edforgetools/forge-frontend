import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Settings } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

interface WatermarkToggleProps {
  className?: string;
}

export function WatermarkToggle({ className }: WatermarkToggleProps) {
  const { addOverlay, overlays } = useCanvasStore();
  const { toast } = useToast();

  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState("Snapthumb");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");
  const [showSettings, setShowSettings] = useState(false);

  // Find existing watermark
  const existingWatermark = overlays.find(
    (o) =>
      o.type === "text" &&
      (o as Record<string, unknown>).text === watermarkText &&
      (o as Record<string, unknown>).isWatermark === true
  );

  const handleWatermarkToggle = (enabled: boolean) => {
    setShowWatermark(enabled);

    if (enabled && !existingWatermark) {
      // Add watermark
      const positions = {
        "top-left": { x: 20, y: 20 },
        "top-right": { x: -150, y: 20 },
        "bottom-left": { x: 20, y: -50 },
        "bottom-right": { x: -150, y: -50 },
        center: { x: -75, y: -12 },
      };

      const pos =
        positions[watermarkPosition as keyof typeof positions] ||
        positions["bottom-right"];

      addOverlay({
        type: "text",
        text: watermarkText,
        x: pos.x,
        y: pos.y,
        w: watermarkText.length * 8,
        h: 24,
        rot: 0,
        locked: true,
        hidden: false,
        opacity: watermarkOpacity,
        font: "Arial",
        size: 16,
        weight: 400,
        letter: 0,
        shadow: true,
        align: "center",
        color: "#FFFFFF",
      } as Omit<import("@/state/canvasStore").TextOverlay, "id" | "z">);

      toast({
        title: "Watermark added",
        description: "Watermark has been added to your thumbnail",
      });
    } else if (!enabled && existingWatermark) {
      // Remove watermark
      useCanvasStore.getState().remove(existingWatermark.id);

      toast({
        title: "Watermark removed",
        description: "Watermark has been removed from your thumbnail",
      });
    }
  };

  const handleWatermarkUpdate = () => {
    if (existingWatermark) {
      // Update existing watermark
      useCanvasStore.getState().updateOverlay(existingWatermark.id, {
        text: watermarkText,
        opacity: watermarkOpacity,
      });

      toast({
        title: "Watermark updated",
        description: "Watermark settings have been updated",
      });
    }
  };

  const positionOptions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "center", label: "Center" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          {showWatermark ? (
            <Eye className="w-5 h-5 text-blue-600" />
          ) : (
            <EyeOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <Label htmlFor="watermark-toggle" className="text-sm font-medium">
              Watermark
            </Label>
            <p className="text-xs text-gray-500">
              Add a subtle watermark to your thumbnails
            </p>
          </div>
        </div>

        <Switch
          id="watermark-toggle"
          checked={showWatermark}
          onCheckedChange={handleWatermarkToggle}
        />
      </div>

      {/* Settings Toggle */}
      {showWatermark && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? "Hide Settings" : "Show Settings"}
          </Button>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Watermark Text</Label>
                <Input
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  className="h-8"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500">
                  {watermarkText.length}/20 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  {positionOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        watermarkPosition === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setWatermarkPosition(option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Opacity</Label>
                  <span className="text-xs text-gray-500">
                    {Math.round(watermarkOpacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[watermarkOpacity]}
                  onValueChange={(v) => setWatermarkOpacity(v[0] ?? 0.3)}
                  min={0.1}
                  max={0.8}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleWatermarkUpdate}
                size="sm"
                className="w-full"
              >
                Update Watermark
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded border">
        <p className="font-medium mb-1">About Watermarks:</p>
        <ul className="space-y-1 text-xs">
          <li>• Watermarks are automatically positioned and locked</li>
          <li>• They help protect your content while staying subtle</li>
          <li>• You can customize text, position, and opacity</li>
          <li>• Watermarks are included in exports</li>
        </ul>
      </div>
    </div>
  );
}
