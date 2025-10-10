import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Video, Zap } from "lucide-react";
import { canvasActions, useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";
import { validateImageFile } from "@/lib/image";
import { validateVideoFile } from "@/lib/video";
import { VideoFrameScrubber } from "./VideoFrameScrubber";

export function UploadDropzone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { videoSrc } = useCanvasStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

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

  const handleSampleImage = useCallback(() => {
    // Create a sample image for testing
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#3b82f6");
      gradient.addColorStop(1, "#1e40af");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some text
      ctx.fillStyle = "white";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Sample Image", canvas.width / 2, canvas.height / 2);
      ctx.font = "24px Arial";
      ctx.fillText(
        "1920x1080 - Perfect for thumbnails",
        canvas.width / 2,
        canvas.height / 2 + 60
      );
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const img = new Image();
        img.onload = () => {
          canvasActions.setImage(img);
          toast({
            title: "Sample image loaded",
            description: "A sample image has been loaded for testing.",
          });
        };
        img.src = URL.createObjectURL(blob);
      }
    }, "image/png");
  }, [toast]);

  const isActive = isDragActive || dropzoneActive;

  return (
    <div className="space-y-4">
      <Card className="max-h-[48dvh] overflow-auto">
        <CardContent className="p-6 space-y-4">
          {/* Primary Upload Button */}
          <Button
            {...getRootProps()}
            className="w-full h-12"
            variant="default"
            disabled={isUploading}
            aria-label={
              isUploading ? "Uploading file..." : "Choose file to upload"
            }
          >
            <input
              {...getInputProps()}
              data-testid="upload-dropzone-input"
              aria-label="File upload input"
            />
            <Upload className="w-5 h-5 mr-2" />
            {isUploading ? "Uploading..." : "Choose File"}
          </Button>

          {/* Concise Dropzone */}
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
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
                : "Drag and drop files here or click to upload"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isUploading) {
                  fileInputRef.current?.click();
                }
              }
            }}
          >
            <div className="flex flex-col items-center space-y-3">
              <Upload
                className={`w-8 h-8 ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isActive ? "Drop to upload" : "Or drag & drop"}
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
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>PNG, JPG, WebP</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>MP4, WebM</span>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSampleImage}
            className="w-full"
            disabled={isUploading}
          >
            <Zap className="w-4 h-4 mr-2" />
            Try sample image
          </Button>
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
