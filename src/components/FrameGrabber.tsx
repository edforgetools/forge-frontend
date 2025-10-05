import { useRef, useState } from "react";

interface FrameGrabberProps {
  onFrameCaptured?: () => void;
}

export function FrameGrabber({ onFrameCaptured }: FrameGrabberProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const videoRef = useRef<HTMLVideoElement>(null); // TODO: Use for video processing
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: Validate file size (graceful failure on large inputs)
    // TODO: Support both video and image files
    // TODO: Extract frame from video or use image directly
    console.log("File selected:", file.name);
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      onFrameCaptured?.();
    }, 1000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: Keyboard shortcuts for file operations
    if (event.key === "Enter" || event.key === " ") {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Upload Media</h2>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload video or image file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="text-blue-600">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Processing...
          </div>
        ) : (
          <div>
            <div className="text-4xl text-gray-400 mb-2">📁</div>
            <p className="text-gray-600">Click to upload video or image</p>
            <p className="text-sm text-gray-500 mt-1">
              Supports MP4, WebM, JPG, PNG
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        TODO: Frame extraction, video scrubbing, image preview
      </div>
    </div>
  );
}
