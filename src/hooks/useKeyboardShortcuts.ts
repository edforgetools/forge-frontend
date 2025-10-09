import { useEffect, useCallback } from "react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category: "general" | "overlay" | "crop" | "view" | "export";
}

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    selectedId,
    overlays,
    remove,
    updateOverlay,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    toggleGrid,
    toggleSafeZone,
    clearProject,
  } = useCanvasStore();

  const { toast } = useToast();

  // Check if we're in an input field
  const isInputFocused = useCallback(() => {
    const activeElement = document.activeElement;
    return (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement).contentEditable === "true")
    );
  }, []);

  // Shortcut definitions
  const shortcuts: KeyboardShortcut[] = [
    // General shortcuts
    {
      key: "z",
      ctrlKey: true,
      action: undo,
      description: "Undo last action",
      category: "general",
    },
    {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
      action: redo,
      description: "Redo last action",
      category: "general",
    },
    {
      key: "y",
      ctrlKey: true,
      action: redo,
      description: "Redo last action",
      category: "general",
    },
    {
      key: "s",
      ctrlKey: true,
      action: () => {
        toast({
          title: "Save",
          description: "Project saved automatically",
        });
      },
      description: "Save project",
      category: "general",
    },
    {
      key: "n",
      ctrlKey: true,
      action: clearProject,
      description: "New project",
      category: "general",
    },
    {
      key: "Escape",
      action: () => {
        useCanvasStore.getState().select(undefined);
      },
      description: "Deselect overlay",
      category: "general",
    },

    // Overlay shortcuts
    {
      key: "Delete",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            remove(selectedId);
            toast({
              title: "Overlay deleted",
              description: `${overlay.type} overlay removed`,
            });
          }
        }
      },
      description: "Delete selected overlay",
      category: "overlay",
    },
    {
      key: "Backspace",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            remove(selectedId);
            toast({
              title: "Overlay deleted",
              description: `${overlay.type} overlay removed`,
            });
          }
        }
      },
      description: "Delete selected overlay",
      category: "overlay",
    },
    {
      key: "ArrowUp",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 1;
            updateOverlay(selectedId, {
              y: overlay.y - nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay up",
      category: "overlay",
    },
    {
      key: "ArrowDown",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 1;
            updateOverlay(selectedId, {
              y: overlay.y + nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay down",
      category: "overlay",
    },
    {
      key: "ArrowLeft",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 1;
            updateOverlay(selectedId, {
              x: overlay.x - nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay left",
      category: "overlay",
    },
    {
      key: "ArrowRight",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 1;
            updateOverlay(selectedId, {
              x: overlay.x + nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay right",
      category: "overlay",
    },
    {
      key: "ArrowUp",
      shiftKey: true,
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 10;
            updateOverlay(selectedId, {
              y: overlay.y - nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay up (large)",
      category: "overlay",
    },
    {
      key: "ArrowDown",
      shiftKey: true,
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 10;
            updateOverlay(selectedId, {
              y: overlay.y + nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay down (large)",
      category: "overlay",
    },
    {
      key: "ArrowLeft",
      shiftKey: true,
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 10;
            updateOverlay(selectedId, {
              x: overlay.x - nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay left (large)",
      category: "overlay",
    },
    {
      key: "ArrowRight",
      shiftKey: true,
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            const nudgeAmount = 10;
            updateOverlay(selectedId, {
              x: overlay.x + nudgeAmount,
            });
          }
        }
      },
      description: "Nudge overlay right (large)",
      category: "overlay",
    },
    {
      key: "l",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            updateOverlay(selectedId, {
              locked: !overlay.locked,
            });
            toast({
              title: overlay.locked ? "Unlocked" : "Locked",
              description: `Overlay ${overlay.locked ? "unlocked" : "locked"}`,
            });
          }
        }
      },
      description: "Toggle overlay lock",
      category: "overlay",
    },
    {
      key: "h",
      action: () => {
        if (selectedId) {
          const overlay = overlays.find((o) => o.id === selectedId);
          if (overlay) {
            updateOverlay(selectedId, {
              hidden: !overlay.hidden,
            });
            toast({
              title: overlay.hidden ? "Shown" : "Hidden",
              description: `Overlay ${overlay.hidden ? "shown" : "hidden"}`,
            });
          }
        }
      },
      description: "Toggle overlay visibility",
      category: "overlay",
    },

    // View shortcuts
    {
      key: "=",
      ctrlKey: true,
      action: zoomIn,
      description: "Zoom in",
      category: "view",
    },
    {
      key: "+",
      ctrlKey: true,
      action: zoomIn,
      description: "Zoom in",
      category: "view",
    },
    {
      key: "-",
      ctrlKey: true,
      action: zoomOut,
      description: "Zoom out",
      category: "view",
    },
    {
      key: "0",
      ctrlKey: true,
      action: resetView,
      description: "Reset zoom",
      category: "view",
    },
    {
      key: "g",
      action: toggleGrid,
      description: "Toggle grid",
      category: "view",
    },
    {
      key: "s",
      action: toggleSafeZone,
      description: "Toggle safe zone",
      category: "view",
    },
    {
      key: "f",
      action: () => {
        setZoom(1);
        toast({
          title: "Fit to screen",
          description: "Canvas fitted to screen",
        });
      },
      description: "Fit to screen",
      category: "view",
    },

    // Panel shortcuts
    {
      key: "u",
      action: () => {
        // This would need to be implemented in the parent component
        toast({
          title: "Upload panel",
          description: "Switch to upload panel",
        });
      },
      description: "Switch to upload panel",
      category: "general",
    },
    {
      key: "c",
      action: () => {
        toast({
          title: "Crop panel",
          description: "Switch to crop panel",
        });
      },
      description: "Switch to crop panel",
      category: "general",
    },
    {
      key: "o",
      action: () => {
        toast({
          title: "Overlays panel",
          description: "Switch to overlays panel",
        });
      },
      description: "Switch to overlays panel",
      category: "general",
    },
    {
      key: "e",
      action: () => {
        toast({
          title: "Export panel",
          description: "Switch to export panel",
        });
      },
      description: "Switch to export panel",
      category: "general",
    },

    // Help shortcut
    {
      key: "?",
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "Press ? again to see all shortcuts",
        });
      },
      description: "Show shortcuts help",
      category: "general",
    },
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if we're in an input field
      if (isInputFocused()) {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();

        try {
          matchingShortcut.action();
        } catch (error) {
          console.error("Shortcut action failed:", error);
          toast({
            title: "Shortcut Error",
            description: "Failed to execute shortcut action",
            variant: "destructive",
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, isInputFocused, toast]);

  // Return shortcuts for display purposes
  return {
    shortcuts: shortcuts.reduce(
      (acc, shortcut) => {
        const category = shortcut.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(shortcut);
        return acc;
      },
      {} as Record<string, KeyboardShortcut[]>
    ),
    isInputFocused,
  };
}

export default useKeyboardShortcuts;
