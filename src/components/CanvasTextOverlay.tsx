import React, { useState, useRef, useEffect } from "react";
import {
  useCanvasStore,
  TextOverlay as TextOverlayType,
} from "@/state/canvasStore";
import { TextToolbar } from "./TextToolbar";

interface CanvasTextOverlayProps {
  overlay: TextOverlayType;
}

export function CanvasTextOverlay({ overlay }: CanvasTextOverlayProps) {
  const { selectedId, updateOverlay, select } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedId === overlay.id;

  // Handle double-click to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle click to select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    select(overlay.id);
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (overlay.locked) return;

    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - overlay.x,
      y: e.clientY - overlay.y,
    });
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || overlay.locked) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Snap to grid (optional - can be enabled/disabled)
    const snapToGrid = true;
    const gridSize = 10;

    const snappedX = snapToGrid ? Math.round(newX / gridSize) * gridSize : newX;
    const snappedY = snapToGrid ? Math.round(newY / gridSize) * gridSize : newY;

    updateOverlay(overlay.id, {
      x: Math.max(0, snappedX),
      y: Math.max(0, snappedY),
    });
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle text change
  // const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
  //   const newText = e.currentTarget.textContent || "";
  //   updateOverlay(overlay.id, { text: newText });
  // };

  // Handle blur to finish editing
  const handleBlur = () => {
    setIsEditing(false);
  };

  // Handle key down for editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      // Select all text for easy replacement
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Calculate text dimensions for proper positioning
  const textStyle: React.CSSProperties = {
    position: "absolute",
    left: overlay.x,
    top: overlay.y,
    width: overlay.w,
    height: overlay.h,
    fontFamily: overlay.font,
    fontSize: `${overlay.size}px`,
    fontWeight: overlay.weight,
    color: overlay.color,
    textAlign: overlay.align as "left" | "center" | "right",
    letterSpacing: `${overlay.letter}px`,
    opacity: overlay.opacity,
    transform: `rotate(${overlay.rot}deg)`,
    transformOrigin: "center center",
    cursor: isDragging ? "grabbing" : isSelected ? "grab" : "pointer",
    userSelect: isEditing ? "text" : "none",
    outline: isSelected ? "2px solid #3b82f6" : "none",
    outlineOffset: isSelected ? "2px" : "0px",
    zIndex: isSelected ? 1000 : overlay.z,
    display: overlay.hidden ? "none" : "block",
    wordWrap: "break-word",
    overflow: "hidden",
    textShadow: overlay.shadow ? "2px 2px 4px rgba(0,0,0,0.5)" : "none",
  };

  return (
    <>
      <div
        ref={textRef}
        data-layer-id={overlay.id}
        style={textStyle}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        role="textbox"
        aria-label={`Text overlay: ${overlay.text}`}
        tabIndex={isSelected ? 0 : -1}
      >
        {overlay.text}
      </div>

      {/* Text Toolbar - Only show when selected and not editing */}
      {isSelected && !isEditing && (
        <TextToolbar overlayId={overlay.id} onClose={() => select(undefined)} />
      )}
    </>
  );
}
