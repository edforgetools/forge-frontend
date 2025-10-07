import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image,
  Type,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Move,
} from "lucide-react";
import {
  useCanvasStore,
  canvasActions,
  LogoOverlay,
  TextOverlay,
} from "@/state/canvasStore";

export function OverlaysPanel() {
  const { overlays, selectedId } = useCanvasStore();

  const selectedOverlay = overlays.find((o) => o.id === selectedId);

  const handleAddLogo = () => {
    // Create a file input for logo upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const logoOverlay: Omit<LogoOverlay, "id" | "z"> = {
            type: "logo",
            src: e.target?.result as string,
            x: 100,
            y: 100,
            w: 200,
            h: 100,
            rot: 0,
            locked: false,
            hidden: false,
            opacity: 1,
            blend: "source-over" as GlobalCompositeOperation,
          };
          canvasActions.addOverlay(logoOverlay);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddText = () => {
    const textOverlay: Omit<TextOverlay, "id" | "z"> = {
      type: "text",
      text: "Your text here",
      font: "Arial",
      size: 24,
      weight: 400,
      letter: 0,
      shadow: false,
      align: "left",
      color: "#000000",
      x: 100,
      y: 100,
      w: 200,
      h: 50,
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 1,
    };
    canvasActions.addOverlay(textOverlay);
  };

  const handleOverlaySelect = (id: string) => {
    canvasActions.select(id);
  };

  const handleOverlayUpdate = (
    id: string,
    updates: Partial<LogoOverlay | TextOverlay>
  ) => {
    canvasActions.updateOverlay(id, updates);
  };

  const handleOverlayDelete = (id: string) => {
    canvasActions.remove(id);
  };

  const handleToggleVisibility = (id: string) => {
    const overlay = overlays.find((o) => o.id === id);
    if (overlay) {
      canvasActions.updateOverlay(id, { hidden: !overlay.hidden });
    }
  };

  const handleToggleLock = (id: string) => {
    const overlay = overlays.find((o) => o.id === id);
    if (overlay) {
      canvasActions.updateOverlay(id, { locked: !overlay.locked });
    }
  };

  const handleZOrderChange = (id: string, direction: "up" | "down") => {
    if (direction === "up") {
      canvasActions.bringToFront(id);
    } else {
      canvasActions.sendToBack(id);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Add overlay buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddLogo}
            className="justify-start"
            aria-label="Add logo overlay to canvas"
          >
            <Image className="w-4 h-4 mr-2" />
            Add Logo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddText}
            className="justify-start"
            aria-label="Add text overlay to canvas"
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        </div>

        {/* Overlay list */}
        {overlays.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Overlays</Label>
            <div className="space-y-1">
              {overlays
                .sort((a, b) => b.z - a.z)
                .map((overlay) => (
                  <div
                    key={overlay.id}
                    className={`
                    flex items-center justify-between p-2 rounded border cursor-pointer
                    ${
                      selectedId === overlay.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }
                  `}
                    onClick={() => handleOverlaySelect(overlay.id)}
                    data-testid="overlay-item"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {overlay.type === "logo" ? (
                        <Image className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      ) : (
                        <Type className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">
                        {overlay.type === "text"
                          ? (overlay as TextOverlay).text
                          : "Logo"}
                      </span>
                      {overlay.locked && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                      {overlay.hidden && (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(overlay.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        data-testid="toggle-visibility"
                        aria-label={`${overlay.hidden ? 'Show' : 'Hide'} ${overlay.type === 'text' ? 'text' : 'logo'} overlay`}
                      >
                        {overlay.hidden ? (
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        ) : (
                          <Eye className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleLock(overlay.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        data-testid="toggle-lock"
                        aria-label={`${overlay.locked ? 'Unlock' : 'Lock'} ${overlay.type === 'text' ? 'text' : 'logo'} overlay`}
                      >
                        {overlay.locked ? (
                          <Lock className="w-3 h-3 text-gray-500" />
                        ) : (
                          <Unlock className="w-3 h-3 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOverlayDelete(overlay.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        data-testid="delete-overlay"
                        aria-label={`Delete ${overlay.type === 'text' ? 'text' : 'logo'} overlay`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Selected overlay controls */}
        {selectedOverlay && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {selectedOverlay.type === "logo" ? "Logo" : "Text"} Settings
              </Label>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleZOrderChange(selectedOverlay.id, "down")}
                  className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title="Send to back"
                  aria-label="Send overlay to back"
                >
                  <Move className="w-3 h-3 text-gray-500 rotate-180" />
                </button>
                <button
                  onClick={() => handleZOrderChange(selectedOverlay.id, "up")}
                  className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title="Bring to front"
                  aria-label="Bring overlay to front"
                >
                  <Move className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <Label className="text-sm">Opacity</Label>
              <div className="space-y-2">
                <Slider
                  value={[selectedOverlay.opacity]}
                  onValueChange={(values) =>
                    handleOverlayUpdate(selectedOverlay.id, {
                      opacity: values[0],
                    })
                  }
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(selectedOverlay.opacity * 100)}%
                </div>
              </div>
            </div>

            {/* Text-specific controls */}
            {selectedOverlay.type === "text" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Text</Label>
                  <Input
                    value={(selectedOverlay as TextOverlay).text}
                    onChange={(e) =>
                      handleOverlayUpdate(selectedOverlay.id, {
                        text: e.target.value,
                      })
                    }
                    className="h-8"
                    placeholder="Enter text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Font Size</Label>
                    <Input
                      type="number"
                      value={(selectedOverlay as TextOverlay).size}
                      onChange={(e) =>
                        handleOverlayUpdate(selectedOverlay.id, {
                          size: Number(e.target.value),
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Color</Label>
                    <Input
                      type="color"
                      value={(selectedOverlay as TextOverlay).color}
                      onChange={(e) =>
                        handleOverlayUpdate(selectedOverlay.id, {
                          color: e.target.value,
                        })
                      }
                      className="h-8 p-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Font Family</Label>
                  <Select
                    value={(selectedOverlay as TextOverlay).font}
                    onValueChange={(value: string) =>
                      handleOverlayUpdate(selectedOverlay.id, { font: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">
                        Times New Roman
                      </SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="text-shadow"
                    checked={(selectedOverlay as TextOverlay).shadow}
                    onCheckedChange={(checked) =>
                      handleOverlayUpdate(selectedOverlay.id, {
                        shadow: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="text-shadow" className="text-sm">
                    Text shadow
                  </Label>
                </div>
              </div>
            )}

            {/* Logo-specific controls */}
            {selectedOverlay.type === "logo" && (
              <div className="space-y-2">
                <Label className="text-sm">Blend Mode</Label>
                <Select
                  value={
                    (selectedOverlay as LogoOverlay).blend || "source-over"
                  }
                  onValueChange={(value: string) =>
                    handleOverlayUpdate(selectedOverlay.id, {
                      blend: value as GlobalCompositeOperation,
                    })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="source-over">Normal</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                    <SelectItem value="overlay">Overlay</SelectItem>
                    <SelectItem value="soft-light">Soft Light</SelectItem>
                    <SelectItem value="hard-light">Hard Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
