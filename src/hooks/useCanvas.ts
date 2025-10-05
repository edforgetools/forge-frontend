import { useState, useRef, useCallback, useEffect } from "react";
import { exportCanvasUnder2MB } from "@/lib/image";

export interface CanvasState {
  width: number;
  height: number;
  scale: number;
  selectedArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  hasContent: boolean;
  isLoading: boolean;
}

export interface CanvasActions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setDimensions: (width: number, height: number) => void;
  setScale: (scale: number) => void;
  setSelectedArea: (area: CanvasState["selectedArea"]) => void;
  clearCanvas: () => void;
  exportCanvas: (
    format?: "image/jpeg" | "image/webp" | "image/png",
    quality?: number
  ) => Promise<Blob>;
  drawImage: (
    image: HTMLImageElement,
    cropArea?: { x: number; y: number; width: number; height: number }
  ) => void;
  drawVideoFrame: (video: HTMLVideoElement, timestamp: number) => Promise<void>;
  getContext: () => CanvasRenderingContext2D | null;
  setLoading: (loading: boolean) => void;
}

export function useCanvas(): [CanvasState, CanvasActions] {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<CanvasState>({
    width: 800,
    height: 450,
    scale: 1,
    selectedArea: null,
    hasContent: false,
    isLoading: false,
  });

  const setDimensions = useCallback((width: number, height: number) => {
    setState((prev) => ({ ...prev, width, height }));

    // Update canvas element dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, scale }));
  }, []);

  const setSelectedArea = useCallback((area: CanvasState["selectedArea"]) => {
    setState((prev) => ({ ...prev, selectedArea: area }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  }, []);

  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    return canvasRef.current?.getContext("2d") || null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setState((prev) => ({ ...prev, hasContent: false }));
      }
    }
  }, []);

  const drawImage = useCallback(
    (
      image: HTMLImageElement,
      cropArea?: { x: number; y: number; width: number; height: number }
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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
        const aspectRatio = image.width / image.height;
        const canvasAspectRatio = canvas.width / canvas.height;

        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let x = 0;
        let y = 0;

        if (aspectRatio > canvasAspectRatio) {
          // Image is wider than canvas
          drawHeight = canvas.width / aspectRatio;
          y = (canvas.height - drawHeight) / 2;
        } else {
          // Image is taller than canvas
          drawWidth = canvas.height * aspectRatio;
          x = (canvas.width - drawWidth) / 2;
        }

        ctx.drawImage(image, x, y, drawWidth, drawHeight);
      }

      setState((prev) => ({ ...prev, hasContent: true }));
    },
    []
  );

  const drawVideoFrame = useCallback(
    async (video: HTMLVideoElement, timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setLoading(true);

      try {
        // Store original time
        const originalTime = video.currentTime;

        // Seek to timestamp
        video.currentTime = timestamp;

        // Wait for seek to complete
        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onError);
            resolve();
          };

          const onError = () => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onError);
            reject(new Error("Failed to seek video"));
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onError);
        });

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Restore original time
        video.currentTime = originalTime;

        setState((prev) => ({ ...prev, hasContent: true }));
      } catch (error) {
        console.error("Failed to draw video frame:", error);
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const exportCanvas = useCallback(
    async (
      format: "image/jpeg" | "image/webp" | "image/png" = "image/jpeg",
      quality: number = 0.8
    ): Promise<Blob> => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not available");
      }

      if (!state.hasContent) {
        throw new Error("Canvas has no content to export");
      }

      return exportCanvasUnder2MB(canvas, format, quality);
    },
    [state.hasContent]
  );

  // Initialize canvas dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = state.width;
      canvas.height = state.height;
    }
  }, [state.width, state.height]);

  const actions: CanvasActions = {
    canvasRef,
    setDimensions,
    setScale,
    setSelectedArea,
    clearCanvas,
    exportCanvas,
    drawImage,
    drawVideoFrame,
    getContext,
    setLoading,
  };

  return [state, actions];
}
