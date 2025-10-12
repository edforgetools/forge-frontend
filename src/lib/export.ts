/**
 * Enhanced export utilities with auto-format selection, compression, and telemetry
 */

import { track } from "@vercel/analytics";
import {
  downloadBlob,
  generateFilename,
  getExtensionFromMimeType,
} from "./download";
import { compressWithSSIM } from "./ssim-compression";
import type { CompressionSettings } from "@/components/CompressionSelector";
import { estimateSize } from "./estimateSize";
import { sendTelemetry } from "./telemetry";

export interface ExportOptions {
  canvas: HTMLCanvasElement;
  format?: "auto" | "jpeg" | "webp" | "png";
  targetSizeMB?: number;
  quality?: number;
  compressionSettings?: CompressionSettings;
}

export interface ExportResult {
  blob: Blob;
  format: string;
  sizeBytes: number;
  quality: number;
  duration: number;
  iterations: number;
}

/**
 * Auto-select the best format based on browser support and content analysis
 */
function selectBestFormat(canvas: HTMLCanvasElement): "jpeg" | "webp" | "png" {
  // Check WebP support
  const webpSupported = checkWebPSupport();

  // Analyze image content to determine best format
  const hasTransparency = hasTransparentPixels(canvas);
  const complexity = estimateImageComplexity(canvas);

  // PNG for images with transparency
  if (hasTransparency) {
    return "png";
  }

  // WebP for modern browsers and complex images (better compression)
  if (webpSupported && complexity > 0.3) {
    return "webp";
  }

  // JPEG as fallback (best compatibility)
  return "jpeg";
}

/**
 * Check if browser supports WebP
 */
function checkWebPSupport(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
}

/**
 * Check if image has transparent pixels
 */
function hasTransparentPixels(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Sample every 100th pixel for performance
  for (let i = 3; i < data.length; i += 400) {
    if ((data[i] ?? 255) < 255) {
      // Alpha channel < 255 means transparency
      return true;
    }
  }

  return false;
}

/**
 * Estimate image complexity for format selection
 */
function estimateImageComplexity(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0.5;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let variance = 0;
  let mean = 0;

  // Sample every 20th pixel for performance
  for (let i = 0; i < data.length; i += 80) {
    const pixel =
      ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3;
    mean += pixel;
  }

  const sampleCount = data.length / 80;
  mean /= sampleCount;

  for (let i = 0; i < data.length; i += 80) {
    const pixel =
      ((data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) / 3;
    variance += Math.pow(pixel - mean, 2);
  }

  variance /= sampleCount;

  // Normalize to 0-1 range
  return Math.min(1, variance / 10000);
}

/**
 * Get estimated file size for given options
 */
export async function getEstimatedSize(options: {
  width: number;
  height: number;
  format: "jpeg" | "webp" | "png";
  quality: number;
}): Promise<number> {
  return estimateSize(options);
}

/**
 * Enhanced export with auto-format selection and compression
 */
export async function exportCanvas(
  options: ExportOptions
): Promise<ExportResult> {
  const startTime = performance.now();

  const {
    canvas,
    format = "auto",
    targetSizeMB = 2,
    quality = 0.8,
    compressionSettings,
  } = options;

  // Auto-select format if needed
  const selectedFormat = format === "auto" ? selectBestFormat(canvas) : format;
  const mimeType = `image/${selectedFormat}`;

  // Create default compression settings if not provided
  const defaultCompressionSettings: CompressionSettings = {
    preset: "medium",
    quality,
    targetSizeMB,
    ssimThreshold: 0.8,
    ...compressionSettings,
  };

  let result: ExportResult;

  try {
    // Use enhanced SSIM compression for JPEG/WebP
    if (selectedFormat === "jpeg" || selectedFormat === "webp") {
      const compressionResult = await compressWithSSIM(canvas, {
        format: mimeType as "image/jpeg" | "image/webp",
        settings: defaultCompressionSettings,
        maxIterations: 20,
        enableSSIM: true,
        targetSizeBytes: targetSizeMB * 1024 * 1024,
      });

      result = {
        blob: compressionResult.blob,
        format: selectedFormat,
        sizeBytes: compressionResult.sizeBytes,
        quality: compressionResult.quality,
        duration: performance.now() - startTime,
        iterations: compressionResult.iterations,
      };
    } else {
      // PNG - no quality compression, just resize if needed
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create PNG blob"));
        }, "image/png");
      });

      // If PNG is too large, resize it
      if (blob.size > targetSizeMB * 1024 * 1024) {
        const sizeRatio = Math.sqrt((targetSizeMB * 1024 * 1024) / blob.size);
        const newWidth = Math.floor(canvas.width * sizeRatio);
        const newHeight = Math.floor(canvas.height * sizeRatio);

        const resizedCanvas = document.createElement("canvas");
        const ctx = resizedCanvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        const resizedBlob = await new Promise<Blob>((resolve, reject) => {
          resizedCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create resized PNG blob"));
          }, "image/png");
        });

        result = {
          blob: resizedBlob,
          format: selectedFormat,
          sizeBytes: resizedBlob.size,
          quality: 1.0,
          duration: performance.now() - startTime,
          iterations: 1,
        };
      } else {
        result = {
          blob,
          format: selectedFormat,
          sizeBytes: blob.size,
          quality: 1.0,
          duration: performance.now() - startTime,
          iterations: 1,
        };
      }
    }

    // Fire telemetry
    track("export_completed", {
      format: result.format,
      sizeBytes: result.sizeBytes,
      duration: Math.round(result.duration),
      quality: Math.round(result.quality * 100),
      iterations: result.iterations,
      targetSizeMB,
      underLimit: result.sizeBytes <= targetSizeMB * 1024 * 1024,
    });

    // Send custom telemetry
    sendTelemetry("onExport", {
      duration: Math.round(result.duration),
      bytes: result.sizeBytes,
      format: result.format,
      quality: Math.round(result.quality * 100),
      iterations: result.iterations,
      targetSizeMB,
      underLimit: result.sizeBytes <= targetSizeMB * 1024 * 1024,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Fire error telemetry
    track("export_failed", {
      format: selectedFormat,
      duration: Math.round(duration),
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Send custom error telemetry
    sendTelemetry("onExport", {
      duration: Math.round(duration),
      bytes: 0,
      format: selectedFormat,
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    });

    throw error;
  }
}

/**
 * Export and download canvas with enhanced features
 */
export async function exportAndDownload(
  options: ExportOptions
): Promise<ExportResult> {
  const result = await exportCanvas(options);

  // Generate filename with correct format for Snapthumb
  const extension = getExtensionFromMimeType(`image/${result.format}`);
  const filename = generateFilename("snapthumb", extension);

  // Download the file
  downloadBlob(result.blob, filename);

  return result;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}
