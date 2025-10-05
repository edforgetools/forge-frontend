import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  downloadBlob,
  generateFilename,
  getExtensionFromMimeType,
} from "@/lib/download";

interface ExportBarProps {
  onExport?: () => Promise<Blob>;
  hasContent?: boolean;
}

export function ExportBar({ onExport, hasContent = false }: ExportBarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "image/jpeg" | "image/webp" | "image/png"
  >("image/jpeg");
  const [quality, setQuality] = useState([0.8]);
  const [fileSize, setFileSize] = useState(0);
  const [lastExportSize, setLastExportSize] = useState(0);

  const handleExport = async () => {
    if (!hasContent) {
      alert("No content to export. Please upload an image or video first.");
      return;
    }

    setIsExporting(true);
    setFileSize(0);

    try {
      if (!onExport) {
        throw new Error("No export function provided");
      }

      const blob = await onExport();
      setFileSize(blob.size);
      setLastExportSize(blob.size);

      // Generate filename
      const extension = getExtensionFromMimeType(exportFormat);
      const filename = generateFilename("snapthumb", extension);

      // Download the file
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isOverLimit = fileSize > 2 * 1024 * 1024;
  const qualityPercent = Math.round(quality[0] * 100);

  return (
    <div
      className="flex items-center justify-between p-4 bg-white border-t border-gray-200"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center space-x-6">
        {/* Format Selection */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="export-format"
            className="text-sm font-medium text-gray-700"
          >
            Format:
          </label>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isExporting}
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        {/* Quality Slider */}
        {exportFormat !== "image/png" && (
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

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || !hasContent}
        size="lg"
        className="px-8 py-2"
      >
        {isExporting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Exporting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>Export Thumbnail</span>
            {hasContent && (
              <span className="text-xs opacity-75">(Ctrl+Enter)</span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
