import { useCallback, useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { canvasActions } from "@/state/canvasStore";
import { useInlineToast, InlineToast } from "@/components/ui/inline-toast";
import { validateImageFile } from "@/lib/image";
import { validateVideoFile } from "@/lib/video";
import { healthCheck } from "@/lib/api";

export default function App() {
  const [layerUnreachable, setLayerUnreachable] = useState(false);
  const { toasts, addToast } = useInlineToast();
  const inputRef = useRef<HTMLInputElement>(null);

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
  const onSelectFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

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
                variant: "default",
              });
            };
            img.onerror = () => {
              addToast({
                title: "Failed to load image",
                description: "The image file appears to be corrupted.",
                variant: "destructive",
              });
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
              variant: "default",
            });
          };
          reader.onerror = () => {
            addToast({
              title: "Failed to load video",
              description: "The video file appears to be corrupted.",
              variant: "destructive",
            });
          };
          reader.readAsDataURL(file);
        } else {
          addToast({
            title: "Invalid file type",
            description: "Please upload an image or video file.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        addToast({
          title: "Upload failed",
          description: "An error occurred while processing the file.",
          variant: "destructive",
        });
      }
    },
    [addToast]
  );

  return (
    <Layout>
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Create a thumbnail
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload a file, position your overlay, export.
            </p>
          </div>

          <Card className="space-y-6">
            <div>
              <h2 className="font-medium mb-3">Upload your media</h2>

              {/* Dropzone */}
              <div
                role="button"
                aria-label="Upload file"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  inputRef.current?.click()
                }
                className="h-44 rounded-2xl border-2 border-dashed border-neutral-300 bg-muted/30 grid place-items-center cursor-pointer transition hover:border-forge hover:bg-forge/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="text-center">
                  <div className="font-medium">Upload image or video</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Drag & drop or click to upload
                  </div>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={onSelectFile}
              />

              <p className="mt-3 text-xs text-muted-foreground">
                PNG, JPG, WebP • MP4, WebM • Max 50MB
              </p>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Next steps:</h3>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-forge/10 rounded-full flex items-center justify-center">
                    <span className="text-forge text-xs">1</span>
                  </div>
                  <span>Choose frame</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-forge/10 rounded-full flex items-center justify-center">
                    <span className="text-forge text-xs">2</span>
                  </div>
                  <span>Add logo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-forge/10 rounded-full flex items-center justify-center">
                    <span className="text-forge text-xs">3</span>
                  </div>
                  <span>Export &lt;2MB</span>
                </div>
              </div>
            </div>

            {/* Optional inline health message */}
            {layerUnreachable && (
              <p className="text-xs text-red-600">
                Layer unreachable. You can still export locally.
              </p>
            )}

            {/* Render inline toasts */}
            <div className="space-y-2">
              {toasts.map((toast) => (
                <InlineToast key={toast.id} {...toast} />
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
