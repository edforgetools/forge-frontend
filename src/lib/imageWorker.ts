/**
 * Web Worker for image processing operations
 * Handles heavy image operations without blocking the main thread
 */

export interface WorkerMessage {
  id: string;
  type: "resize" | "crop" | "compress" | "extract-frame" | "apply-filter";
  data: unknown;
}

export interface WorkerResponse {
  id: string;
  type: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ResizeOperation {
  imageData: ImageData;
  width: number;
  height: number;
  quality?: number;
}

export interface CropOperation {
  imageData: ImageData;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CompressOperation {
  imageData: ImageData;
  format: "image/jpeg" | "image/webp" | "image/png";
  quality: number;
  maxSizeBytes: number;
}

export interface ExtractFrameOperation {
  videoElement: OffscreenCanvas;
  timestamp: number;
}

export interface FilterOperation {
  imageData: ImageData;
  filter:
    | "blur"
    | "sharpen"
    | "grayscale"
    | "sepia"
    | "brightness"
    | "contrast";
  intensity: number;
}

class ImageWorker {
  private worker: Worker | null = null;
  private messageHandlers = new Map<
    string,
    (response: WorkerResponse) => void
  >();
  private messageId = 0;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    if (typeof Worker !== "undefined") {
      // Create worker from inline code
      const workerCode = `
        // Image processing functions
        function resizeImage(imageData, width, height, quality = 0.8) {
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          return canvas.transferToImageBitmap();
        }
        
        function cropImage(imageData, x, y, width, height) {
          const canvas = new OffscreenCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          ctx.putImageData(imageData, -x, -y);
          
          return canvas.transferToImageBitmap();
        }
        
        function compressImage(imageData, format, quality, maxSizeBytes) {
          const canvas = new OffscreenCanvas(imageData.width, imageData.height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          return new Promise((resolve) => {
            canvas.convertToBlob({ type: format, quality }).then(blob => {
              resolve({
                blob,
                size: blob.size,
                format,
                quality
              });
            });
          });
        }
        
        function applyFilter(imageData, filter, intensity) {
          const canvas = new OffscreenCanvas(imageData.width, imageData.height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          switch (filter) {
            case 'blur':
              ctx.filter = \`blur(\${intensity}px)\`;
              break;
            case 'sharpen':
              ctx.filter = \`contrast(\${intensity})\`;
              break;
            case 'grayscale':
              ctx.filter = 'grayscale(100%)';
              break;
            case 'sepia':
              ctx.filter = 'sepia(100%)';
              break;
            case 'brightness':
              ctx.filter = \`brightness(\${intensity})\`;
              break;
            case 'contrast':
              ctx.filter = \`contrast(\${intensity})\`;
              break;
          }
          
          const newImageData = ctx.getImageData(0, 0, imageData.width, imageData.height);
          return newImageData;
        }
        
        // Message handler
        self.onmessage = async function(e) {
          const { id, type, data } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'resize':
                result = resizeImage(data.imageData, data.width, data.height, data.quality);
                break;
              case 'crop':
                result = cropImage(data.imageData, data.x, data.y, data.width, data.height);
                break;
              case 'compress':
                result = await compressImage(data.imageData, data.format, data.quality, data.maxSizeBytes);
                break;
              case 'apply-filter':
                result = applyFilter(data.imageData, data.filter, data.intensity);
                break;
              default:
                throw new Error(\`Unknown operation type: \${type}\`);
            }
            
            self.postMessage({
              id,
              type,
              success: true,
              data: result
            });
          } catch (error) {
            self.postMessage({
              id,
              type,
              success: false,
              error: error.message
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e) => {
        const response = e.data as WorkerResponse;
        const handler = this.messageHandlers.get(response.id);

        if (handler) {
          handler(response);
          this.messageHandlers.delete(response.id);
        }
      };

      this.worker.onerror = (error) => {
        console.error("Image worker error:", error);
        // Reject all pending operations
        this.messageHandlers.forEach((handler) => {
          handler({
            id: "",
            type: "",
            success: false,
            error: "Worker error occurred",
          });
        });
        this.messageHandlers.clear();
      };
    }
  }

  private generateMessageId(): string {
    return `msg_${++this.messageId}_${Date.now()}`;
  }

  private sendMessage(
    message: Omit<WorkerMessage, "id">
  ): Promise<WorkerResponse> {
    if (!this.worker) {
      return Promise.reject(
        new Error("Web Worker not supported or failed to initialize")
      );
    }

    const id = this.generateMessageId();
    const fullMessage: WorkerMessage = { ...message, id };

    return new Promise((resolve, reject) => {
      this.messageHandlers.set(id, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Unknown worker error"));
        }
      });

      this.worker!.postMessage(fullMessage);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.messageHandlers.has(id)) {
          this.messageHandlers.delete(id);
          reject(new Error("Worker operation timeout"));
        }
      }, 30000);
    });
  }

  /**
   * Resize image data
   */
  async resizeImage(
    imageData: ImageData,
    width: number,
    height: number,
    quality = 0.8
  ): Promise<ImageBitmap> {
    const response = await this.sendMessage({
      type: "resize",
      data: { imageData, width, height, quality },
    });
    return response.data as ImageBitmap;
  }

  /**
   * Crop image data
   */
  async cropImage(
    imageData: ImageData,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<ImageBitmap> {
    const response = await this.sendMessage({
      type: "crop",
      data: { imageData, x, y, width, height },
    });
    return response.data as ImageBitmap;
  }

  /**
   * Compress image data
   */
  async compressImage(
    imageData: ImageData,
    format: "image/jpeg" | "image/webp" | "image/png",
    quality: number,
    maxSizeBytes: number
  ): Promise<{ blob: Blob; size: number; format: string; quality: number }> {
    const response = await this.sendMessage({
      type: "compress",
      data: { imageData, format, quality, maxSizeBytes },
    });
    return response.data as {
      blob: Blob;
      size: number;
      format: string;
      quality: number;
    };
  }

  /**
   * Apply filter to image data
   */
  async applyFilter(
    imageData: ImageData,
    filter:
      | "blur"
      | "sharpen"
      | "grayscale"
      | "sepia"
      | "brightness"
      | "contrast",
    intensity: number
  ): Promise<ImageData> {
    const response = await this.sendMessage({
      type: "apply-filter",
      data: { imageData, filter, intensity },
    });
    return response.data as ImageData;
  }

  /**
   * Terminate the worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.messageHandlers.clear();
    }
  }

  /**
   * Check if worker is available
   */
  isAvailable(): boolean {
    return this.worker !== null;
  }
}

// Singleton instance
export const imageWorker = new ImageWorker();

/**
 * Utility functions for working with the image worker
 */
export const ImageWorkerUtils = {
  /**
   * Convert canvas to ImageData
   */
  canvasToImageData(canvas: HTMLCanvasElement): ImageData {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  },

  /**
   * Convert ImageBitmap to ImageData
   */
  async imageBitmapToImageData(imageBitmap: ImageBitmap): Promise<ImageData> {
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.drawImage(imageBitmap, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  },

  /**
   * Convert ImageData to canvas
   */
  imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },

  /**
   * Check if web workers are supported
   */
  isSupported(): boolean {
    return typeof Worker !== "undefined" && imageWorker.isAvailable();
  },
};
