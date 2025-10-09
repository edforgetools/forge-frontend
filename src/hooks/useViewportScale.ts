import { useEffect, useRef, useCallback, useState } from "react";
import { useCanvasStore } from "@/state/canvasStore";

export interface ViewportScale {
  scale: number;
  containerWidth: number;
  containerHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  offsetX: number;
  offsetY: number;
  letterboxTop: number;
  letterboxBottom: number;
  letterboxLeft: number;
  letterboxRight: number;
}

export interface ViewportScaleOptions {
  targetAspectRatio: number; // 16/9, 1/1, 9/16
  zoom: number;
  minZoom?: number; // Default: 0.5 (50%)
  maxZoom?: number; // Default: 2 (200%)
}

const ZOOM_PRESETS = [0.5, 0.75, 1, 1.5, 2] as const;

export function useViewportScale(
  containerRef: React.RefObject<HTMLElement | null>,
  options: ViewportScaleOptions
) {
  const { setZoom, zoomIn, zoomOut } = useCanvasStore();
  const [viewportScale, setViewportScale] = useState<ViewportScale>({
    scale: 1,
    containerWidth: 0,
    containerHeight: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    offsetX: 0,
    offsetY: 0,
    letterboxTop: 0,
    letterboxBottom: 0,
    letterboxLeft: 0,
    letterboxRight: 0,
  });

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const calculateViewportScale = useCallback((): ViewportScale => {
    const container = containerRef.current;
    if (!container) {
      return {
        scale: 1,
        containerWidth: 0,
        containerHeight: 0,
        canvasWidth: 0,
        canvasHeight: 0,
        offsetX: 0,
        offsetY: 0,
        letterboxTop: 0,
        letterboxBottom: 0,
        letterboxLeft: 0,
        letterboxRight: 0,
      };
    }

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Apply zoom with 50%-200% limits
    const zoom = Math.max(
      options.minZoom || 0.5,
      Math.min(options.maxZoom || 2, options.zoom)
    );

    // Calculate the natural canvas size that fits the container with letterboxing
    const containerAspectRatio = containerWidth / containerHeight;
    const targetAspectRatio = options.targetAspectRatio;

    let baseCanvasWidth: number;
    let baseCanvasHeight: number;

    // Calculate base canvas size (at 100% zoom) that fits within container
    if (containerAspectRatio > targetAspectRatio) {
      // Container is wider than target aspect ratio - fit to height
      baseCanvasHeight = containerHeight;
      baseCanvasWidth = baseCanvasHeight * targetAspectRatio;
    } else {
      // Container is taller than target aspect ratio - fit to width
      baseCanvasWidth = containerWidth;
      baseCanvasHeight = baseCanvasWidth / targetAspectRatio;
    }

    // Apply zoom to get final scaled dimensions
    const scaledCanvasWidth = baseCanvasWidth * zoom;
    const scaledCanvasHeight = baseCanvasHeight * zoom;

    // Calculate offsets to center the scaled canvas within container
    // Ensure the scaled canvas doesn't exceed container bounds
    const offsetX = Math.max(0, (containerWidth - scaledCanvasWidth) / 2);
    const offsetY = Math.max(0, (containerHeight - scaledCanvasHeight) / 2);

    // Calculate letterbox dimensions (areas outside the canvas)
    const letterboxTop = Math.max(0, offsetY);
    const letterboxBottom = Math.max(
      0,
      containerHeight - offsetY - scaledCanvasHeight
    );
    const letterboxLeft = Math.max(0, offsetX);
    const letterboxRight = Math.max(
      0,
      containerWidth - offsetX - scaledCanvasWidth
    );

    // Calculate the scale factor for 1:1 CSS pixel mapping
    const scale = zoom;

    return {
      scale,
      containerWidth,
      containerHeight,
      canvasWidth: scaledCanvasWidth,
      canvasHeight: scaledCanvasHeight,
      offsetX,
      offsetY,
      letterboxTop,
      letterboxBottom,
      letterboxLeft,
      letterboxRight,
    };
  }, [containerRef, options]);

  // Set up ResizeObserver with debouncing for better performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to avoid excessive calculations
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newScale = calculateViewportScale();
        setViewportScale(newScale);
      }, 16); // ~60fps debouncing
    };

    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(container);

    // Initial calculation with a slight delay to ensure container is fully rendered
    const initialTimeoutId = setTimeout(() => {
      const initialScale = calculateViewportScale();
      setViewportScale(initialScale);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeoutId);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [calculateViewportScale]);

  // Update scale when zoom changes
  useEffect(() => {
    const newScale = calculateViewportScale();
    setViewportScale(newScale);
  }, [calculateViewportScale]);

  // Force recalculation when container ref changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Small delay to ensure container is fully mounted
      const timeoutId = setTimeout(() => {
        const newScale = calculateViewportScale();
        setViewportScale(newScale);
      }, 10);

      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [containerRef.current, calculateViewportScale]);

  // Zoom preset functions
  const setZoomPreset = useCallback(
    (preset: number) => {
      setZoom(preset);
    },
    [setZoom]
  );

  const zoomToFit = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  const zoomToFill = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const containerAspectRatio = containerWidth / containerHeight;
    const targetAspectRatio = options.targetAspectRatio;

    // Calculate zoom to fill the container
    let zoom: number;
    if (containerAspectRatio > targetAspectRatio) {
      // Fill width
      zoom = containerWidth / (containerHeight * targetAspectRatio);
    } else {
      // Fill height
      zoom = containerHeight / (containerWidth / targetAspectRatio);
    }

    setZoom(
      Math.max(options.minZoom || 0.5, Math.min(options.maxZoom || 2, zoom))
    );
  }, [containerRef, options, setZoom]);

  // Keyboard shortcut handlers
  const handleKeyboardZoom = useCallback(
    (event: KeyboardEvent) => {
      const isZoomIn = event.key === "+" || event.key === "=";
      const isZoomOut = event.key === "-";

      if ((isZoomIn || isZoomOut) && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();

        if (isZoomIn) {
          zoomIn();
        } else if (isZoomOut) {
          zoomOut();
        }
      }
    },
    [zoomIn, zoomOut]
  );

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboardZoom);
    return () => {
      document.removeEventListener("keydown", handleKeyboardZoom);
    };
  }, [handleKeyboardZoom]);

  return {
    viewportScale,
    setZoomPreset,
    zoomToFit,
    zoomToFill,
    zoomIn,
    zoomOut,
    ZOOM_PRESETS,
  };
}
