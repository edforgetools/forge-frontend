import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/state/canvasStore";

interface OverlayProps {
  onOverlayComplete?: () => void;
}

export function Overlay({ onOverlayComplete }: OverlayProps) {
  const [textInput, setTextInput] = useState("");
  const { addOverlay, overlays, updateOverlay, remove, selectedId, select } =
    useCanvasStore();

  const addTextOverlay = () => {
    const content = textInput.trim() || "Your Text Here";
    addOverlay({
      type: "text",
      x: 50,
      y: 50,
      w: 200,
      h: 40,
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 1,
      text: content,
      font: "Arial",
      size: 24,
      weight: 400,
      letter: 0,
      shadow: false,
      align: "left",
      color: "#000000",
    } as Omit<import("@/state/canvasStore").TextOverlay, "id" | "z">);
    setTextInput("");
    onOverlayComplete?.();
  };

  const addLogoOverlay = () => {
    addOverlay({
      type: "logo",
      x: 50,
      y: 50,
      w: 100,
      h: 100,
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 1,
      src: "",
    } as Omit<import("@/state/canvasStore").LogoOverlay, "id" | "z">);
    onOverlayComplete?.();
  };

  const updateOverlayContent = (id: string, content: string) => {
    updateOverlay(id, { text: content });
  };

  const toggleOverlayVisibility = (id: string) => {
    const overlay = overlays.find((o) => o.id === id);
    if (overlay) {
      updateOverlay(id, { hidden: !overlay.hidden });
    }
  };

  // Keyboard shortcuts are handled in CanvasStage component

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Overlays</h2>

      <div className="space-y-4">
        {/* Add Overlay Controls */}
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Button
              onClick={addLogoOverlay}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              Add Logo
            </Button>
            <Button
              onClick={addTextOverlay}
              size="sm"
              variant="outline"
              className="flex-1"
              disabled={!textInput.trim()}
            >
              Add Text
            </Button>
          </div>

          <div>
            <Label
              htmlFor="text-input"
              className="text-xs text-gray-500 mb-1 block"
            >
              Text Content
            </Label>
            <Input
              id="text-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text for overlay..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTextOverlay();
                }
              }}
            />
          </div>
        </div>

        {/* Active Overlays List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Active Overlays ({overlays.length})
          </h3>

          <AnimatePresence>
            {overlays.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {overlays.map((overlay) => (
                    <motion.div
                      key={overlay.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedId === overlay.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => select(overlay.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium capitalize">
                            {overlay.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOverlayVisibility(overlay.id);
                            }}
                            className={`w-2 h-2 rounded-full ${
                              !overlay.hidden ? "bg-green-500" : "bg-gray-400"
                            }`}
                            aria-label={`${
                              !overlay.hidden ? "Hide" : "Show"
                            } overlay`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOverlay(overlay.id, {
                                locked: !overlay.locked,
                              });
                            }}
                            className={`ml-1 text-xs ${
                              overlay.locked ? "text-blue-600" : "text-gray-400"
                            }`}
                            aria-label={`${
                              overlay.locked ? "Unlock" : "Lock"
                            } overlay`}
                          >
                            {overlay.locked ? "🔒" : "🔓"}
                          </button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {Math.round(overlay.x)}, {Math.round(overlay.y)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(overlay.id);
                            }}
                            className="text-xs text-red-500 hover:text-red-700 ml-2"
                            aria-label="Remove overlay"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {overlay.type === "text" && (
                        <Input
                          type="text"
                          value={overlay.text}
                          onChange={(e) =>
                            updateOverlayContent(overlay.id, e.target.value)
                          }
                          className="text-xs"
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter text..."
                        />
                      )}

                      {overlay.type === "logo" && (
                        <div className="text-xs text-gray-500 italic">
                          Logo placeholder - upload functionality coming soon
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Actions */}
        {overlays.length > 0 && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => overlays.forEach((overlay) => remove(overlay.id))}
              className="flex-1 text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
