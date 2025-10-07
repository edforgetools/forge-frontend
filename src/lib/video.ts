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
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Ensure video is ready
    if (video.readyState < 2) {
      reject(new Error("Video not ready for frame extraction"));
      return;
    }

    // Validate timestamp
    if (timestamp < 0 || timestamp > video.duration) {
      reject(new Error("Timestamp out of range"));
      return;
    }

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Store original time
    const originalTime = video.currentTime;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      video.removeEventListener("canplay", onSeeked);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const onSeeked = () => {
      try {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Restore original time
        video.currentTime = originalTime;

        cleanup();

        resolve({
          timestamp,
          imageData,
          canvas,
        });
      } catch (error) {
        cleanup();
        reject(new Error("Failed to extract frame from video"));
      }
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to seek video"));
    };

    // Set up event listeners
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    // Set timeout to prevent hanging
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Frame extraction timeout"));
    }, 5000);

    // Seek to desired timestamp
    try {
      video.currentTime = timestamp;
    } catch (error) {
      cleanup();
      reject(new Error("Failed to set video currentTime"));
    }
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
  if (!duration || duration <= 0) {
    throw new Error("Video duration is invalid");
  }

  const interval = duration / (count + 1);
  const frames: VideoFrame[] = [];

  for (let i = 1; i <= count; i++) {
    const timestamp = interval * i;
    try {
      const frame = await extractFrameFromVideo(video, timestamp);
      frames.push(frame);
    } catch (error) {
      console.warn(`Failed to extract frame at ${timestamp}s:`, error);
      // Continue with other frames even if one fails
    }
  }

  return frames;
}

/**
 * Create video element with proper settings for frame extraction
 */
export function createVideoElement(): HTMLVideoElement {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.crossOrigin = "anonymous";
  video.muted = true; // Required for autoplay in some browsers
  return video;
}

/**
 * Wait for video to be ready for frame extraction
 */
export function waitForVideoReady(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    if (video.readyState >= 2) {
      resolve();
      return;
    }

    const onCanPlay = () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      resolve();
    };

    const onError = () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      reject(new Error("Video failed to load"));
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    // Set timeout
    setTimeout(() => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
      reject(new Error("Video load timeout"));
    }, 10000);
  });
}

/**
 * Get optimal timestamp for thumbnail (middle of video or at specific percentage)
 */
export function getOptimalThumbnailTimestamp(
  duration: number,
  percentage: number = 0.5
): number {
  return Math.max(0, Math.min(duration, duration * percentage));
}
