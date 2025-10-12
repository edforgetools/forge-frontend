import Page from "@/components/layout/Page";
import Container from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function DocsPage() {
  useEffect(() => {
    document.title = "Snapthumb Help • Forge";
  }, []);
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
    <Page>
      <Container>
        <h1 className="text-center mb-6">Snapthumb Help</h1>

        <Card className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
            <ul className="space-y-2">
              <li>• Upload an image or video file to get started</li>
              <li>• For videos, pick the frame you want to use</li>
              <li>• Add text or logo overlays to your image</li>
              <li>• Adjust position, size, and styling</li>
              <li>• Export your finished thumbnail</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Supported Formats</h2>
            <ul className="space-y-1">
              <li>Input: MP4, WebM, JPG, PNG, WebP</li>
              <li>Output: JPG, PNG, WebP</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Limits</h2>
            <ul className="space-y-1">
              <li>Free tier: 10 generations per day</li>
              <li>Export size: Optimized files under 2 MB</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Privacy Note</h2>
            <p>
              All processing happens locally in your browser.{" "}
              <Link to="/privacy" className="underline">
                Read our full Privacy Policy
              </Link>
            </p>
          </div>

          <details>
            <summary className="cursor-pointer text-lg font-medium">
              Keyboard shortcuts
            </summary>
            <div className="mt-2 max-h-64 overflow-y-auto text-sm leading-6">
              <div className="space-y-4">
                {shortcuts.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium">{category.category}</h4>
                    <ul className="mt-1 space-y-1">
                      {category.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.description}</span>
                          <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                            {item.key}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </Card>
      </Container>
    </Page>
  );
}
