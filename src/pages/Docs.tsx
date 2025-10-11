import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Link } from "react-router-dom";

export default function DocsPage() {
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
        <h1 className="text-xl text-center">Documentation</h1>
        <section className="mt-6 space-y-4 text-sm leading-6">
          <div>
            <h2 className="text-base font-medium">Quick Start</h2>
            <ol className="mt-2 list-decimal pl-5 space-y-1">
              <li>Upload image or video</li>
              <li>Pick frame (if video)</li>
              <li>Add logo overlay</li>
              <li>Adjust position and size</li>
              <li>Export thumbnail</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Supported Formats</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Input: MP4, WebM, JPG, PNG, WebP</li>
                <li>Output: JPG, PNG, WebP</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Limits</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Free: 10 gens/day</li>
                <li>Export: optimized ≤ 2 MB</li>
              </ul>
            </div>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer">Keyboard shortcuts</summary>
            <div className="mt-2 max-h-64 overflow-y-auto">
              <div className="space-y-4">
                {shortcuts.map((category) => (
                  <div key={category.category}>
                    <h4 className="font-medium">{category.category}</h4>
                    <ul className="mt-1 space-y-1 text-sm">
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
          <p className="text-xs text-muted-foreground">
            Privacy: local processing, no uploads.
          </p>
          <div className="pt-2">
            <Link to="/privacy" className="underline">
              Read Privacy Policy
            </Link>
          </div>
          <div className="pt-4">
            <Link to="/" className="text-xs underline">
              ← Back
            </Link>
          </div>
        </section>
      </Container>
    </Page>
  );
}
