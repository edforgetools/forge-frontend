import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  useCanvasStore,
  TextOverlay as TextOverlayType,
  LogoOverlay,
} from "@/state/canvasStore";

interface LayerHostProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  className?: string;
}

export function LayerHost({
  children,
  onDragStart,
  onDragEnd,
  className = "",
}: LayerHostProps) {
  const layerHostRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  const { overlays, selectedId, select, updateOverlay } = useCanvasStore();

  // Handle mouse down for layer selection and drag initiation
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      // Check if we're clicking on a layer element
      const layerElement = target.closest("[data-layer-id]");
      if (!layerElement) {
        // Clicked on empty space, deselect
        select(undefined);
        return;
      }

      const layerId = layerElement.getAttribute("data-layer-id");
      if (!layerId) return;

      // Select the layer
      select(layerId);

      // Check if layer is locked
      const overlay = overlays.find((o) => o.id === layerId);
      if (overlay?.locked) {
        return;
      }

      // Initialize drag state
      setIsDragging(true);
      setDraggedLayerId(layerId);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      onDragStart?.();

      // Prevent text selection during drag
      e.preventDefault();
    },
    [overlays, select, onDragStart]
  );

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !draggedLayerId) return;

      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;

      const overlay = overlays.find((o) => o.id === draggedLayerId);
      if (overlay && !overlay.locked) {
        updateOverlay(draggedLayerId, {
          x: overlay.x + deltaX,
          y: overlay.y + deltaY,
        });

        // Update drag start position for smooth movement
        setDragStartPos({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, draggedLayerId, dragStartPos, overlays, updateOverlay]
  );

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedLayerId(null);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  // Handle mouse leave to end dragging
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedLayerId(null);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

  // Add global mouse up listener to handle dragging outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggedLayerId(null);
        onDragEnd?.();
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mouseleave", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, [isDragging, onDragEnd]);

  // Clone children and inject layer-specific props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if this is a layer component by looking for overlay prop
      const childProps = child.props as {
        overlay?: TextOverlayType | LogoOverlay;
        style?: React.CSSProperties;
        className?: string;
      };
      const overlay = childProps?.overlay;

      if (overlay && (overlay.type === "text" || overlay.type === "logo")) {
        const isSelected = selectedId === overlay.id;
        const isBeingDragged = draggedLayerId === overlay.id;
        const currentStyle = childProps.style || {};

        return React.cloneElement(
          child as React.ReactElement<Record<string, unknown>>,
          {
            ...childProps,
            "data-layer-id": overlay.id,
            style: {
              ...currentStyle,
              zIndex: isSelected ? 1000 : overlay.z,
              pointerEvents: isSelected ? "auto" : "auto",
              outline: isSelected ? "2px solid #3b82f6" : "none",
              outlineOffset: isSelected ? "2px" : "0px",
              cursor: isBeingDragged
                ? "grabbing"
                : isSelected
                ? "grab"
                : "pointer",
              userSelect: isBeingDragged ? "none" : "auto",
            },
            className: `${childProps.className || ""} ${
              isSelected ? "layer-selected" : ""
            } ${isBeingDragged ? "layer-dragging" : ""}`.trim(),
          }
        );
      }
    }
    return child;
  });

  return (
    <div
      ref={layerHostRef}
      className={`layer-host ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        userSelect: isDragging ? "none" : "auto",
      }}
      data-dragging={isDragging}
    >
      {enhancedChildren}
    </div>
  );
}

// Hook to get layer selection state
export function useLayerSelection() {
  const { selectedId, overlays, select, bringToFront, sendToBack } =
    useCanvasStore();

  const selectedOverlay = selectedId
    ? overlays.find((o) => o.id === selectedId)
    : undefined;

  const selectLayer = useCallback(
    (id: string) => {
      select(id);
    },
    [select]
  );

  const deselectLayer = useCallback(() => {
    select(undefined);
  }, [select]);

  const bringLayerToFront = useCallback(
    (id: string) => {
      bringToFront(id);
    },
    [bringToFront]
  );

  const sendLayerToBack = useCallback(
    (id: string) => {
      sendToBack(id);
    },
    [sendToBack]
  );

  return {
    selectedId,
    selectedOverlay,
    selectLayer,
    deselectLayer,
    bringLayerToFront,
    sendLayerToBack,
  };
}

// Utility function to check if a point is within a layer bounds
export function isPointInLayer(
  point: { x: number; y: number },
  overlay: TextOverlayType | LogoOverlay
): boolean {
  const centerX = overlay.x + overlay.w / 2;
  const centerY = overlay.y + overlay.h / 2;

  // Simple rectangular bounds check (doesn't account for rotation)
  return (
    point.x >= centerX - overlay.w / 2 &&
    point.x <= centerX + overlay.w / 2 &&
    point.y >= centerY - overlay.h / 2 &&
    point.y <= centerY + overlay.h / 2
  );
}

// Utility function to find the topmost layer at a given point
export function getTopmostLayerAtPoint(
  point: { x: number; y: number },
  overlays: (TextOverlayType | LogoOverlay)[]
): (TextOverlayType | LogoOverlay) | undefined {
  // Sort by z-index descending to get topmost first
  const sortedOverlays = [...overlays]
    .filter((overlay) => !overlay.hidden)
    .sort((a, b) => b.z - a.z);

  return sortedOverlays.find((overlay) => isPointInLayer(point, overlay));
}
