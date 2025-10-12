/**
 * Wire Generate Component
 * Handles wire generation with progress tracking, caching, and error handling
 */

import { useState } from "react";
import {
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  History,
  Image,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useWireGenerate } from "@/lib/wire-generate";
import {
  useWireGenerateSettings,
  getLastWireGenerateSettings,
  resetWireGenerateToDefaults,
} from "@/lib/wire-generate-settings";
import { useCanvasStore } from "@/state/canvasStore";
import { useSnapthumbStore } from "@/lib/snapthumb-state";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface WireGenerateProps {
  className?: string;
  onResult?: (result: unknown) => void;
}

export function WireGenerate({ className, onResult }: WireGenerateProps) {
  const { toast } = useToast();
  const {
    trackGenerateClick,
    trackGenerateSuccess,
    trackGenerateError,
    trackDownloadClick,
  } = useTelemetry();
  const {
    isGenerating,
    progress,
    result,
    error,
    isCached,
    generate,
    regenerateWithNewFrame,
    reset,
    canRegenerate,
  } = useWireGenerate();

  const { hasLastSettings } = useWireGenerateSettings();
  const canvasStore = useCanvasStore();
  const snapthumbStore = useSnapthumbStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleGenerate = async () => {
    const startTime = Date.now();
    const settings = getLastWireGenerateSettings();

    // Track generate click
    trackGenerateClick("wire-generate", settings || undefined);

    try {
      const result = await generate();
      onResult?.(result);

      const duration = Date.now() - startTime;

      // Track successful generation
      trackGenerateSuccess("wire-generate", duration, settings || undefined);

      if (result.cached) {
        toast({
          title: "Instant Result",
          description: "Generated from cache - identical inputs detected",
        });
      } else {
        toast({
          title: "Generation Complete",
          description: "Wire frame generated successfully",
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Track generation error
      trackGenerateError(
        "wire-generate",
        errorMessage,
        duration,
        settings || undefined
      );

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (!result?.downloadUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(result.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const fileExtension = result.downloadUrl.split(".").pop() || "png";
      const fileName = `wire-frame-${Date.now()}.${fileExtension}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Track download click
      trackDownloadClick(fileExtension, "wire-generate", blob.size);

      toast({
        title: "Download Started",
        description: "Wire frame download has begun",
      });
    } catch {
      toast({
        title: "Download Failed",
        description: "Failed to download wire frame",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!result?.previewUrl) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(result.previewUrl);
      toast({
        title: "URL Copied",
        description: "Preview URL copied to clipboard",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleReset = () => {
    reset();
    toast({
      title: "Reset Complete",
      description: "Wire generate state has been reset",
    });
  };

  const handleUseLastSettings = () => {
    const lastSettings = getLastWireGenerateSettings();
    if (!lastSettings) {
      toast({
        title: "No Last Settings",
        description: "No previous settings found to restore",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply last settings to current stores
      if (lastSettings.overlays) {
        canvasStore.setOverlays(lastSettings.overlays as any);
      }
      if (lastSettings.crop) {
        canvasStore.setCrop(lastSettings.crop);
      }
      if (lastSettings.aspect) {
        canvasStore.setAspectRatio(lastSettings.aspect);
      }
      if (lastSettings.prefs) {
        canvasStore.setPrefs(lastSettings.prefs);
      }
      if (lastSettings.snapthumb) {
        snapthumbStore.updateConfig(lastSettings.snapthumb as any);
      }

      toast({
        title: "Settings Restored",
        description: "Last wire generation settings have been applied",
      });
    } catch {
      toast({
        title: "Restore Failed",
        description: "Failed to restore last settings",
        variant: "destructive",
      });
    }
  };

  const handleResetToDefaults = () => {
    try {
      resetWireGenerateToDefaults();
      const defaultSettings = getLastWireGenerateSettings();

      if (defaultSettings) {
        // Apply default settings
        if (defaultSettings.overlays) {
          canvasStore.setOverlays(defaultSettings.overlays as any);
        }
        if (defaultSettings.crop) {
          canvasStore.setCrop(defaultSettings.crop);
        }
        if (defaultSettings.aspect) {
          canvasStore.setAspectRatio(defaultSettings.aspect);
        }
        if (defaultSettings.prefs) {
          canvasStore.setPrefs(defaultSettings.prefs);
        }
        if (defaultSettings.snapthumb) {
          snapthumbStore.updateConfig(defaultSettings.snapthumb as any);
        }
      }

      toast({
        title: "Reset to Defaults",
        description: "Settings have been reset to default values",
      });
    } catch {
      toast({
        title: "Reset Failed",
        description: "Failed to reset to default settings",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateWithNewFrame = async () => {
    const startTime = Date.now();
    const settings = getLastWireGenerateSettings();

    // Track generate click
    trackGenerateClick("wire-regenerate", settings || undefined);

    try {
      const result = await regenerateWithNewFrame();
      onResult?.(result);

      const duration = Date.now() - startTime;

      // Track successful generation
      trackGenerateSuccess("wire-regenerate", duration, settings || undefined);

      toast({
        title: "Regeneration Complete",
        description:
          "Wire frame regenerated with new frame and previous overlay settings",
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Track generation error
      trackGenerateError(
        "wire-regenerate",
        errorMessage,
        duration,
        settings || undefined
      );

      toast({
        title: "Regeneration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Wire Generate
        </CardTitle>
        <CardDescription>
          Generate wire frames from your current canvas configuration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Generation Controls */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isGenerating}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Settings Controls */}
          <div className="flex gap-2">
            {hasLastSettings && (
              <Button
                variant="secondary"
                size="md"
                onClick={handleUseLastSettings}
                disabled={isGenerating}
                className="flex-1"
              >
                <History className="mr-2 h-4 w-4" />
                Use Last Settings
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleResetToDefaults}
              disabled={isGenerating}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>

          {/* Regenerate with New Frame */}
          {canRegenerate && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleRegenerateWithNewFrame}
              disabled={isGenerating}
              className="w-full"
            >
              <Image className="mr-2 h-4 w-4" />
              Regenerate with New Frame
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Generation Failed
              </p>
              <p className="text-xs text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result && !error && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Generation Complete
                </p>
                {isCached && (
                  <Badge variant="secondary" className="mt-1">
                    Cached Result
                  </Badge>
                )}
                {result.processingTime && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Processing time: {result.processingTime}
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            {result.previewUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Preview</h4>
                <div className="relative rounded-md overflow-hidden border">
                  <img
                    src={result.previewUrl}
                    alt="Wire frame preview"
                    className="w-full h-auto max-h-48 object-contain bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              {result.downloadUrl && (
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              )}

              {result.previewUrl && (
                <Button
                  variant="secondary"
                  onClick={handleCopyUrl}
                  disabled={isCopying}
                  className="flex-1"
                >
                  {isCopying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Copying...
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Metadata */}
            {result.determinismHash && (
              <div className="text-xs text-muted-foreground">
                <p>Hash: {result.determinismHash.slice(0, 8)}...</p>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!result && !isGenerating && (
          <div className="text-xs text-muted-foreground">
            <p>
              Click Generate to create a wire frame from your current canvas
              state.
            </p>
            <p className="mt-1">
              Identical inputs will return cached results instantly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
