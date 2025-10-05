import { motion, PanInfo } from "framer-motion";

interface CropOverlayProps {
  cropArea: { x: number; y: number; width: number; height: number };
  canvasWidth: number;
  canvasHeight: number;
  isVisible: boolean;
  onCropChange?: (cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
}

export function CropOverlay({
  cropArea,
  canvasWidth,
  canvasHeight,
  isVisible,
  onCropChange,
}: CropOverlayProps) {
  if (!isVisible) return null;

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const newX = Math.max(
      0,
      Math.min(canvasWidth - cropArea.width, cropArea.x + info.offset.x)
    );
    const newY = Math.max(
      0,
      Math.min(canvasHeight - cropArea.height, cropArea.y + info.offset.y)
    );
    onCropChange?.({ ...cropArea, x: newX, y: newY });
  };

  const handleResize = (corner: "nw" | "ne" | "sw" | "se", info: PanInfo) => {
    let newWidth = cropArea.width;
    let newHeight = cropArea.height;
    let newX = cropArea.x;
    let newY = cropArea.y;

    const aspectRatio = 16 / 9;
    const minSize = 50;

    switch (corner) {
      case "nw":
        newWidth = Math.max(minSize, cropArea.width - info.offset.x);
        newHeight = newWidth / aspectRatio;
        newX = Math.max(
          0,
          Math.min(canvasWidth - newWidth, cropArea.x + info.offset.x)
        );
        newY = Math.max(
          0,
          Math.min(canvasHeight - newHeight, cropArea.y + info.offset.y)
        );
        break;
      case "ne":
        newWidth = Math.max(minSize, cropArea.width + info.offset.x);
        newHeight = newWidth / aspectRatio;
        newY = Math.max(
          0,
          Math.min(canvasHeight - newHeight, cropArea.y + info.offset.y)
        );
        break;
      case "sw":
        newWidth = Math.max(minSize, cropArea.width - info.offset.x);
        newHeight = newWidth / aspectRatio;
        newX = Math.max(
          0,
          Math.min(canvasWidth - newWidth, cropArea.x + info.offset.x)
        );
        break;
      case "se":
        newWidth = Math.max(minSize, cropArea.width + info.offset.x);
        newHeight = newWidth / aspectRatio;
        break;
    }

    onCropChange?.({ x: newX, y: newY, width: newWidth, height: newHeight });
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Dark overlay outside crop area */}
      <div className="absolute inset-0 bg-black bg-opacity-50">
        {/* Crop area cutout */}
        <motion.div
          className="absolute bg-transparent border-2 border-blue-500 cursor-move"
          style={{
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
          }}
          drag
          dragMomentum={false}
          onDrag={handleDrag}
          whileDrag={{ scale: 1.02 }}
        >
          {/* Crop area corners */}
          <div className="absolute inset-0 pointer-events-auto">
            {/* Corner resize handles */}
            <motion.div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => handleResize("nw", info)}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => handleResize("ne", info)}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => handleResize("sw", info)}
              whileDrag={{ scale: 1.2 }}
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize border border-white"
              drag
              dragMomentum={false}
              onDrag={(_, info) => handleResize("se", info)}
              whileDrag={{ scale: 1.2 }}
            />

            {/* Center drag handle */}
            <div className="absolute inset-0 pointer-events-auto cursor-move" />

            {/* Aspect ratio indicator */}
            <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
              16:9
            </div>

            {/* Size indicator */}
            <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
              {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
