import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ShortcutsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsSheet({ isOpen, onClose }: ShortcutsSheetProps) {
  const shortcuts = [
    {
      category: "General",
      items: [
        { key: "⌘/Ctrl + S", description: "Export" },
        { key: "⌘/Ctrl + Z", description: "Undo" },
        { key: "⌘/Ctrl + Shift + Z", description: "Redo" },
        { key: "Delete", description: "Remove selected overlay" },
        { key: "?", description: "Show this help" },
        { key: "Escape", description: "Close dialogs" },
      ],
    },
    {
      category: "Panels",
      items: [
        { key: "U", description: "Upload panel" },
        { key: "C", description: "Crop panel" },
        { key: "O", description: "Overlays panel" },
        { key: "E", description: "Export panel" },
      ],
    },
    {
      category: "Overlay Movement",
      items: [
        { key: "Arrow Keys", description: "Nudge 1px" },
        { key: "Shift + Arrow Keys", description: "Nudge 10px" },
        { key: "Double-click", description: "Edit text inline" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Keyboard Shortcuts
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm text-gray-700">
                      {item.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Click and drag overlays to move them</li>
              <li>• Use the overlay panel to adjust properties</li>
              <li>• Double-click text overlays to edit inline</li>
              <li>• All shortcuts work when the canvas is focused</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
