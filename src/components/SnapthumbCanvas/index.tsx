import { SnapthumbCanvas } from "./SnapthumbCanvas";
import { Controls } from "./Controls";
import { useSnapthumbURLSync } from "@/lib/snapthumb-state";

interface SnapthumbEditorProps {
  backgroundImage?: string;
  overlayImage?: string;
  className?: string;
  onGenerate?: (canvas: HTMLCanvasElement) => void;
}

export function SnapthumbEditor({
  backgroundImage,
  overlayImage,
  className = "",
  onGenerate,
}: SnapthumbEditorProps) {
  // Initialize URL sync
  useSnapthumbURLSync();

  const handleGenerate = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (canvas && onGenerate) {
      onGenerate(canvas);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Canvas Area */}
      <div className="flex-1">
        <SnapthumbCanvas
          backgroundImage={backgroundImage}
          overlayImage={overlayImage}
          className="w-full"
        />

        {/* Generate Button */}
        {onGenerate && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Generate Thumbnail
            </button>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-80">
        <Controls />
      </div>
    </div>
  );
}

// Export individual components
export { SnapthumbCanvas, Controls };
export type { SnapthumbConfig, CalculatedPosition } from "./types";
