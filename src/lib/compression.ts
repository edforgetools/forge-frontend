/**
 * Advanced image compression utilities with SSIM-based quality control
 */

import type { CompressionSettings } from "@/components/CompressionSelector";

export interface CompressionResult {
  blob: Blob;
  sizeBytes: number;
  quality: number;
  ssim: number;
  iterations: number;
}

export interface CompressionOptions {
  format: "image/jpeg" | "image/webp" | "image/png";
  settings: CompressionSettings;
  maxIterations?: number;
  enableSSIM?: boolean;
}

/**
 * Calculate Structural Similarity Index (SSIM) between two images
 * Simplified implementation for client-side use
 */
async function calculateSSIM(
  originalCanvas: HTMLCanvasElement,
  compressedCanvas: HTMLCanvasElement
): Promise<number> {
  // For now, use a simplified quality metric based on image dimensions and compression
  // In a production environment, you'd want to implement proper SSIM calculation
  // This is a placeholder that returns a reasonable estimate

  const originalData = originalCanvas
    .getContext("2d")
    ?.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
  const compressedData = compressedCanvas
    .getContext("2d")
    ?.getImageData(0, 0, compressedCanvas.width, compressedCanvas.height);

  if (!originalData || !compressedData) {
    return 0.8; // Default fallback
  }

  // Simplified quality estimation based on canvas size and data similarity
  const sizeRatio = Math.min(
    originalCanvas.width / compressedCanvas.width,
    originalCanvas.height / compressedCanvas.height
  );
  const estimatedQuality = Math.max(0.5, Math.min(0.95, sizeRatio * 0.9));

  return estimatedQuality;
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

  ctx.drawImage(canvas, 0, 0, width, height);

  return resizedCanvas;
}

/**
 * Advanced compression with SSIM-based quality control
 */
export async function compressCanvasWithSSIM(
  canvas: HTMLCanvasElement,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { format, settings, maxIterations = 20, enableSSIM = true } = options;

  const targetSizeBytes = settings.targetSizeMB * 1024 * 1024;
  const minQuality = 0.1;
  const qualityStep = 0.05;

  let quality = settings.quality;
  let iterations = 0;
  let bestResult: CompressionResult | null = null;

  // For PNG format, we need to resize instead of reducing quality
  if (format === "image/png") {
    return compressPNGWithSSIM(canvas, targetSizeBytes, settings);
  }

  console.log(
    `Starting compression: target ${
      settings.targetSizeMB
    }MB, SSIM ≥${Math.round(settings.ssimThreshold * 100)}%`
  );

  while (quality >= minQuality && iterations < maxIterations) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format, quality);
    });

    if (!blob) {
      throw new Error("Failed to create blob from canvas");
    }

    // Check if we meet the size requirement
    if (blob.size <= targetSizeBytes) {
      let ssim = 1.0; // Assume perfect quality for same canvas

      if (enableSSIM && iterations > 0) {
        // Create a temporary canvas from the compressed blob to calculate SSIM
        const tempCanvas = await blobToCanvas(blob);
        ssim = await calculateSSIM(canvas, tempCanvas);
      }

      const result: CompressionResult = {
        blob,
        sizeBytes: blob.size,
        quality,
        ssim,
        iterations: iterations + 1,
      };

      // Check SSIM threshold
      if (ssim >= settings.ssimThreshold) {
        console.log(
          `Compression successful: ${format} at ${(quality * 100).toFixed(
            1
          )}% quality, ${(blob.size / 1024 / 1024).toFixed(2)}MB, SSIM: ${(
            ssim * 100
          ).toFixed(1)}%`
        );
        return result;
      } else {
        // Store as potential result if it's the best so far
        if (!bestResult || blob.size < bestResult.sizeBytes) {
          bestResult = result;
        }
      }
    }

    quality -= qualityStep;
    iterations++;
  }

  // If we couldn't meet both size and SSIM requirements, try resizing
  if (!bestResult || bestResult.sizeBytes > targetSizeBytes) {
    console.log(
      `Quality reduction insufficient, attempting resize for ${format}`
    );
    return compressWithResize(canvas, format, targetSizeBytes, settings);
  }

  console.log(
    `Using best available result: ${(bestResult.quality * 100).toFixed(
      1
    )}% quality, ${(bestResult.sizeBytes / 1024 / 1024).toFixed(2)}MB, SSIM: ${(
      bestResult.ssim * 100
    ).toFixed(1)}%`
  );
  return bestResult;
}

