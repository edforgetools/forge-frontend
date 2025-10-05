import { useState } from "react";

interface CropperProps {
  onCropComplete?: () => void;
}

export function Cropper({ onCropComplete }: CropperProps) {
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 800,
    height: 450,
  });
  const [isActive, setIsActive] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: Keyboard controls for crop area
    // - Arrow keys: move crop area
    // - Shift + Arrow: resize crop area
    // - Enter: confirm crop
    // - Escape: cancel crop
    const step = event.shiftKey ? 10 : 1;
    const precision = event.altKey ? 0.1 : 1;

    switch (event.key) {
      case "ArrowLeft":
        setCropArea((prev) => ({ ...prev, x: prev.x - step * precision }));
        break;
      case "ArrowRight":
        setCropArea((prev) => ({ ...prev, x: prev.x + step * precision }));
        break;
      case "ArrowUp":
        setCropArea((prev) => ({ ...prev, y: prev.y - step * precision }));
        break;
      case "ArrowDown":
        setCropArea((prev) => ({ ...prev, y: prev.y + step * precision }));
        break;
      case "Enter":
        onCropComplete?.();
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">16:9 Crop</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Crop Area</label>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-3 py-1 text-sm rounded ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              X Position
            </label>
            <input
              type="number"
              value={cropArea.x}
              onChange={(e) =>
                setCropArea((prev) => ({ ...prev, x: Number(e.target.value) }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Y Position
            </label>
            <input
              type="number"
              value={cropArea.y}
              onChange={(e) =>
                setCropArea((prev) => ({ ...prev, y: Number(e.target.value) }))
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Size: {cropArea.width} × {cropArea.height} (16:9)
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        TODO: Visual crop overlay, aspect ratio lock, drag handles
      </div>
    </div>
  );
}
