import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { ExportDialog } from "./ExportDialog";

interface StickyFooterProps {
  isDragging?: boolean;
}

export function StickyFooter({ isDragging = false }: StickyFooterProps) {
  const { image, videoSrc, crop } = useCanvasStore();

  const hasContent = image || videoSrc;
  const aspectRatio = crop.w / crop.h;
  const is16to9 = Math.abs(aspectRatio - 16 / 9) < 0.01;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">16:9</span>
          {!is16to9 && <span className="text-amber-600 ml-1">⚠️</span>}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">
            {Math.round(crop.w)} × {Math.round(crop.h)}
          </span>
        </div>
        {hasContent && (
          <div className="text-xs text-gray-500">
            {image ? "Image" : "Video"} loaded
          </div>
        )}
      </div>

      <div className="mt-3">
        <ExportDialog isDragging={isDragging}>
          <Button
            disabled={!hasContent || isDragging}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl"
            aria-label={
              isDragging
                ? "Export disabled - finish dragging layers first"
                : hasContent
                ? "Export thumbnail - Open export settings"
                : "Export disabled - upload content first"
            }
            tabIndex={14}
          >
            <Download className="w-[18px] h-[18px] mr-2" />
            {isDragging ? "Dragging..." : "Export"}
          </Button>
        </ExportDialog>
      </div>

      {!hasContent && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Upload content to enable export
        </div>
      )}
    </div>
  );
}