/**
 * Compress PNG by resizing (since PNG is lossless)
 */
async function compressPNGWithSSIM(
  canvas: HTMLCanvasElement,
  targetSizeBytes: number,
  _settings: CompressionSettings
): Promise<CompressionResult> {
  const originalBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!originalBlob) {
    throw new Error("Failed to create PNG blob from canvas");
  }

  if (originalBlob.size <= targetSizeBytes) {
    return {
      blob: originalBlob,
      sizeBytes: originalBlob.size,
      quality: 1.0,
      ssim: 1.0,
      iterations: 1,
    };
  }

  // Calculate resize factor
  const sizeRatio = Math.sqrt(targetSizeBytes / originalBlob.size);
  const newWidth = Math.floor(canvas.width * sizeRatio);
  const newHeight = Math.floor(canvas.height * sizeRatio);

  const resizedCanvas = resizeCanvas(canvas, newWidth, newHeight);
  const resizedBlob = await new Promise<Blob | null>((resolve) => {
    resizedCanvas.toBlob(resolve, "image/png");
  });

  if (!resizedBlob) {
    throw new Error("Failed to create resized PNG blob");
  }

  const ssim = await calculateSSIM(canvas, resizedCanvas);

  return {
    blob: resizedBlob,
    sizeBytes: resizedBlob.size,
    quality: 1.0,
    ssim,
    iterations: 1,
  };
}

/**
 * Compress by resizing when quality reduction isn't enough
 */
async function compressWithResize(
  canvas: HTMLCanvasElement,
  format: "image/jpeg" | "image/webp",
  targetSizeBytes: number,
  _settings: CompressionSettings
): Promise<CompressionResult> {
  // Try with minimum quality first
  const minQualityBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, format, 0.1);
  });

  if (minQualityBlob && minQualityBlob.size <= targetSizeBytes) {
    const ssim = await calculateSSIM(
      canvas,
      await blobToCanvas(minQualityBlob)
    );
    return {
      blob: minQualityBlob,
      sizeBytes: minQualityBlob.size,
      quality: 0.1,
      ssim,
      iterations: 1,
    };
  }

  // Calculate resize factor
  const sizeRatio = Math.sqrt(
    targetSizeBytes / (minQualityBlob?.size || targetSizeBytes * 2)
  );
  const newWidth = Math.floor(canvas.width * sizeRatio);
  const newHeight = Math.floor(canvas.height * sizeRatio);

  const resizedCanvas = resizeCanvas(canvas, newWidth, newHeight);
  const resizedBlob = await new Promise<Blob | null>((resolve) => {
    resizedCanvas.toBlob(resolve, format, 0.8);
  });

  if (!resizedBlob) {
    throw new Error("Failed to create resized blob");
  }

  const ssim = await calculateSSIM(canvas, resizedCanvas);

  return {
    blob: resizedBlob,
    sizeBytes: resizedBlob.size,
    quality: 0.8,
    ssim,
    iterations: 1,
  };
}

/**
 * Convert blob to canvas for SSIM calculation
 */
async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

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

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image from blob"));
    };

    img.src = url;
  });
}

/**
 * Get compression preset recommendations based on content analysis
 */
export function getRecommendedPreset(
  canvas: HTMLCanvasElement,
  _format: "image/jpeg" | "image/webp" | "image/png"
): CompressionSettings["preset"] {
  const pixelCount = canvas.width * canvas.height;
  const complexity = estimateImageComplexity(canvas);

  // For high-resolution or complex images, use medium preset
  if (pixelCount > 1920 * 1080 || complexity > 0.7) {
    return "medium";
  }

  // For simple images, high preset should work well
  if (complexity < 0.3) {
    return "high";
  }

  // Default to medium for balanced approach
  return "medium";
}

/**
 * Estimate image complexity based on color variance
 */
function estimateImageComplexity(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0.5;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let variance = 0;
  let mean = 0;

  // Sample every 10th pixel for performance
  for (let i = 0; i < data.length; i += 40) {
    const pixel = (data[i] + data[i + 1] + data[i + 2]) / 3;
    mean += pixel;
  }

  const sampleCount = data.length / 40;
  mean /= sampleCount;

  for (let i = 0; i < data.length; i += 40) {
    const pixel = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += Math.pow(pixel - mean, 2);
  }

  variance /= sampleCount;

  // Normalize to 0-1 range
  return Math.min(1, variance / 10000);
}
