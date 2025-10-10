import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Type,
  Bold,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  X,
} from "lucide-react";
import { useCanvasStore, TextOverlay } from "@/state/canvasStore";
import { track } from "@vercel/analytics";

interface TextToolbarProps {
  overlayId: string;
  onClose: () => void;
}

export function TextToolbar({ overlayId, onClose }: TextToolbarProps) {
  const { overlays, updateOverlay, selectedId } = useCanvasStore();
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const textOverlay = overlays.find(
    (o) => o.id === overlayId && o.type === "text"
  ) as TextOverlay | undefined;

  useEffect(() => {
    setIsVisible(selectedId === overlayId && !!textOverlay);
  }, [selectedId, overlayId, textOverlay]);

  useEffect(() => {
    if (!isVisible || !toolbarRef.current) return;

    const updatePosition = () => {
      const canvas = document.querySelector(
        'canvas[data-testid="canvas-stage"] canvas'
      ) as HTMLCanvasElement;
      if (!canvas || !textOverlay || !toolbarRef.current) return;

      const canvasRect = canvas.getBoundingClientRect();
      const toolbar = toolbarRef.current;

      // Position toolbar above the text overlay
      const x = canvasRect.left + textOverlay.x + textOverlay.w / 2;
      const y = canvasRect.top + textOverlay.y - 60; // 60px above the text

      toolbar.style.position = "fixed";
      toolbar.style.left = `${Math.max(
        10,
        Math.min(
          window.innerWidth - toolbar.offsetWidth - 10,
          x - toolbar.offsetWidth / 2
        )
      )}px`;
      toolbar.style.top = `${Math.max(10, y)}px`;
      toolbar.style.zIndex = "1000";
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isVisible, textOverlay]);

  if (!isVisible || !textOverlay) return null;

  const handleUpdate = (updates: Partial<TextOverlay>) => {
    updateOverlay(overlayId, updates);

    // Track telemetry
    if (updates.text !== undefined) {
      track("text_overlay_edit", { overlayId, property: "text" });
    }
    if (updates.size !== undefined) {
      track("text_overlay_edit", { overlayId, property: "size" });
    }
    if (updates.weight !== undefined) {
      track("text_overlay_edit", { overlayId, property: "weight" });
    }
    if (updates.color !== undefined) {
      track("text_overlay_edit", { overlayId, property: "color" });
    }
    if (updates.align !== undefined) {
      track("text_overlay_edit", { overlayId, property: "align" });
    }
    if (updates.shadow !== undefined) {
      track("text_overlay_edit", { overlayId, property: "shadow" });
    }
    if (updates.font !== undefined) {
      track("text_overlay_edit", { overlayId, property: "font" });
    }
  };

  const fontWeights = [
    { label: "Light", value: 300 },
    { label: "Regular", value: 400 },
    { label: "Medium", value: 500 },
    { label: "Semibold", value: 600 },
    { label: "Bold", value: 700 },
    { label: "Extra Bold", value: 800 },
  ];

  const alignments = [
    { label: "Left", value: "left", icon: AlignLeft },
    { label: "Center", value: "center", icon: AlignCenter },
    { label: "Right", value: "right", icon: AlignRight },
  ];

  return (
    <div
      ref={toolbarRef}
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-3 min-w-max"
      style={{ position: "fixed" }}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        aria-label="Close text toolbar"
      >
        <X className="h-[18px] w-[18px]" />
      </Button>

      {/* Font Family */}
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1">
          {["Arial", "Helvetica", "Georgia", "Verdana"].map((font) => (
            <Button
              key={font}
              variant={textOverlay.font === font ? "default" : "outline"}
              size="sm"
              onClick={() => handleUpdate({ font })}
              className="text-xs h-8 px-2"
            >
              {font}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-gray-500 whitespace-nowrap">Size</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[textOverlay.size]}
            onValueChange={(values) => handleUpdate({ size: values[0] })}
            min={8}
            max={120}
            step={1}
            className="w-20"
          />
          <Input
            type="number"
            value={textOverlay.size}
            onChange={(e) => handleUpdate({ size: Number(e.target.value) })}
            className="h-8 w-16 text-xs"
            min={8}
            max={120}
          />
        </div>
      </div>

      {/* Font Weight */}
      <div className="flex items-center gap-2">
        <Bold className="h-4 w-4 text-gray-500" />
        <div className="flex gap-1">
          {fontWeights.map((weight) => (
            <Button
              key={weight.value}
              variant={
                textOverlay.weight === weight.value ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleUpdate({ weight: weight.value })}
              className="text-xs h-8 px-2"
            >
              {weight.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center gap-2">
        {alignments.map((alignment) => {
          const Icon = alignment.icon;
          return (
            <Button
              key={alignment.value}
              variant={
                textOverlay.align === alignment.value ? "default" : "ghost"
              }
              size="sm"
              onClick={() =>
                handleUpdate({
                  align: alignment.value as "left" | "center" | "right",
                })
              }
              className="h-8 w-8 p-0"
              aria-label={`Align text ${alignment.label.toLowerCase()}`}
              aria-pressed={textOverlay.align === alignment.value}
            >
              <Icon className="h-[18px] w-[18px]" />
            </Button>
          );
        })}
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-gray-500" />
        <Input
          type="color"
          value={textOverlay.color}
          onChange={(e) => handleUpdate({ color: e.target.value })}
          className="h-8 w-12 p-1 border-gray-300"
          aria-label="Select text color"
        />
      </div>

      {/* Text Shadow */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 text-gray-500 flex items-center justify-center">
          <div className="w-[18px] h-[18px] rounded-full bg-gray-400 shadow-sm" />
        </div>
        <Checkbox
          checked={textOverlay.shadow}
          onCheckedChange={(checked) =>
            handleUpdate({ shadow: checked as boolean })
          }
          aria-label="Toggle text shadow"
        />
      </div>
    </div>
  );
}
