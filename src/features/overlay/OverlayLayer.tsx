import React, { useState, useRef } from "react";
import { Overlay } from "./overlayTypes";
import { useEditorStore } from "@/lib/store";

export function OverlayLayer({ overlay }: { overlay: Overlay }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const moveOverlay = useEditorStore((s) => s.moveOverlay);
  const resizeOverlay = useEditorStore((s) => s.resizeOverlay);
  const setSelection = useEditorStore((s) => s.setSelection);
  const selection = useEditorStore((s) => s.selection);
  const isSelected = selection === overlay.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelection(overlay.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - overlay.x,
      y: e.clientY - overlay.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      moveOverlay(overlay.id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: overlay.w,
      h: overlay.h,
    });
  };

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newW = Math.max(20, resizeStart.w + deltaX);
      const newH = Math.max(20, resizeStart.h + deltaY);
      resizeOverlay(overlay.id, newW, newH);
    }
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
  };

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = isDragging
        ? handleMouseMove
        : handleResizeMouseMove;
      const handleGlobalMouseUp = isDragging
        ? handleMouseUp
        : handleResizeMouseUp;

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    overlay.id,
    overlay.x,
    overlay.y,
    overlay.w,
    overlay.h,
  ]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        left: overlay.x,
        top: overlay.y,
        width: overlay.w,
        height: overlay.h,
        opacity: overlay.opacity,
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : "grab",
        border: isSelected ? "2px solid #3b82f6" : "2px solid transparent",
        borderRadius: "4px",
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={overlay.dataUrl}
        alt={overlay.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />

      {/* Resize handle */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 12,
            height: 12,
            backgroundColor: "#3b82f6",
            border: "2px solid white",
            borderRadius: "50%",
            cursor: "nw-resize",
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
}
