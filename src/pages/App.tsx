import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { canvasActions } from "@/state/canvasStore";
import { useInlineToast, InlineToast } from "@/components/ui/inline-toast";
import { validateImageFile } from "@/lib/image";
import { validateVideoFile } from "@/lib/video";
import { healthCheck } from "@/lib/api";

export default function App() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [layerUnreachable, setLayerUnreachable] = useState(false);
  const { toasts, addToast } = useInlineToast();

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

  // Unified file input handler
  const handleFileInput = useCallback(
    async (file: File) => {
      setIsUploading(true);

      try {
        if (file.type.startsWith("image/")) {
          // Validate image file
          const validation = validateImageFile(file);
          if (!validation.valid) {
            addToast({
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
              addToast({
                title: "Image loaded",
                description: "Your image has been loaded successfully.",
                variant: "success",
              });
              setIsUploading(false);
            };
            img.onerror = () => {
              addToast({
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
            addToast({
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
            addToast({
              title: "Video loaded",
              description:
                "Your video has been loaded successfully. Use the scrubber below to extract frames.",
              variant: "success",
            });
            setIsUploading(false);
          };
          reader.onerror = () => {
            addToast({
              title: "Failed to load video",
              description: "The video file appears to be corrupted.",
              variant: "destructive",
            });
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        } else {
          addToast({
            title: "Invalid file type",
            description: "Please upload an image or video file.",
            variant: "destructive",
          });
          setIsUploading(false);
        }
      } catch (error) {
        console.error("Upload error:", error);
        addToast({
          title: "Upload failed",
          description: "An error occurred while processing the file.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    },
    [addToast]
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

  const isActive = isDragActive || dropzoneActive;

  return (
    <Page>
      <Container>
        <Card className="w-full max-w-md">
          <h1 className="text-lg font-medium text-center">
            Create a thumbnail
          </h1>
          <p className="mt-1 text-center text-sm text-neutral-600">
            Upload an image or video. Processing happens locally.
          </p>

          <div className="mt-6">
            <div
              id="dropzone"
              {...getRootProps()}
              className={`h-40 rounded border-2 border-dashed grid place-items-center text-sm text-neutral-600 cursor-pointer transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-neutral-300 hover:border-neutral-400"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} data-testid="upload-dropzone-input" />
              {isActive ? "Drop to upload" : "Drag & drop or click to choose"}
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-neutral-500">
            PNG, JPG, WebP • MP4, WebM
          </p>

          {layerUnreachable && (
            <p className="mt-2 text-center text-xs text-red-600">
              Layer unreachable
            </p>
          )}

          {/* Render inline toasts */}
          <div className="mt-4 space-y-2">
            {toasts.map((toast) => (
              <InlineToast key={toast.id} {...toast} />
            ))}
          </div>
        </Card>
      </Container>
    </Page>
  );
}
