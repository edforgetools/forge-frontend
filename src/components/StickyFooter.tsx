import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { LazyExportDialog } from "./LazyExportDialog";

interface StickyFooterProps {
  isDragging?: boolean;
}

export function StickyFooter({ isDragging = false }: StickyFooterProps) {
  const { image, videoSrc, crop, overlays } = useCanvasStore();

  const hasContent = image || videoSrc;
  const aspectRatio = crop.w / crop.h;
  const is16to9 = Math.abs(aspectRatio - 16 / 9) < 0.01;
  const hasOverlays = overlays.length > 0;
  const isReadyForExport = hasContent && is16to9;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-4">
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
            {hasOverlays &&
              ` • ${overlays.length} overlay${overlays.length > 1 ? "s" : ""}`}
          </div>
        )}
      </div>

      <div className="mt-3">
        <LazyExportDialog isDragging={isDragging}>
          <Button
            disabled={!isReadyForExport || isDragging}
            className="w-full h-10 rounded-xl"
            aria-label={
              isDragging
                ? "Export disabled - finish dragging layers first"
                : !hasContent
                  ? "Export disabled - upload content first"
                  : !is16to9
                    ? "Export disabled - crop must be 16:9 aspect ratio"
                    : "Export thumbnail - Open export settings"
            }
            tabIndex={14}
          >
            <Download className="w-[18px] h-[18px] mr-2" />
            {isDragging
              ? "Dragging..."
              : isReadyForExport
                ? "Export"
                : "Not Ready"}
          </Button>
        </LazyExportDialog>
      </div>

      {!isReadyForExport && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {!hasContent
            ? "Upload content to enable export"
            : !is16to9
              ? "Crop must be 16:9 aspect ratio for Snapthumb"
              : "Ready to export"}
        </div>
      )}
    </div>
  );
}
