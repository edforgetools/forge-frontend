import { useState } from "react";

export function ExportBar() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "image/jpeg" | "image/webp" | "image/png"
  >("image/jpeg");
  const [quality, setQuality] = useState(0.8);
  const [fileSize, setFileSize] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // TODO: Implement actual export logic
      // TODO: Ensure file size is under 2MB
      // TODO: Use exportCanvasUnder2MB from lib/image.ts
      console.log("Exporting with format:", exportFormat, "quality:", quality);

      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Trigger download
      setFileSize(1024 * 1024); // Simulate 1MB file
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: Keyboard shortcuts for export
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      handleExport();
    }
  };

  return (
    <div
      className="flex items-center justify-between"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Format:</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WebP</option>
            <option value="image/png">PNG</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Quality:</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm text-gray-600 w-8">
            {Math.round(quality * 100)}%
          </span>
        </div>

        {fileSize > 0 && (
          <div className="text-sm text-gray-600">
            Size: {(fileSize / 1024 / 1024).toFixed(1)}MB
            {fileSize > 2 * 1024 * 1024 && (
              <span className="text-red-600 ml-1">⚠️ Over 2MB limit</span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
      >
        {isExporting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Exporting...</span>
          </div>
        ) : (
          "Export Thumbnail"
        )}
      </button>
    </div>
  );
}
