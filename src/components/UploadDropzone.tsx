import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Video, FileImage } from "lucide-react";
import { canvasActions } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

export function UploadDropzone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            canvasActions.setImage(img);
            toast({
              title: "Image loaded",
              description: "Your image has been loaded successfully.",
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        reader.onload = (e) => {
          const videoUrl = e.target?.result as string;
          canvasActions.setVideo(videoUrl);
          toast({
            title: "Video loaded",
            description: "Your video has been loaded successfully.",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or video file.",
          variant: "destructive",
        });
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
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isActive ? "bg-blue-100" : "bg-gray-100"}
          `}
          >
            <Upload
              className={`w-8 h-8 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isActive ? "Drop your file here" : "Upload Image or Video"}
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop a file, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: PNG, JPG, WebP, MP4, WebM
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Quick Start</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSampleImage}
          className="w-full justify-start"
        >
          <FileImage className="w-4 h-4 mr-2" />
          Try sample image
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>Images: PNG, JPG, WebP</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Video className="w-4 h-4" />
              <span>Videos: MP4, WebM</span>
            </div>
            <div className="text-xs text-gray-500">
              Files will be automatically cropped to 16:9 aspect ratio
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
