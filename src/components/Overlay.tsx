import { useState } from "react";

interface OverlayProps {
  onOverlayComplete?: () => void;
}

interface OverlayItem {
  id: string;
  type: "logo" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export function Overlay({ onOverlayComplete }: OverlayProps) {
  // TODO: Call onOverlayComplete when overlay setup is finished
  console.log("Overlay component loaded", onOverlayComplete);
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);

  const addOverlay = (type: "logo" | "text") => {
    const newOverlay: OverlayItem = {
      id: `overlay-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === "logo" ? 100 : 200,
      height: type === "logo" ? 100 : 40,
      content: type === "text" ? "Your Text Here" : "LOGO",
    };
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlay(newOverlay.id);
  };

  const updateOverlay = (id: string, updates: Partial<OverlayItem>) => {
    setOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedOverlay) return;

    const step = event.shiftKey ? 10 : 1;
    const precision = event.altKey ? 0.1 : 1;

    switch (event.key) {
      case "ArrowLeft":
        updateOverlay(selectedOverlay, {
          x:
            overlays.find((o) => o.id === selectedOverlay)!.x -
            step * precision,
        });
        break;
      case "ArrowRight":
        updateOverlay(selectedOverlay, {
          x:
            overlays.find((o) => o.id === selectedOverlay)!.x +
            step * precision,
        });
        break;
      case "ArrowUp":
        updateOverlay(selectedOverlay, {
          y:
            overlays.find((o) => o.id === selectedOverlay)!.y -
            step * precision,
        });
        break;
      case "ArrowDown":
        updateOverlay(selectedOverlay, {
          y:
            overlays.find((o) => o.id === selectedOverlay)!.y +
            step * precision,
        });
        break;
      case "Delete":
        setOverlays((prev) => prev.filter((o) => o.id !== selectedOverlay));
        setSelectedOverlay(null);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Overlays</h2>

      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => addOverlay("logo")}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            onKeyDown={handleKeyDown}
          >
            Add Logo
          </button>
          <button
            onClick={() => addOverlay("text")}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            onKeyDown={handleKeyDown}
          >
            Add Text
          </button>
        </div>

        {overlays.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Active Overlays
            </h3>
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`p-2 border rounded cursor-pointer ${
                  selectedOverlay === overlay.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedOverlay(overlay.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {overlay.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {overlay.x}, {overlay.y}
                  </span>
                </div>
                {overlay.type === "text" && (
                  <input
                    type="text"
                    value={overlay.content}
                    onChange={(e) =>
                      updateOverlay(overlay.id, { content: e.target.value })
                    }
                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600">
        TODO: Logo upload, text styling, drag & drop positioning
      </div>
    </div>
  );
}
