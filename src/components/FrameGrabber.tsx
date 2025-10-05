import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { validateImageFile, createImageFromFile } from "@/lib/image";
import {
  validateVideoFile,
  createVideoFromFile,
  getOptimalThumbnailTimestamp,
  waitForVideoReady,
} from "@/lib/video";

interface FrameGrabberProps {
  onFrameCaptured?: (
    media: HTMLImageElement | HTMLVideoElement,
    type: "image" | "video"
  ) => void;
  onError?: (error: string) => void;
}

export function FrameGrabber({ onFrameCaptured, onError }: FrameGrabberProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (isVideo) {
        const validation = validateVideoFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const video = await createVideoFromFile(file);
        await waitForVideoReady(video);

        videoRef.current = video;
        setMediaType("video");
        setVideoDuration(video.duration);
        setCurrentTimestamp(getOptimalThumbnailTimestamp(video.duration));

        onFrameCaptured?.(video, "video");
      } else if (isImage) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        const image = await createImageFromFile(file);
        setMediaType("image");
        onFrameCaptured?.(image, "image");
      } else {
        throw new Error("Unsupported file type");
      }
    } catch (error) {
      console.error("File processing error:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to process file"
      );
      setUploadedFile(null);
      setMediaType(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      fileInputRef.current?.click();
    }
  };

  const handleVideoSeek = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTimestamp(timestamp);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              Supports MP4, WebM, JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {uploadedFile && mediaType && (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-gray-600">
            <strong>File:</strong> {uploadedFile.name}
          </div>

          {mediaType === "video" && videoDuration > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <strong>Duration:</strong> {formatTime(videoDuration)}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 block">
                  Frame Position: {formatTime(currentTimestamp)}
                </label>
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  step="0.1"
                  value={currentTimestamp}
                  onChange={(e) => handleVideoSeek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVideoSeek(0)}
                  className="text-xs"
                >
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVideoSeek(videoDuration / 4)}
                  className="text-xs"
                >
                  25%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVideoSeek(videoDuration / 2)}
                  className="text-xs"
                >
                  50%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVideoSeek((videoDuration * 3) / 4)}
                  className="text-xs"
                >
                  75%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVideoSeek(videoDuration)}
                  className="text-xs"
                >
                  End
                </Button>
              </div>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUploadedFile(null);
              setMediaType(null);
              setVideoDuration(0);
              setCurrentTimestamp(0);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="w-full"
          >
            Remove File
          </Button>
        </div>
      )}
    </div>
  );
}
