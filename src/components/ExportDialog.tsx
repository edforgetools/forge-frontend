import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Download, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";
import {
  getEstimatedSize,
  exportAndDownload,
  formatFileSize,
  formatDuration,
} from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useTelemetry } from "@/hooks/useTelemetry";
import { sendHeatmapData } from "@/lib/heatmap";
import { sendLayerUIEvent } from "@/lib/telemetry-api";

interface ExportDialogProps {
  children: React.ReactNode;
  isDragging?: boolean;
}

export function ExportDialog({
  children,
  isDragging = false,
}: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [autoFormat, setAutoFormat] = useState<boolean>(true);
  const { toast } = useToast();
  const { trackDownloadClick } = useTelemetry();

  const { image, videoSrc, crop, prefs } = useCanvasStore();
  const hasContent = image || videoSrc;
  const aspectRatio = crop.w / crop.h;
  const is16to9 = Math.abs(aspectRatio - 16 / 9) < 0.01;
  const isReadyForExport = hasContent && is16to9;

  // Update estimated size when settings change
  useEffect(() => {
    if (hasContent && isOpen) {
      const updateEstimate = async () => {
        try {
          const format = autoFormat ? "webp" : prefs.format; // Use WebP for auto estimation
          const size = await getEstimatedSize({
            width: prefs.width,
            height: prefs.height,
            format: format as "jpeg" | "webp" | "png",
            quality: prefs.quality,
          });
          setEstimatedSize(size);
        } catch (error) {
          console.error("Failed to estimate size:", error);
        }
      };
      updateEstimate();
    }
  }, [
    hasContent,
    isOpen,
    prefs.width,
    prefs.height,
    prefs.format,
    prefs.quality,
    autoFormat,
  ]);

  const handleExport = async () => {
    if (!isReadyForExport) {
      toast({
        title: "Not ready for export",
        description: !hasContent
          ? "Please upload content first."
          : !is16to9
            ? "Crop must be 16:9 aspect ratio for Snapthumb."
            : "Please ensure your content is ready for export.",
        variant: "destructive",
      });
      return;
    }

    if (isDragging) {
      toast({
        title: "Please finish dragging",
        description: "Complete layer manipulation before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    const startTime = performance.now();

    try {
      // Create a canvas for export
      const canvas = document.createElement("canvas");
      canvas.width = prefs.width;
      canvas.height = prefs.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Failed to get canvas context");

      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image if available
      if (image) {
        const sourceX = crop.x;
        const sourceY = crop.y;
        const sourceWidth = crop.w;
        const sourceHeight = crop.h;

        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      // Use enhanced export with auto-format selection and compression
      const result = await exportAndDownload({
        canvas,
        format: autoFormat ? "auto" : prefs.format,
        targetSizeMB: 2.0, // Enforce 2MB limit for Snapthumb
        quality: prefs.quality,
      });

      const duration = performance.now() - startTime;

      // Track download click
      trackDownloadClick(result.format, "export-dialog", result.sizeBytes);

      // Send Layer UI event for export success
      try {
        // Check if this is the first export
        const isFirstExport = !localStorage.getItem(
          "forge-first-export-completed"
        );
        if (isFirstExport) {
          localStorage.setItem("forge-first-export-completed", "true");
          await sendLayerUIEvent("first_export", {
            format: result.format,
            size_bytes: result.sizeBytes,
            duration_ms: duration,
          });
        }

        await sendLayerUIEvent("export_success", {
          format: result.format,
          size_bytes: result.sizeBytes,
          duration_ms: duration,
        });
      } catch (error) {
        console.debug("Failed to send Layer UI event:", error);
      }

      // Show success toast with duration and size
      toast({
        title: "Export successful! 🎉",
        description: `Downloaded ${formatFileSize(
          result.sizeBytes
        )} ${result.format.toUpperCase()} file in ${formatDuration(duration)}`,
      });

      // Send heatmap data on successful export
      try {
        await sendHeatmapData();
      } catch (error) {
        console.debug("Failed to send heatmap data:", error);
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrefsChange = (updates: Partial<typeof prefs>) => {
    canvasActions.setPrefs(updates);
  };

  const targetSizeMB = 2.0; // Enforce 2MB limit for Snapthumb
  const isSizeValid = estimatedSize <= targetSizeMB;
  const sizeRatio = estimatedSize / targetSizeMB;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle>Export Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Format</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-format"
                  checked={autoFormat}
                  onChange={(e) => setAutoFormat(e.target.checked)}
                  className="rounded border-neutral-200 focus:ring-2 focus:ring-blue-500"
                  aria-label="Enable automatic format selection"
                />
                <Label htmlFor="auto-format" className="text-xs text-gray-600">
                  Auto-select best
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={autoFormat ? "primary" : "outline"}
                size="md"
                onClick={() => setAutoFormat(true)}
                className="justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                Auto
              </Button>
              <Button
                variant={
                  !autoFormat && prefs.format === "jpeg" ? "primary" : "outline"
                }
                size="md"
                onClick={() => {
                  setAutoFormat(false);
                  handlePrefsChange({ format: "jpeg" });
                }}
                className="justify-start"
              >
                JPEG
              </Button>
              <Button
                variant={
                  !autoFormat && prefs.format === "png" ? "primary" : "outline"
                }
                size="md"
                onClick={() => {
                  setAutoFormat(false);
                  handlePrefsChange({ format: "png" });
                }}
                className="justify-start"
              >
                PNG
              </Button>
              <Button
                variant={
                  !autoFormat && prefs.format === "webp" ? "primary" : "outline"
                }
                size="md"
                onClick={() => {
                  setAutoFormat(false);
                  handlePrefsChange({ format: "webp" });
                }}
                className="justify-start"
              >
                WebP
              </Button>
            </div>
            {autoFormat && (
              <div className="text-xs text-blue-600 bg-blue-50 p-4 rounded">
                <div className="font-medium">Auto-format enabled</div>
                <div>
                  Will automatically choose the best format based on your image
                  content and browser support.
                </div>
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Width</Label>
              <Input
                type="number"
                value={prefs.width}
                onChange={(e) =>
                  handlePrefsChange({ width: Number(e.target.value) })
                }
                className="h-8"
                aria-label="Export width in pixels"
                min="1"
                max="4096"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Height</Label>
              <Input
                type="number"
                value={prefs.height}
                onChange={(e) =>
                  handlePrefsChange({ height: Number(e.target.value) })
                }
                className="h-8"
                aria-label="Export height in pixels"
                min="1"
                max="4096"
              />
            </div>
          </div>

          {/* Quality (for JPEG/WebP) */}
          {prefs.format !== "png" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quality</Label>
              <div className="space-y-2">
                <Slider
                  value={[prefs.quality]}
                  onValueChange={(values) =>
                    handlePrefsChange({ quality: values[0] })
                  }
                  max={1}
                  min={0.1}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(prefs.quality * 100)}%
                </div>
              </div>
            </div>
          )}

          {/* Size Estimation */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Size</span>
                  <div className="flex items-center space-x-1">
                    {isSizeValid ? (
                      <CheckCircle className="w-[18px] h-[18px] text-green-600" />
                    ) : (
                      <AlertTriangle className="w-[18px] h-[18px] text-amber-600" />
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {estimatedSize.toFixed(2)} MB
                </div>
                <div className="text-xs text-gray-500">
                  Limit: {targetSizeMB} MB (Snapthumb requirement)
                  {autoFormat && (
                    <span className="ml-2 text-blue-600">
                      • Auto-compression enabled
                    </span>
                  )}
                </div>

                {/* Size indicator bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isSizeValid ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(sizeRatio * 100, 100)}%` }}
                  />
                </div>

                {!isSizeValid && (
                  <div className="text-xs text-amber-600">
                    ⚠️ File will exceed size limit
                    {autoFormat && (
                      <div className="mt-1 text-blue-600">
                        Auto-compression will reduce quality to fit under{" "}
                        {targetSizeMB}MB
                      </div>
                    )}
                  </div>
                )}

                {autoFormat && isSizeValid && (
                  <div className="text-xs text-green-600 bg-green-50 p-4 rounded">
                    <div className="font-medium">✅ Optimized export ready</div>
                    <div>
                      Auto-format will ensure the best quality within size
                      limits
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scale down option */}
          {image &&
            (image.width < prefs.width || image.height < prefs.height) && (
              <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded">
                <div className="font-medium">Scale down available</div>
                <div>
                  Source: {image.width}×{image.height}
                </div>
                <div>
                  Target: {prefs.width}×{prefs.height}
                </div>
              </div>
            )}

          {/* Export Button - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white pt-4 pb-safe-area-inset-bottom">
            <Button
              onClick={handleExport}
              disabled={!isReadyForExport || isExporting}
              className="w-full"
              aria-disabled={!isReadyForExport}
              title={
                !isReadyForExport
                  ? !hasContent
                    ? "Upload content to enable export"
                    : !is16to9
                      ? "Crop must be 16:9 aspect ratio for Snapthumb"
                      : "Not ready for export"
                  : isReadyForExport
                    ? autoFormat
                      ? "Export with smart compression"
                      : "Export thumbnail"
                    : ""
              }
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full mr-2" />
                  Optimizing & Exporting...
                </>
              ) : (
                <>
                  <Download className="w-[18px] h-[18px] mr-2" />
                  {autoFormat ? (
                    <>
                      <Zap className="w-[18px] h-[18px] mr-1" />
                      Smart Export
                    </>
                  ) : (
                    `Export ${prefs.format.toUpperCase()}`
                  )}
                </>
              )}
            </Button>

            {autoFormat && (
              <div className="text-xs text-center text-gray-500 mt-2">
                Smart export will auto-select the best format and compress to
                fit under {targetSizeMB}MB
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
