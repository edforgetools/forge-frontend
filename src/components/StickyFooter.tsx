import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { ExportDialog } from "./ExportDialog";

export function StickyFooter() {
  const { image, videoSrc, crop } = useCanvasStore();

  const hasContent = image || videoSrc;
  const aspectRatio = crop.w / crop.h;
  const is16to9 = Math.abs(aspectRatio - 16 / 9) < 0.01;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between">
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

        <div className="flex items-center space-x-2">
          <ExportDialog>
            <Button
              disabled={!hasContent}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </ExportDialog>
        </div>
      </div>

      {!hasContent && (
        <div className="mt-2 text-xs text-gray-500">
          Upload content to enable export
        </div>
      )}
    </div>
  );
}
