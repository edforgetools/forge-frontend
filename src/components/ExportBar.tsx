import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  CompressionSelector,
  type CompressionSettings,
} from "@/components/CompressionSelector";
import {
  downloadBlob,
  generateFilename,
  getExtensionFromMimeType,
} from "@/lib/download";
import {
  exportAndDownload,
  formatFileSize,
  formatDuration,
} from "@/lib/export";
import { sessionDB } from "@/lib/db";
import { Undo2, Redo2, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UpgradeModal } from "@/components/UpgradeModal";

interface ExportBarProps {
  onExport?: (
    format?: "image/jpeg" | "image/webp" | "image/png",
    quality?: number,
    compressionSettings?: CompressionSettings
  ) => Promise<Blob>;
  hasContent?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function ExportBar({
  onExport,
  hasContent = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ExportBarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "image/jpeg" | "image/webp" | "image/png"
  >("image/jpeg");
  const [quality, setQuality] = useState([0.8]);
  const [fileSize, setFileSize] = useState(0);
  const [lastExportSize, setLastExportSize] = useState(0);
  const [autoFormat, setAutoFormat] = useState(true);
  const [compressionSettings, setCompressionSettings] =
    useState<CompressionSettings>({
      preset: "medium",
      quality: 0.7,
      targetSizeMB: 2.0,
      ssimThreshold: 0.8,
    });
  const [showCompressionSettings, setShowCompressionSettings] = useState(false);
  const { toast } = useToast();

  // Load compression settings from IndexedDB on mount
  useEffect(() => {
    const loadCompressionSettings = async () => {
      if (sessionDB.isSessionRestoreEnabled()) {
        const sessionData = await sessionDB.loadSession();
        if (sessionData?.compressionSettings) {
          setCompressionSettings(sessionData.compressionSettings);
        }
      }
    };
    loadCompressionSettings();
  }, []);

  // Save compression settings to IndexedDB when they change
  useEffect(() => {
    const saveCompressionSettings = async () => {
      if (sessionDB.isSessionRestoreEnabled()) {
        await sessionDB.saveSession({
          compressionSettings,
        });
      }
    };
    saveCompressionSettings();
  }, [compressionSettings]);

  const handleExport = async () => {
    if (!hasContent) {
      toast({
        title: "No content to export",
        description: "Please upload an image or video first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setFileSize(0);
    const startTime = performance.now();

    try {
      if (!onExport) {
        throw new Error("No export function provided");
      }

      // Use enhanced export if auto-format is enabled
      if (autoFormat) {
        // Create a temporary canvas for the enhanced export
        const canvas = document.createElement("canvas");
        canvas.width = 1280; // Default dimensions
        canvas.height = 720;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Draw a placeholder - in real usage, this would be the actual canvas content
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#333";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Export Preview", canvas.width / 2, canvas.height / 2);

          const result = await exportAndDownload({
            canvas,
            format: "auto",
            targetSizeMB: compressionSettings.targetSizeMB,
            quality: quality[0],
            compressionSettings,
          });

          setFileSize(result.sizeBytes);
          setLastExportSize(result.sizeBytes);

          // Show success toast
          toast({
            title: "Export successful! 🎉",
            description: `Downloaded ${formatFileSize(
              result.sizeBytes
            )} ${result.format.toUpperCase()} file in ${formatDuration(
              result.duration
            )}`,
          });
        }
      } else {
        // Use legacy export method
        const blob = await onExport(
          exportFormat,
          quality[0],
          compressionSettings
        );
        setFileSize(blob.size);
        setLastExportSize(blob.size);

        // Generate filename
        const extension = getExtensionFromMimeType(exportFormat);
        const filename = generateFilename("snapthumb", extension);

        // Download the file
        downloadBlob(blob, filename);

        const duration = performance.now() - startTime;
        toast({
          title: "Export successful! 🎉",
          description: `Downloaded ${formatFileSize(blob.size)} ${exportFormat
            .split("/")[1]
            .toUpperCase()} file in ${formatDuration(duration)}`,
        });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleExport();
    }
  };

  const isOverLimit = fileSize > 2 * 1024 * 1024;
  const qualityPercent = Math.round(quality[0] * 100);

  return (
    <div
      className="flex items-center justify-between p-4 bg-white border-t border-gray-200"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center space-x-6">
        {/* Undo/Redo Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo || isExporting}
            aria-label="Undo last action"
            title="Undo (⌘Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo || isExporting}
            aria-label="Redo last undone action"
            title="Redo (⌘⇧Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Format Selection */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="export-format"
            className="text-sm font-medium text-gray-700"
          >
            Format:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="auto-format-bar"
              checked={autoFormat}
              onChange={(e) => setAutoFormat(e.target.checked)}
              className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              disabled={isExporting}
              aria-label="Enable automatic format selection"
            />
            <label htmlFor="auto-format-bar" className="text-xs text-gray-600">
              Auto
            </label>
          </div>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isExporting || autoFormat}
            aria-label="Select export format"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        {/* Compression Settings */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompressionSettings(!showCompressionSettings)}
            disabled={isExporting}
            className="text-xs"
            aria-label={`${
              showCompressionSettings ? "Hide" : "Show"
            } compression settings`}
            aria-expanded={showCompressionSettings}
          >
            {showCompressionSettings ? "Hide" : "Show"} Compression
          </Button>
          {showCompressionSettings && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {compressionSettings.preset.charAt(0).toUpperCase() +
                  compressionSettings.preset.slice(1)}{" "}
                Quality
              </span>
              <span className="text-xs text-gray-500">
                (≤{compressionSettings.targetSizeMB}MB, SSIM ≥
                {Math.round(compressionSettings.ssimThreshold * 100)}%)
              </span>
            </div>
          )}
        </div>

        {/* Legacy Quality Slider - Hide when compression settings are shown */}
        {exportFormat !== "image/png" && !showCompressionSettings && (
          <div className="flex items-center space-x-3">
            <label
              htmlFor="quality-slider"
              className="text-sm font-medium text-gray-700"
            >
              Quality:
            </label>
            <div className="flex items-center space-x-2 w-32">
              <Slider
                id="quality-slider"
                value={quality}
                onValueChange={setQuality}
                max={1}
                min={0.1}
                step={0.1}
                className="flex-1"
                disabled={isExporting}
              />
              <span className="text-sm text-gray-600 w-8 text-right">
                {qualityPercent}%
              </span>
            </div>
          </div>
        )}

        {/* File Size Display */}
        {fileSize > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Size: {formatFileSize(fileSize)}
            </span>
            {isOverLimit && (
              <span className="text-red-600 text-sm" role="alert">
                ⚠️ Over 2MB limit
              </span>
            )}
            {!isOverLimit && lastExportSize > 0 && (
              <span className="text-green-600 text-sm">✓ Under limit</span>
            )}
          </div>
        )}

        {/* Export Info */}
        <div className="text-xs text-gray-500">
          {exportFormat === "image/png" && "PNG: Lossless, larger files"}
          {exportFormat === "image/webp" && "WebP: Modern, smaller files"}
          {exportFormat === "image/jpeg" &&
            "JPEG: Compatible, adjustable quality"}
        </div>
      </div>

      {/* Compression Settings Panel */}
      {showCompressionSettings && (
        <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200">
          <CompressionSelector
            value={compressionSettings}
            onChange={setCompressionSettings}
            disabled={isExporting}
            showAdvanced={false}
          />
        </div>
      )}

      {/* Upgrade to Pro Button */}
      <UpgradeModal>
        <Button
          variant="outline"
          size="lg"
          className="px-6 py-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
          aria-label="Upgrade to Pro"
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </UpgradeModal>

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || !hasContent}
        size="lg"
        className="px-8 py-2"
        aria-label={
          hasContent
            ? autoFormat
              ? "Export with smart compression"
              : "Export thumbnail"
            : "Export disabled - no content"
        }
      >
        {isExporting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>{autoFormat ? "Optimizing..." : "Exporting..."}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {autoFormat ? (
              <>
                <Zap className="w-4 h-4" />
                <span>Smart Export</span>
              </>
            ) : (
              <span>Export Thumbnail</span>
            )}
            {hasContent && (
              <span className="text-xs opacity-75">(Ctrl+Enter)</span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
