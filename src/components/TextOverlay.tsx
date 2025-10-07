import React, { useRef, useEffect, useState, useCallback } from "react";
import { TextOverlay as TextOverlayType } from "@/state/canvasStore";
import { TextToolbar } from "./TextToolbar";

interface TextOverlayProps {
  overlay: TextOverlayType;
  isSelected: boolean;
  onUpdate: (updates: Partial<TextOverlayType>) => void;
  onSelect: () => void;
}

export function TextOverlay({
  overlay,
  isSelected,
  onUpdate,
  onSelect,
}: TextOverlayProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Update content when overlay text changes externally
  useEffect(() => {
    if (
      contentEditableRef.current &&
      contentEditableRef.current.textContent !== overlay.text
    ) {
      contentEditableRef.current.textContent = overlay.text;
    }
  }, [overlay.text]);

  // Show toolbar when selected
  useEffect(() => {
    setShowToolbar(isSelected);
  }, [isSelected]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setShowToolbar(true);

    // Focus and select text for editing
    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(contentEditableRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);

    // Update text content
    if (contentEditableRef.current) {
      const newText = contentEditableRef.current.textContent || "";
      if (newText !== overlay.text) {
        onUpdate({ text: newText });
      }
    }
  }, [overlay.text, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        contentEditableRef.current?.blur();
      }
      if (e.key === "Escape") {
        // Revert to original text
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = overlay.text;
        }
        contentEditableRef.current?.blur();
      }
    },
    [overlay.text]
  );

  const handleInput = useCallback(() => {
    // Auto-resize based on content
    if (contentEditableRef.current) {
      const element = contentEditableRef.current;
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;

      // Update overlay height if needed
      const newHeight = element.scrollHeight;
      if (newHeight !== overlay.h) {
        onUpdate({ h: newHeight });
      }
    }
  }, [overlay.h, onUpdate]);

  const getTextStyle = (): React.CSSProperties => {
    return {
      fontFamily: overlay.font,
      fontSize: `${overlay.size}px`,
      fontWeight: overlay.weight,
      color: overlay.color,
      textAlign: overlay.align as any,
      textShadow: overlay.shadow ? "1px 1px 2px rgba(0, 0, 0, 0.5)" : "none",
      lineHeight: "1.2",
      minHeight: "1em",
      width: "100%",
      height: "auto",
      outline: "none",
      border: "none",
      background: "transparent",
      resize: "none",
      overflow: "hidden",
    };
  };

  const getContainerStyle = (): React.CSSProperties => {
    return {
      position: "absolute",
      left: `${overlay.x}px`,
      top: `${overlay.y}px`,
      width: `${overlay.w}px`,
      height: `${overlay.h}px`,
      transform: `rotate(${overlay.rot}deg)`,
      opacity: overlay.opacity,
      cursor: isEditing ? "text" : "move",
      userSelect: isEditing ? "text" : "none",
    };
  };

  return (
    <>
      <div
        style={getContainerStyle()}
        onClick={onSelect}
        onDoubleClick={handleDoubleClick}
        className={`${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${
          isEditing ? "cursor-text" : "cursor-move"
        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        tabIndex={0}
        role="textbox"
        aria-label={`Text overlay: ${overlay.text}`}
        aria-describedby={`text-overlay-${overlay.id}-description`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
          if (e.key === "Delete" || e.key === "Backspace") {
            e.preventDefault();
            // Handle deletion through parent component
          }
        }}
      >
        <div
          ref={contentEditableRef}
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          style={getTextStyle()}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          className={`${isEditing ? "outline-none" : ""}`}
          data-testid="text-overlay-content"
          aria-label="Editable text content"
          role={isEditing ? "textbox" : "none"}
          aria-multiline="true"
        >
          {overlay.text}
        </div>
        <div id={`text-overlay-${overlay.id}-description`} className="sr-only">
          Text overlay at position {Math.round(overlay.x)},{" "}
          {Math.round(overlay.y)}.{overlay.locked ? "Locked. " : ""}
          {overlay.hidden ? "Hidden. " : ""}
          {isEditing
            ? "Currently editing. "
            : "Press Enter to select or double-click to edit."}
        </div>
      </div>

      {showToolbar && (
        <TextToolbar
          overlayId={overlay.id}
          onClose={() => setShowToolbar(false)}
        />
      )}
    </>
  );
}
