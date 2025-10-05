import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOverlay } from "@/hooks/useOverlay";
import { motion, AnimatePresence } from "framer-motion";

interface OverlayProps {
  onOverlayComplete?: () => void;
}

export function Overlay({ onOverlayComplete }: OverlayProps) {
  const [overlayState, overlayActions] = useOverlay();
  const [textInput, setTextInput] = useState("");

  const addTextOverlay = () => {
    const content = textInput.trim() || "Your Text Here";
    overlayActions.addOverlay("text", content);
    setTextInput("");
    onOverlayComplete?.();
  };

  const addLogoOverlay = () => {
    overlayActions.addOverlay("logo");
    onOverlayComplete?.();
  };

  const updateOverlayContent = (id: string, content: string) => {
    overlayActions.updateOverlay(id, { content });
  };

  const toggleOverlayVisibility = (id: string) => {
    overlayActions.toggleVisibility(id);
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
        <AnimatePresence>
          {overlayState.items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h3 className="text-sm font-medium text-gray-700">
                Active Overlays ({overlayState.items.length})
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {overlayState.items.map((overlay) => (
                  <motion.div
                    key={overlay.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      overlayState.selectedId === overlay.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => overlayActions.selectOverlay(overlay.id)}
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
                            overlay.visible ? "bg-green-500" : "bg-gray-400"
                          }`}
                          aria-label={`${
                            overlay.visible ? "Hide" : "Show"
                          } overlay`}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {Math.round(overlay.x)}, {Math.round(overlay.y)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            overlayActions.removeOverlay(overlay.id);
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
                        value={overlay.content}
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

        {/* Quick Actions */}
        {overlayState.items.length > 0 && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={overlayActions.undo}
              disabled={overlayState.historyIndex === 0}
              className="flex-1 text-xs"
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={overlayActions.redo}
              disabled={
                overlayState.historyIndex === overlayState.history.length - 1
              }
              className="flex-1 text-xs"
            >
              Redo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={overlayActions.clearAll}
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
