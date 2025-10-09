import React from "react";
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

interface ShortcutsDialogProps {
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
  { action: "Overlays Panel", key: "O", description: "Open overlays panel" },
  {
    action: "Delete Overlay",
    key: "Delete",
    description: "Remove selected overlay",
  },
  { action: "Help", key: "?", description: "Show this shortcuts dialog" },
];

const ShortcutsDialog = React.memo(function ShortcutsDialog({
  isOpen,
  onClose,
}: ShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 z-[var(--z-dialog)] bg-black/40 backdrop-blur-sm" />
      <DialogContent className="fixed inset-x-4 top-16 bottom-6 overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-gray-700">
            Use these keyboard shortcuts to quickly access features
          </DialogDescription>
        </DialogHeader>

        {/* Responsive grid layout with table-like structure */}
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
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default ShortcutsDialog;
