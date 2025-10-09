import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  action: string;
  key: string;
  description?: string;
}

const shortcuts: ShortcutItem[] = [
  { action: "Upload", key: "U", description: "Upload a new image or video" },
  { action: "Capture", key: "F", description: "Capture frame from video" },
  { action: "Crop", key: "C", description: "Toggle crop overlay" },
  { action: "Move", key: "V", description: "Move/pan the canvas" },
  { action: "Text", key: "T", description: "Add text overlay" },
  { action: "Undo", key: "⌘Z", description: "Undo last action" },
  { action: "Redo", key: "⌘⇧Z", description: "Redo last undone action" },
  { action: "Export", key: "E", description: "Export the current canvas" },
  { action: "Toggle Restore", key: "R", description: "Toggle session restore" },
];

const ShortcutsOverlay = React.memo(function ShortcutsOverlay({
  isOpen,
  onClose,
}: ShortcutsOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Focus trap - only allow Tab navigation within dialog
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus the first focusable element when dialog opens
    const dialog = dialogRef.current;
    if (dialog) {
      const firstFocusable = dialog.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previously focused element
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Proper overlay with click-through guard */}
      <DialogOverlay
        className="fixed inset-0 z-dialog bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <DialogContent
        ref={dialogRef}
        className="max-w-md pointer-events-auto"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-description"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle id="shortcuts-title" className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription
            id="shortcuts-description"
            className="text-gray-700"
          >
            Use these keyboard shortcuts to quickly access features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                <div className="font-medium text-sm text-gray-900 break-words">
                  {shortcut.action}
                </div>
                {shortcut.description && (
                  <div className="text-xs text-gray-600 mt-1 break-words">
                    {shortcut.description}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <kbd className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-semibold bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 whitespace-nowrap">
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
            aria-label="Close shortcuts overlay"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ShortcutsOverlay;
