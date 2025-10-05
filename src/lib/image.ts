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
 */
export async function exportCanvasUnder2MB(
  canvas: HTMLCanvasElement,
  format: "image/jpeg" | "image/webp" | "image/png" = "image/jpeg",
  quality: number = 0.8
): Promise<Blob> {
  const maxSizeBytes = 2 * 1024 * 1024; // 2MB limit

  // TODO: Implement quality adjustment algorithm
  // TODO: Try different quality levels until file size is under limit
  // TODO: Handle different formats appropriately

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }

        if (blob.size > maxSizeBytes) {
          // TODO: Implement recursive quality reduction
          console.warn(`Export size ${blob.size} exceeds 2MB limit`);
        }

        resolve(blob);
      },
      format,
      quality
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
