import { useRef, useCallback, useEffect, useReducer } from "react";
import { exportCanvasUnder2MB } from "@/lib/image";
import { compressCanvasWithSSIM } from "@/lib/compression";
import type { CompressionSettings } from "@/components/CompressionSelector";
import { sessionDB, SessionData } from "@/lib/db";
import { HistoryCommand } from "./useHistory";

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

export type CanvasAction =
  | { type: "SET_DIMENSIONS"; payload: { width: number; height: number } }
  | { type: "SET_SCALE"; payload: { scale: number } }
  | {
      type: "SET_SELECTED_AREA";
      payload: { selectedArea: CanvasState["selectedArea"] };
    }
  | { type: "SET_LOADING"; payload: { isLoading: boolean } }
  | { type: "SET_HAS_CONTENT"; payload: { hasContent: boolean } }
  | { type: "CLEAR_CANVAS" }
  | { type: "DRAW_IMAGE"; payload: { hasContent: boolean } }
  | { type: "RESTORE_STATE"; payload: Partial<CanvasState> };

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "SET_DIMENSIONS":
      return {
        ...state,
        width: action.payload.width,
        height: action.payload.height,
      };
    case "SET_SCALE":
      return { ...state, scale: action.payload.scale };
    case "SET_SELECTED_AREA":
      return { ...state, selectedArea: action.payload.selectedArea };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload.isLoading };
    case "SET_HAS_CONTENT":
      return { ...state, hasContent: action.payload.hasContent };
    case "CLEAR_CANVAS":
      return { ...state, hasContent: false };
    case "DRAW_IMAGE":
      return { ...state, hasContent: action.payload.hasContent };
    case "RESTORE_STATE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export interface CanvasActions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setDimensions: (width: number, height: number) => void;
  setScale: (scale: number) => void;
  setSelectedArea: (area: CanvasState["selectedArea"]) => void;
  clearCanvas: () => void;
  exportCanvas: (
    format?: "image/jpeg" | "image/webp" | "image/png",
    quality?: number,
    compressionSettings?: CompressionSettings
  ) => Promise<Blob>;
  drawImage: (
    image: HTMLImageElement,
    cropArea?: { x: number; y: number; width: number; height: number }
  ) => void;
  drawVideoFrame: (video: HTMLVideoElement, timestamp: number) => Promise<void>;
  getContext: () => CanvasRenderingContext2D | null;
  setLoading: (loading: boolean) => void;
  saveSession: () => Promise<void>;
  restoreSession: () => Promise<Partial<SessionData> | null>;
  applyHistoryCommand: (command: HistoryCommand) => void;
  createHistoryCommand: (
    type: string,
    data: any,
    description: string
  ) => HistoryCommand;
}

export function useCanvas(): [CanvasState, CanvasActions] {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, dispatch] = useReducer(canvasReducer, {
    width: 800,
    height: 450,
    scale: 1,
    selectedArea: null,
    hasContent: false,
    isLoading: false,
  });

  const setDimensions = useCallback((width: number, height: number) => {
    dispatch({ type: "SET_DIMENSIONS", payload: { width, height } });

    // Update canvas element dimensions
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }, []);

  const setScale = useCallback((scale: number) => {
    dispatch({ type: "SET_SCALE", payload: { scale } });
  }, []);

  const setSelectedArea = useCallback((area: CanvasState["selectedArea"]) => {
    dispatch({ type: "SET_SELECTED_AREA", payload: { selectedArea: area } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: { isLoading: loading } });
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
        dispatch({ type: "CLEAR_CANVAS" });
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

      dispatch({ type: "DRAW_IMAGE", payload: { hasContent: true } });
    },
    []
  );

  const drawVideoFrame = useCallback(
    async (video: HTMLVideoElement, timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      dispatch({ type: "SET_LOADING", payload: { isLoading: true } });

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

        dispatch({ type: "DRAW_IMAGE", payload: { hasContent: true } });
      } catch (error) {
        console.error("Failed to draw video frame:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: { isLoading: false } });
      }
    },
    []
  );

  const exportCanvas = useCallback(
    async (
      format: "image/jpeg" | "image/webp" | "image/png" = "image/jpeg",
      quality: number = 0.8,
      compressionSettings?: CompressionSettings
    ): Promise<Blob> => {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not available");
      }

      if (!state.hasContent) {
        throw new Error("Canvas has no content to export");
      }

      // Use advanced compression if settings are provided
      if (compressionSettings) {
        const result = await compressCanvasWithSSIM(canvas, {
          format,
          settings: compressionSettings,
          enableSSIM: true,
        });
        return result.blob;
      }

      // Fallback to legacy compression
      return exportCanvasUnder2MB(canvas, format, quality);
    },
    [state.hasContent]
  );

  const saveSession = useCallback(async () => {
    if (!sessionDB.isSessionRestoreEnabled()) return;

    const sessionData: Partial<SessionData> = {
      canvasDimensions: {
        width: state.width,
        height: state.height,
      },
      canvasScale: state.scale,
      selectedArea: state.selectedArea,
    };

    await sessionDB.saveSession(sessionData);
  }, [state.width, state.height, state.scale, state.selectedArea]);

  const restoreSession =
    useCallback(async (): Promise<Partial<SessionData> | null> => {
      if (!sessionDB.isSessionRestoreEnabled()) return null;

      const sessionData = await sessionDB.loadSession();
      if (!sessionData) return null;

      // Restore canvas dimensions
      if (sessionData.canvasDimensions) {
        setDimensions(
          sessionData.canvasDimensions.width,
          sessionData.canvasDimensions.height
        );
      }

      // Restore canvas scale
      if (sessionData.canvasScale !== undefined) {
        setScale(sessionData.canvasScale);
      }

      // Restore selected area
      if (sessionData.selectedArea !== undefined) {
        setSelectedArea(sessionData.selectedArea);
      }

      return sessionData;
    }, [setDimensions, setScale, setSelectedArea]);

  const applyHistoryCommand = useCallback((command: HistoryCommand) => {
    switch (command.type) {
      case "CANVAS_DIMENSIONS":
        dispatch({ type: "SET_DIMENSIONS", payload: command.data });
        break;
      case "CANVAS_SCALE":
        dispatch({ type: "SET_SCALE", payload: command.data });
        break;
      case "CANVAS_SELECTED_AREA":
        dispatch({ type: "SET_SELECTED_AREA", payload: command.data });
        break;
      case "CANVAS_CLEAR":
        dispatch({ type: "CLEAR_CANVAS" });
        break;
      case "CANVAS_DRAW_IMAGE":
        dispatch({ type: "DRAW_IMAGE", payload: command.data });
        break;
      case "CANVAS_RESTORE_STATE":
        dispatch({ type: "RESTORE_STATE", payload: command.data });
        break;
    }
  }, []);

  const createHistoryCommand = useCallback(
    (type: string, data: any, description: string): HistoryCommand => {
      return {
        id: `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        timestamp: Date.now(),
        data,
        description,
      };
    },
    []
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
    saveSession,
    restoreSession,
    applyHistoryCommand,
    createHistoryCommand,
  };

  return [state, actions];
}
