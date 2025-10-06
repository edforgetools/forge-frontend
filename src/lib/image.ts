/**
 * Image processing utilities for Snapthumb
 */

export interface ExportOptions {
  format: "image/jpeg" | "image/webp" | "image/png";
  quality: number;
  maxSizeBytes: number;
}

/**
 * Export canvas with automatic quality adjustment to stay under size limit
 * @deprecated Use compressCanvasWithSSIM for advanced compression with SSIM control
 */
export async function exportCanvasUnder2MB(
  canvas: HTMLCanvasElement,
  format: "image/jpeg" | "image/webp" | "image/png" = "image/jpeg",
  initialQuality: number = 0.8
): Promise<Blob> {
  const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit
  const minQuality = 0.1;
  const qualityStep = 0.05; // Smaller steps for better quality control

  // For PNG format, we need to resize the canvas instead of reducing quality
  if (format === "image/png") {
    return exportPNGUnder2MB(canvas, maxSizeBytes);
  }

  let quality = initialQuality;
  let attempts = 0;
  const maxAttempts = 15; // Prevent infinite loops

  while (quality >= minQuality && attempts < maxAttempts) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, format, quality);
    });

    if (!blob) {
      throw new Error("Failed to create blob from canvas");
    }

    if (blob.size <= maxSizeBytes) {
      console.log(
        `Export successful: ${format} at ${(quality * 100).toFixed(
          1
        )}% quality, ${(blob.size / 1024 / 1024).toFixed(2)}MB`
      );
      return blob;
    }

    quality -= qualityStep;
    attempts++;
  }

  // If we still can't get under the limit, try resizing
  console.log(
    `Quality reduction insufficient, attempting resize for ${format}`
  );
  return exportResizedCanvas(canvas, format, maxSizeBytes);
}

/**
 * Export PNG with size optimization by resizing
 */
async function exportPNGUnder2MB(
  canvas: HTMLCanvasElement,
  maxSizeBytes: number
): Promise<Blob> {
  const originalBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });

  if (!originalBlob) {
    throw new Error("Failed to create PNG blob from canvas");
  }

  if (originalBlob.size <= maxSizeBytes) {
    return originalBlob;
  }

  // Calculate resize factor to get under size limit
  const sizeRatio = Math.sqrt(maxSizeBytes / originalBlob.size);
  const newWidth = Math.floor(canvas.width * sizeRatio);
  const newHeight = Math.floor(canvas.height * sizeRatio);

  // Create resized canvas
  const resizedCanvas = document.createElement("canvas");
  const resizedCtx = resizedCanvas.getContext("2d");

  if (!resizedCtx) {
    throw new Error("Failed to get resized canvas context");
  }

  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;

  // Draw resized image
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return new Promise<Blob>((resolve, reject) => {
    resizedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create resized PNG blob"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

/**
 * Export resized canvas when quality reduction isn't enough
 */
async function exportResizedCanvas(
  canvas: HTMLCanvasElement,
  format: "image/jpeg" | "image/webp",
  maxSizeBytes: number
): Promise<Blob> {
  // Try with minimum quality first
  const minQualityBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, format, 0.1);
  });

  if (minQualityBlob && minQualityBlob.size <= maxSizeBytes) {
    return minQualityBlob;
  }

  // Calculate resize factor
  const sizeRatio = Math.sqrt(
    maxSizeBytes / (minQualityBlob?.size || maxSizeBytes * 2)
  );
  const newWidth = Math.floor(canvas.width * sizeRatio);
  const newHeight = Math.floor(canvas.height * sizeRatio);

  // Create resized canvas
  const resizedCanvas = document.createElement("canvas");
  const resizedCtx = resizedCanvas.getContext("2d");

  if (!resizedCtx) {
    throw new Error("Failed to get resized canvas context");
  }

  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;

  // Draw resized image
  resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return new Promise<Blob>((resolve, reject) => {
    resizedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create resized blob"));
          return;
        }
        resolve(blob);
      },
      format,
      0.8
    );
  });
}

/**
 * Resize image to fit within specified dimensions while maintaining aspect ratio
 */
export function resizeImageToFit(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = image.width / image.height;

  let width = image.width;
  let height = image.height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

/**
 * Crop image to 16:9 aspect ratio
 */
export function cropTo16to9(
  image: HTMLImageElement,
  centerX: number = 0.5,
  centerY: number = 0.5
): { x: number; y: number; width: number; height: number } {
  const aspectRatio = 16 / 9;
  const imageAspectRatio = image.width / image.height;

  let width: number;
  let height: number;
  let x: number;
  let y: number;

  if (imageAspectRatio > aspectRatio) {
    // Image is wider than 16:9, crop width
    height = image.height;
    width = height * aspectRatio;
    x = (image.width - width) * centerX;
    y = 0;
  } else {
    // Image is taller than 16:9, crop height
    width = image.width;
    height = width / aspectRatio;
    x = 0;
    y = (image.height - height) * centerY;
  }

  return { x, y, width, height };
}

/**
 * Validate file size and type
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSizeBytes = 200 * 1024 * 1024; // 200MB limit for graceful failure
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(
        1
      )}MB exceeds 200MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
    };
  }

  return { valid: true };
}

/**
 * Create image element from file
 */
export function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Draw image to canvas with proper scaling and positioning
 */
export function drawImageToCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  cropArea?: { x: number; y: number; width: number; height: number }
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (cropArea) {
    // Draw cropped portion of image
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    // Draw full image, scaling to fit canvas
    const { width, height } = resizeImageToFit(
      image,
      canvas.width,
      canvas.height
    );
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    ctx.drawImage(image, x, y, width, height);
  }
}

/**
 * Get optimal canvas dimensions for 16:9 aspect ratio
 */
export function getOptimalCanvasDimensions(
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } {
  const aspectRatio = 16 / 9;

  let width = containerWidth;
  let height = containerWidth / aspectRatio;

  if (height > containerHeight) {
    height = containerHeight;
    width = height * aspectRatio;
  }

  return { width: Math.floor(width), height: Math.floor(height) };
}
