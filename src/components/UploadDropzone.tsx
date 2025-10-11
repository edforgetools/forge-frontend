import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Zap } from "lucide-react";
import { canvasActions, useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";
import { validateImageFile } from "@/lib/image";
import { validateVideoFile } from "@/lib/video";
import { VideoFrameScrubber } from "./VideoFrameScrubber";

export function UploadDropzone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [sampleAvailable, setSampleAvailable] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const { toast } = useToast();
  const { videoSrc } = useCanvasStore();

  // Check if sample asset is available
  useEffect(() => {
    const SAMPLE_URL = "/samples/sample.jpg";
    fetch(SAMPLE_URL, { method: "HEAD" })
      .then((r) => setSampleAvailable(r.ok))
      .catch(() => setSampleAvailable(false));
  }, []);

  // Unified file input handler used by both file picker and sample
  const handleFileInput = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        if (file.type.startsWith("image/")) {
          // Validate image file
          const validation = validateImageFile(file);
          if (!validation.valid) {
            toast({
              title: "Invalid image file",
              description: validation.error,
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              canvasActions.setImage(img);
              toast({
                title: "Image loaded",
                description: "Your image has been loaded successfully.",
              });
              setIsUploading(false);
            };
            img.onerror = () => {
              toast({
                title: "Failed to load image",
                description: "The image file appears to be corrupted.",
                variant: "destructive",
              });
              setIsUploading(false);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith("video/")) {
          // Validate video file
          const validation = validateVideoFile(file);
          if (!validation.valid) {
            toast({
              title: "Invalid video file",
              description: validation.error,
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const videoUrl = e.target?.result as string;
            canvasActions.setVideo(videoUrl);
            toast({
              title: "Video loaded",
              description:
                "Your video has been loaded successfully. Use the scrubber below to extract frames.",
            });
            setIsUploading(false);
          };
          reader.onerror = () => {
            toast({
              title: "Failed to load video",
              description: "The video file appears to be corrupted.",
              variant: "destructive",
            });
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload an image or video file.",
            variant: "destructive",
          });
          setIsUploading(false);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: "An error occurred while processing the file.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    },
    [toast]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      await handleFileInput(file);
    },
    [handleFileInput]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "video/*": [".mp4", ".webm"],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const onSampleClick = useCallback(async () => {
    if (!sampleAvailable || sampleLoading) return;

    const SAMPLE_URL = "/samples/sample.jpg";

    try {
      setSampleLoading(true);
      const res = await fetch(SAMPLE_URL);
      if (!res.ok) throw new Error("sample fetch failed");
      const blob = await res.blob();
      const file = new File([blob], "sample.jpg", {
        type: blob.type || "image/jpeg",
      });
      await handleFileInput(file);
    } catch {
      // optional: toast('Sample unavailable');
      setSampleAvailable(false);
    } finally {
      setSampleLoading(false);
    }
  }, [sampleAvailable, sampleLoading, handleFileInput]);

  const isActive = isDragActive || dropzoneActive;

  return (
    <div className="space-y-4">
      <Card className="max-h-[48dvh] overflow-auto">
        <CardContent className="p-6 space-y-4">
          {/* Primary Dropzone - Clickable */}
          <div
            {...getRootProps()}
            className={`
              relative border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${
                isActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
            role="button"
            tabIndex={0}
            aria-label={
              isActive
                ? "Drop files here to upload"
                : "Drag and drop files here or click to choose"
            }
            onClick={() => {
              if (!isUploading) {
                const input = document.querySelector(
                  'input[data-testid="upload-dropzone-input"]'
                ) as HTMLInputElement;
                input?.click();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isUploading) {
                  const input = document.querySelector(
                    'input[data-testid="upload-dropzone-input"]'
                  ) as HTMLInputElement;
                  input?.click();
                }
              }
            }}
          >
            <input
              {...getInputProps()}
              data-testid="upload-dropzone-input"
              aria-label="File upload input"
            />
            <div className="flex flex-col items-center space-y-3">
              <Upload
                className={`w-8 h-8 ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isActive
                    ? "Drop to upload"
                    : "Drag & drop or click to choose"}
                </p>
                <p className="text-xs text-gray-500">
                  Images & videos supported
                </p>
              </div>
            </div>
          </div>

          {/* Icon List for Supported Formats */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              Supported formats:
            </div>
            <div className="text-xs text-gray-600">
              PNG, JPG, WebP • MP4, WebM
            </div>
          </div>

          {/* Sample Button */}
          {sampleAvailable && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSampleClick}
              className="w-full"
              disabled={isUploading || sampleLoading}
              data-testid="btn-sample"
            >
              <Zap className="w-4 h-4 mr-2" />
              {sampleLoading ? "Loading..." : "Try sample image"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Video Frame Scrubber - Show when video is loaded */}
      {videoSrc && (
        <Card>
          <CardContent className="p-6">
            <VideoFrameScrubber />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
