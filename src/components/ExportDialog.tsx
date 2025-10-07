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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";
import { estimateSize } from "@/lib/estimateSize";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  children: React.ReactNode;
}

export function ExportDialog({ children }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { image, videoSrc, crop, prefs } = useCanvasStore();
  const hasContent = image || videoSrc;

  // Update estimated size when settings change
  useEffect(() => {
    if (hasContent && isOpen) {
      const updateEstimate = async () => {
        try {
          const size = await estimateSize({
            width: prefs.width,
            height: prefs.height,
            format: prefs.format,
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
  ]);

  const handleExport = async () => {
    if (!hasContent) return;

    setIsExporting(true);
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

      // Convert to blob
      const mimeType = `image/${prefs.format}`;
      const quality = prefs.format === "png" ? undefined : prefs.quality;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          mimeType,
          quality
        );
      });

      // Check size constraint
      const actualSize = blob.size / (1024 * 1024); // Convert to MB
      if (actualSize > prefs.keepUnderMB) {
        toast({
          title: "File too large",
          description: `Export is ${actualSize.toFixed(2)}MB, but limit is ${
            prefs.keepUnderMB
          }MB. Try reducing quality or dimensions.`,
          variant: "destructive",
        });
        return;
      }

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `snapthumb-${Date.now()}.${prefs.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Downloaded ${actualSize.toFixed(
          2
        )}MB ${prefs.format.toUpperCase()} file`,
      });

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

  const isSizeValid = estimatedSize <= prefs.keepUnderMB;
  const sizeRatio = estimatedSize / prefs.keepUnderMB;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md" data-testid="export-dialog">
        <DialogHeader>
          <DialogTitle>Export Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Format</Label>
            <Select
              value={prefs.format}
              onValueChange={(value: "jpeg" | "png" | "webp") =>
                handlePrefsChange({ format: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estimated Size</span>
                  <div className="flex items-center space-x-1">
                    {isSizeValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {estimatedSize.toFixed(2)} MB
                </div>
                <div className="text-xs text-gray-500">
                  Limit: {prefs.keepUnderMB} MB
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scale down option */}
          {image &&
            (image.width < prefs.width || image.height < prefs.height) && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <div className="font-medium">Scale down available</div>
                <div>
                  Source: {image.width}×{image.height}
                </div>
                <div>
                  Target: {prefs.width}×{prefs.height}
                </div>
              </div>
            )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!hasContent || isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {prefs.format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
