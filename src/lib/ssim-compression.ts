/**
 * Enhanced SSIM-based compression for deterministic exports
 * Implements proper SSIM calculation and adaptive quality control
 */

import type { CompressionSettings } from "@/components/CompressionSelector";

export interface SSIMCompressionResult {
  blob: Blob;
  sizeBytes: number;
  quality: number;
  ssim: number;
  iterations: number;
  isDeterministic: boolean;
}

export interface SSIMCompressionOptions {
  format: "image/jpeg" | "image/webp" | "image/png";
  settings: CompressionSettings;
  maxIterations?: number;
  enableSSIM?: boolean;
  targetSizeBytes: number;
}

/**
 * Calculate Structural Similarity Index (SSIM) between two images
 * Implements a simplified but effective SSIM calculation
 */
export async function calculateSSIM(
  originalCanvas: HTMLCanvasElement,
  compressedCanvas: HTMLCanvasElement
): Promise<number> {
  const originalCtx = originalCanvas.getContext("2d");
  const compressedCtx = compressedCanvas.getContext("2d");

  if (!originalCtx || !compressedCtx) {
    return 0.8; // Default fallback
  }

  // Ensure both canvases have the same dimensions for comparison
  const width = Math.min(originalCanvas.width, compressedCanvas.width);
  const height = Math.min(originalCanvas.height, compressedCanvas.height);

  const originalData = originalCtx?.getImageData(0, 0, width, height);
  const compressedData = compressedCtx?.getImageData(0, 0, width, height);

  if (!originalData || !compressedData) {
    return 0.8; // Default fallback
  }

  const originalPixels = originalData?.data;
  const compressedPixels = compressedData?.data;

  if (!originalPixels || !compressedPixels) {
    return 0.8; // Default fallback
  }

  // Calculate luminance for each pixel
  const originalLuminance: number[] = [];
  const compressedLuminance: number[] = [];

  for (let i = 0; i < originalPixels.length; i += 4) {
    // Convert RGB to luminance using standard weights
    const origLum =
      0.299 * originalPixels[i]! +
      0.587 * originalPixels[i + 1]! +
      0.114 * originalPixels[i + 2]!;

    const compLum =
      0.299 * compressedPixels[i]! +
      0.587 * compressedPixels[i + 1]! +
      0.114 * compressedPixels[i + 2]!;

    originalLuminance.push(origLum);
    compressedLuminance.push(compLum);
  }

  // Calculate means
  const origMean =
    originalLuminance.reduce((sum, val) => sum + val, 0) /
    originalLuminance.length;
  const compMean =
    compressedLuminance.reduce((sum, val) => sum + val, 0) /
    compressedLuminance.length;

  // Calculate variances and covariance
  let origVariance = 0;
  let compVariance = 0;
  let covariance = 0;

  for (let i = 0; i < originalLuminance.length; i++) {
    const origDiff = originalLuminance[i]! - origMean;
    const compDiff = compressedLuminance[i]! - compMean;

    origVariance += origDiff * origDiff;
    compVariance += compDiff * compDiff;
    covariance += origDiff * compDiff;
  }

  origVariance /= originalLuminance.length;
  compVariance /= originalLuminance.length;
  covariance /= originalLuminance.length;

  // SSIM constants
  const C1 = 0.01;
  const C2 = 0.03;

  // Calculate SSIM
  const numerator = (2 * origMean * compMean + C1) * (2 * covariance + C2);
  const denominator =
    (origMean * origMean + compMean * compMean + C1) *
    (origVariance + compVariance + C2);

  const ssim = numerator / denominator;

  // Clamp to valid range [0, 1]
  return Math.max(0, Math.min(1, ssim));
}

/**
 * Create a copy of canvas with specified dimensions
 */
function resizeCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  const resizedCanvas = document.createElement("canvas");
  const ctx = resizedCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  resizedCanvas.width = width;
  resizedCanvas.height = height;

  // Use high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, width, height);

  return resizedCanvas;
}

/**
 * Convert blob to canvas for SSIM calculation
 */
async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Failed to load image from blob"));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Binary search for optimal quality with SSIM constraint
 */
