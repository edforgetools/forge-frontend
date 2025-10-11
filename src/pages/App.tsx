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
  const [sampleAvailable, setSampleAvailable] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
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
    <Page>
      <Container>
        <section className="rounded-2xl border p-6 sm:p-8 shadow-sm">
          <div
            id="dropzone"
            {...getRootProps()}
            className={`h-36 rounded-lg border border-dashed grid place-items-center text-sm text-muted-foreground cursor-pointer transition-colors ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} data-testid="upload-dropzone-input" />
            {isActive
              ? "Drop to upload"
              : "Drag & drop files here or click to choose"}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <Button
              id="choose"
              variant="primary"
              className="w-full"
              onClick={() =>
                (
                  document.querySelector(
                    'input[data-testid="upload-dropzone-input"]'
                  ) as HTMLInputElement
                )?.click()
              }
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose file"}
            </Button>
            {sampleAvailable && (
              <Button
                id="sample"
                variant="outline"
                onClick={onSampleClick}
                disabled={sampleLoading || isUploading}
                className="w-full"
                data-testid="btn-sample"
              >
                {sampleLoading ? "Loading…" : "Try sample image"}
              </Button>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            PNG, JPG, WebP • MP4, WebM
          </p>
        </section>
        {layerUnreachable && (
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Layer unreachable
          </p>
        )}
      </Container>
    </Page>
  );
}
