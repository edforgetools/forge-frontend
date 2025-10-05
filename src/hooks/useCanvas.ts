import { useState, useRef, useCallback } from "react";

interface CanvasState {
  width: number;
  height: number;
  scale: number;
  selectedArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

interface CanvasActions {
  setDimensions: (width: number, height: number) => void;
  setScale: (scale: number) => void;
  setSelectedArea: (area: CanvasState["selectedArea"]) => void;
  clearCanvas: () => void;
  exportCanvas: () => Promise<Blob>;
}

export function useCanvas(): [CanvasState, CanvasActions] {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, setState] = useState<CanvasState>({
    width: 800,
    height: 450,
    scale: 1,
    selectedArea: null,
  });

  const setDimensions = useCallback((width: number, height: number) => {
    setState((prev) => ({ ...prev, width, height }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({ ...prev, scale }));
  }, []);

  const setSelectedArea = useCallback((area: CanvasState["selectedArea"]) => {
    setState((prev) => ({ ...prev, selectedArea: area }));
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const exportCanvas = useCallback(async (): Promise<Blob> => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error("Canvas not available");
    }

    // TODO: Implement actual canvas export
    // TODO: Ensure file size is under 2MB
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        "image/jpeg",
        0.8
      );
    });
  }, []);

  const actions: CanvasActions = {
    setDimensions,
    setScale,
    setSelectedArea,
    clearCanvas,
    exportCanvas,
  };

  return [state, actions];
}
