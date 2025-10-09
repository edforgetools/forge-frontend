import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

interface TextOverlayProps {
  className?: string;
}

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Arial Black",
  "Courier New",
  "Lucida Console",
];

const FONT_WEIGHTS = [
  { value: 300, label: "Light" },
  { value: 400, label: "Normal" },
  { value: 600, label: "Semi Bold" },
  { value: 700, label: "Bold" },
  { value: 900, label: "Black" },
];

const TEXT_ALIGNS = [
  { value: "left", label: "Left", icon: AlignLeft },
  { value: "center", label: "Center", icon: AlignCenter },
  { value: "right", label: "Right", icon: AlignRight },
];

const COLOR_PRESETS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
  "#A52A2A", // Brown
];

export function TextOverlay({ className }: TextOverlayProps) {
  const { addOverlay, overlays, selectedId, updateOverlay } = useCanvasStore();
  const { toast } = useToast();

  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState(700);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "center"
  );
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [hasShadow, setHasShadow] = useState(true);

  const selectedOverlay = overlays.find(
    (o) => o.id === selectedId && o.type === "text"
  );

  const handleAddText = useCallback(() => {
    if (!newText.trim()) {
      toast({
        title: "No text entered",
        description: "Please enter some text to add.",
        variant: "destructive",
      });
      return;
    }

    addOverlay({
      type: "text",
      text: newText.trim(),
      x: 100,
      y: 100,
      w: newText.length * 20, // Estimate width
      h: fontSize + 10, // Estimate height
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 1,
      font: fontFamily,
      size: fontSize,
      weight: fontWeight,
      letter: letterSpacing,
      shadow: hasShadow,
      align: textAlign,
      color: textColor,
    });

    toast({
      title: "Text added",
      description: "Text overlay has been added to the canvas.",
    });

    // Reset form
    setNewText("");
  }, [
    newText,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    hasShadow,
    textAlign,
    textColor,
    addOverlay,
    toast,
  ]);

  const handleUpdateText = useCallback(
    (field: string, value: any) => {
      if (selectedOverlay) {
        updateOverlay(selectedId!, { [field]: value });
      }
    },
    [selectedOverlay, selectedId, updateOverlay]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add New Text */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          <h3 className="text-sm font-medium">Add Text</h3>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-sm">
            Text Content
          </Label>
          <Input
            id="text-input"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter your text..."
            className="w-full"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">
            {newText.length}/100 characters
          </p>
        </div>

        {/* Font Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Font Family</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font} className="text-sm">
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Font Weight</Label>
            <Select
              value={fontWeight.toString()}
              onValueChange={(v) => setFontWeight(Number(v))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map((weight) => (
                  <SelectItem
                    key={weight.value}
                    value={weight.value.toString()}
                  >
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Size and Spacing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Font Size</Label>
              <span className="text-xs text-gray-500">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => setFontSize(v[0] ?? 16)}
              min={12}
              max={72}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Letter Spacing</Label>
              <span className="text-xs text-gray-500">{letterSpacing}px</span>
            </div>
            <Slider
              value={[letterSpacing]}
              onValueChange={(v) => setLetterSpacing(v[0] ?? 0)}
              min={-2}
              max={10}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <Label className="text-xs">Text Alignment</Label>
          <div className="flex gap-2">
            {TEXT_ALIGNS.map((align) => {
              const Icon = align.icon;
              return (
                <Button
                  key={align.value}
                  variant={textAlign === align.value ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setTextAlign(align.value as "left" | "center" | "right")
                  }
                  className="flex-1"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {align.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <Label className="text-xs">Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <Input
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 h-8 text-sm font-mono"
              placeholder="#FFFFFF"
            />
          </div>

          {/* Color Presets */}
          <div className="flex flex-wrap gap-1">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => setTextColor(color)}
                className={`w-6 h-6 rounded border-2 ${
                  textColor === color ? "border-gray-900" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Shadow Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="text-shadow"
            checked={hasShadow}
            onChange={(e) => setHasShadow(e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="text-shadow" className="text-xs">
            Add text shadow for better visibility
          </Label>
        </div>

        {/* Add Button */}
        <Button
          onClick={handleAddText}
          disabled={!newText.trim()}
          className="w-full"
          size="sm"
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text Overlay
        </Button>
      </div>

      {/* Text Controls - Only show if text is selected */}
      {selectedOverlay && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Edit Text</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedId) {
                  // Remove overlay logic would go here
                  toast({
                    title: "Text removed",
                    description: "Text overlay has been removed.",
                  });
                }
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Edit Text Content */}
          <div className="space-y-2">
            <Label className="text-xs">Text Content</Label>
            <Input
              value={selectedOverlay.text}
              onChange={(e) => handleUpdateText("text", e.target.value)}
              className="w-full h-8 text-sm"
              maxLength={100}
            />
          </div>

          {/* Position Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">X Position</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.x)}
                onChange={(e) => handleUpdateText("x", Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Y Position</Label>
              <Input
                type="number"
                value={Math.round(selectedOverlay.y)}
                onChange={(e) => handleUpdateText("y", Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Style Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Font Size</Label>
                <span className="text-xs text-gray-500">
                  {selectedOverlay.size}px
                </span>
              </div>
              <Slider
                value={[selectedOverlay.size]}
                onValueChange={(v) => handleUpdateText("size", v[0])}
                min={12}
                max={72}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-gray-500">
                  {Math.round(selectedOverlay.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[selectedOverlay.opacity]}
                onValueChange={(v) => handleUpdateText("opacity", v[0])}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>

          {/* Color Control */}
          <div className="space-y-2">
            <Label className="text-xs">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedOverlay.color}
                onChange={(e) => handleUpdateText("color", e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={selectedOverlay.color}
                onChange={(e) => handleUpdateText("color", e.target.value)}
                className="flex-1 h-8 text-sm font-mono"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleUpdateText("locked", !selectedOverlay.locked)
              }
              className="flex-1"
            >
              {selectedOverlay.locked ? "Unlock" : "Lock"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleUpdateText("hidden", !selectedOverlay.hidden)
              }
              className="flex-1"
            >
              {selectedOverlay.hidden ? "Show" : "Hide"}
            </Button>
          </div>
        </div>
      )}

      {/* Text List */}
      {overlays.filter((o) => o.type === "text").length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Active Text</Label>
          <div className="space-y-1">
            {overlays
              .filter((o) => o.type === "text")
              .map((text) => (
                <div
                  key={text.id}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                    selectedId === text.id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  onClick={() => useCanvasStore.getState().select(text.id)}
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-600" />
                    <span className="text-sm truncate max-w-[200px]">
                      {text.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: text.color,
                        color: text.color === "#FFFFFF" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      {text.size}px
                    </span>
                    {text.locked && (
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full"
                        title="Locked"
                      />
                    )}
                    {text.hidden && (
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
