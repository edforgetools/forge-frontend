import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ShortcutsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsSheet({ isOpen, onClose }: ShortcutsSheetProps) {
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

  const shortcuts = [
    {
      category: "Canvas",
      items: [
        { key: "U", description: "Upload new image or video" },
        { key: "F", description: "Capture frame from video" },
        { key: "C", description: "Toggle crop overlay" },
        { key: "V", description: "Move/pan the canvas" },
        { key: "T", description: "Add text overlay" },
        { key: "⌘/Ctrl + Z", description: "Undo last action" },
        { key: "⌘/Ctrl + Shift + Z", description: "Redo last undone action" },
      ],
    },
    {
      category: "Layers",
      items: [
        { key: "O", description: "Open overlays panel" },
        { key: "Delete", description: "Remove selected overlay" },
        { key: "Arrow Keys", description: "Nudge overlay 1px" },
        { key: "Shift + Arrow Keys", description: "Nudge overlay 10px" },
        { key: "Double-click", description: "Edit text overlay inline" },
      ],
    },
    {
      category: "Export",
      items: [
        { key: "E", description: "Open export panel" },
        { key: "⌘/Ctrl + S", description: "Quick export" },
        { key: "R", description: "Toggle session restore" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { key: "?", description: "Show this help" },
        { key: "Escape", description: "Close dialogs" },
        { key: "Tab", description: "Focus next element" },
        { key: "Shift + Tab", description: "Focus previous element" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal container={document.getElementById("portal-root")}>
        {/* Proper overlay with click-through guard */}
        <DialogOverlay
          className="fixed inset-0 z-sheet bg-black/20 backdrop-blur-[1px] pointer-events-auto"
          onClick={onClose}
        />
        <DialogContent
          ref={dialogRef}
          className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-50/95 backdrop-blur-sm border-neutral-200 fixed left-[50%] top-[50%] z-dialog translate-x-[-50%] translate-y-[-50%] pointer-events-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <DialogHeader className="pb-4">
            <DialogTitle
              id="shortcuts-title"
              className="flex items-center gap-3 text-xl font-semibold text-slate-800"
            >
              <Keyboard className="h-6 w-6 text-slate-600" />
              Keyboard Shortcuts
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
                className="ml-auto h-8 w-8 p-0 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {shortcuts.map((category) => (
              <div key={category.category} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700 border-b border-neutral-200 pb-2">
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-neutral-200/50 hover:bg-white/90 transition-colors"
                    >
                      <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                        <span className="text-sm font-medium text-slate-700 break-words">
                          {item.description}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <kbd className="inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-semibold bg-slate-100 border border-neutral-200 rounded-full shadow-sm text-slate-700 whitespace-nowrap">
                          {item.key}
                        </kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="bg-slate-100/50 rounded-lg p-4">
              <div className="text-sm text-slate-600">
                <p className="font-semibold mb-3 text-slate-700">💡 Tips</p>
                <ul className="space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>
                      Click and drag overlays to move them around the canvas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>
                      Use the overlays panel to adjust properties and styling
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>All shortcuts work when the canvas is focused</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>
                      Press{" "}
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-neutral-200 rounded text-slate-600">
                        ?
                      </kbd>{" "}
                      anytime to show this help
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