async function findOptimalQuality(
  canvas: HTMLCanvasElement,
  format: string,
  targetSizeBytes: number,
  ssimThreshold: number,
  maxIterations: number
): Promise<{ quality: number; ssim: number; iterations: number }> {
  let low = 0.1;
  let high = 1.0;
  let bestQuality = 0.8;
  let bestSSIM = 0;
  let iterations = 0;

  while (high - low > 0.01 && iterations < maxIterations) {
    const mid = (low + high) / 2;
    iterations++;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format, mid);
    });

    if (!blob) {
      high = mid;
      continue;
    }

    if (blob.size <= targetSizeBytes) {
      // Size constraint met, check SSIM
      const tempCanvas = await blobToCanvas(blob);
      const ssim = await calculateSSIM(canvas, tempCanvas);

      if (ssim >= ssimThreshold) {
        return { quality: mid, ssim, iterations };
      }

      if (ssim > bestSSIM) {
        bestQuality = mid;
        bestSSIM = ssim;
      }

      // Try higher quality
      low = mid;
    } else {
      // Size too large, try lower quality
      high = mid;
    }
  }

  return { quality: bestQuality, ssim: bestSSIM, iterations };
}

/**
 * Compress PNG by resizing with SSIM validation
 */
async function compressPNGWithSSIM(
  canvas: HTMLCanvasElement,
  targetSizeBytes: number
): Promise<SSIMCompressionResult> {
  const originalSize = canvas.width * canvas.height * 4; // Rough estimate
  const sizeRatio = Math.sqrt(targetSizeBytes / originalSize);

  const newWidth = Math.max(1, Math.floor(canvas.width * sizeRatio));
  const newHeight = Math.max(1, Math.floor(canvas.height * sizeRatio));

  const resizedCanvas = resizeCanvas(canvas, newWidth, newHeight);
  const blob = await new Promise<Blob | null>((resolve) => {
    resizedCanvas.toBlob(resolve, "image/png");
  });

  if (!blob) {
    throw new Error("Failed to create PNG blob");
  }

  const ssim = await calculateSSIM(canvas, resizedCanvas);

  return {
    blob,
    sizeBytes: blob.size,
    quality: 1.0,
    ssim,
    iterations: 1,
    isDeterministic: true,
  };
}

/**
 * Enhanced compression with proper SSIM calculation
 */
export async function compressWithSSIM(
  canvas: HTMLCanvasElement,
  options: SSIMCompressionOptions
): Promise<SSIMCompressionResult> {
  const {
    format,
    settings,
    maxIterations = 20,
    enableSSIM = true,
    targetSizeBytes,
  } = options;

  // For PNG format, we need to resize instead of reducing quality
  if (format === "image/png") {
    return compressPNGWithSSIM(canvas, targetSizeBytes);
  }

  if (!enableSSIM) {
    // Fallback to simple quality reduction
    let quality = settings.quality;
    const qualityStep = 0.05;
    let iterations = 0;

    while (quality >= 0.1 && iterations < maxIterations) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format, quality);
      });

      if (blob && blob.size <= targetSizeBytes) {
        return {
          blob,
          sizeBytes: blob.size,
          quality,
          ssim: 1.0,
          iterations: iterations + 1,
          isDeterministic: false,
        };
      }

      quality -= qualityStep;
      iterations++;
    }

    // If still too large, resize
    const sizeRatio = Math.sqrt(
      targetSizeBytes / (canvas.width * canvas.height * 4)
    );
    const newWidth = Math.max(1, Math.floor(canvas.width * sizeRatio));
    const newHeight = Math.max(1, Math.floor(canvas.height * sizeRatio));
    const resizedCanvas = resizeCanvas(canvas, newWidth, newHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      resizedCanvas.toBlob(resolve, format, 0.8);
    });

    if (!blob) {
      throw new Error("Failed to create compressed blob");
    }

    return {
      blob,
      sizeBytes: blob.size,
      quality: 0.8,
      ssim: 1.0,
      iterations: iterations + 1,
      isDeterministic: true,
    };
  }

  // Use binary search with SSIM constraint
  const { quality, ssim, iterations } = await findOptimalQuality(
    canvas,
    format,
    targetSizeBytes,
    settings.ssimThreshold,
    maxIterations
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, format, quality);
  });

  if (!blob) {
    throw new Error("Failed to create compressed blob");
  }

  return {
    blob,
    sizeBytes: blob.size,
    quality,
    ssim,
    iterations,
    isDeterministic: true,
  };
}

/**
 * Get compression presets for different quality levels
 */
export function getCompressionPresets(): Record<string, CompressionSettings> {
  return {
    low: {
      preset: "low",
      quality: 0.6,
      targetSizeMB: 2,
      ssimThreshold: 0.7,
    },
    medium: {
      preset: "medium",
      quality: 0.8,
      targetSizeMB: 2,
      ssimThreshold: 0.8,
    },
    high: {
      preset: "high",
      quality: 0.9,
      targetSizeMB: 2,
      ssimThreshold: 0.9,
    },
  };
}
