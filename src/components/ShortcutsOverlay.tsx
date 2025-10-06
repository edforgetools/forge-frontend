import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-description"
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

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">
                  {shortcut.action}
                </div>
                {shortcut.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {shortcut.description}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded shadow-sm">
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
