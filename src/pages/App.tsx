import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { canvasActions } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";
import { validateImageFile } from "@/lib/image";
import { validateVideoFile } from "@/lib/video";
import { healthCheck } from "@/lib/api";

export default function App() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [layerUnreachable, setLayerUnreachable] = useState(false);
  const { toast } = useToast();

  // Check Forge Layer connection status
  useEffect(() => {
    const checkLayerConnection = async () => {
      const forgeLayerUrl = import.meta.env.VITE_FORGE_LAYER_URL;

      // Only check if FORGE_LAYER_URL is truthy
      if (!forgeLayerUrl) {
        return;
      }

      try {
        await healthCheck();
        setLayerUnreachable(false);
      } catch {
        setLayerUnreachable(true);
      }
    };

    checkLayerConnection();
  }, []);

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
    <Page>
      <Container>
        <section className="w-full p-6 sm:p-8 rounded-2xl border flex flex-col gap-4">
          {/* Choose file button */}
          <Button
            id="file-btn"
            {...getRootProps()}
            className="w-full"
            variant="primary"
            disabled={isUploading}
          >
            <input {...getInputProps()} data-testid="upload-dropzone-input" />
            {isUploading ? "Uploading..." : "Choose file"}
          </Button>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
            h-[140px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors text-sm
            ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          >
            <div className="text-center">
              <p className="text-muted-foreground">
                {isActive ? "Drop to upload" : "Or drag & drop files here"}
              </p>
            </div>
          </div>

          {/* Try sample image button */}
          <Button
            id="sample-btn"
            variant="outline"
            onClick={handleSampleImage}
            className="w-full"
            disabled={isUploading}
          >
            Try sample image
          </Button>

          {/* Formats line */}
          <p className="text-xs text-muted-foreground text-center">
            PNG, JPG, WebP • MP4, WebM
          </p>

          {/* Layer unreachable message - only show if FORGE_LAYER_URL is set and unreachable */}
          {layerUnreachable && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 text-center">
                Layer unreachable
              </p>
            </div>
          )}
        </section>
      </Container>
    </Page>
  );
}
