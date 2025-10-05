/**
 * Video processing utilities for Snapthumb
 */

export interface VideoFrame {
  timestamp: number;
  imageData: ImageData;
  canvas: HTMLCanvasElement;
}

/**
 * Extract frame from video at specified timestamp
 */
export async function extractFrameFromVideo(
  video: HTMLVideoElement,
  timestamp: number
): Promise<VideoFrame> {
  // TODO: Implement frame extraction
  // TODO: Use video.currentTime and canvas.drawImage
  // TODO: Handle video loading states

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Store original time
    const originalTime = video.currentTime;

    // Seek to desired timestamp
    video.currentTime = timestamp;

    const onSeeked = () => {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Restore original time
      video.currentTime = originalTime;

      // Clean up event listener
      video.removeEventListener("seeked", onSeeked);

      resolve({
        timestamp,
        imageData,
        canvas,
      });
    };

    video.addEventListener("seeked", onSeeked);

    // Handle seek errors
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("Failed to seek video"));
    };

    video.addEventListener("error", onError);
  });
}

/**
 * Get video duration and dimensions
 */
export function getVideoInfo(video: HTMLVideoElement): {
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
} {
  return {
    duration: video.duration || 0,
    width: video.videoWidth || 0,
    height: video.videoHeight || 0,
    aspectRatio:
      video.videoWidth && video.videoHeight
        ? video.videoWidth / video.videoHeight
        : 0,
  };
}

/**
 * Create video element from file
 */
export function createVideoFromFile(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.preload = "metadata";

    const onLoadedMetadata = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      resolve(video);
    };

    const onError = () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
  });
}

/**
 * Validate video file
 */
export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSizeBytes = 200 * 1024 * 1024; // 200MB limit for graceful failure
  const allowedTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
  ];

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
 * Generate thumbnail previews at regular intervals
 */
export async function generateThumbnailPreviews(
  video: HTMLVideoElement,
  count: number = 10
): Promise<VideoFrame[]> {
  const duration = video.duration;
  const interval = duration / (count + 1);
  const frames: VideoFrame[] = [];

  for (let i = 1; i <= count; i++) {
    const timestamp = interval * i;
    try {
      const frame = await extractFrameFromVideo(video, timestamp);
      frames.push(frame);
    } catch (error) {
      console.warn(`Failed to extract frame at ${timestamp}s:`, error);
    }
  }

  return frames;
}
