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
    <Container>
      <h1 className="text-center">Snapthumb Help</h1>
      
      <section>
        <h2 className="text-base font-medium">Quick Start</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Upload an image or video file to get started</li>
          <li>If using video, pick the perfect frame to capture</li>
          <li>Add your logo or text overlay to the canvas</li>
          <li>Adjust position, size, and styling as needed</li>
          <li>Export your finished thumbnail image</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium">Supported Formats</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Input: MP4, WebM, JPG, PNG, WebP</li>
          <li>Output: JPG, PNG, WebP</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-medium">Limits</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Free tier: 10 generations per day</li>
          <li>Export size: Optimized files under 2 MB</li>
        </ul>
      </section>

      <details className="mt-2">
        <summary className="cursor-pointer">Keyboard shortcuts</summary>
        <div className="mt-2 max-h-64 overflow-y-auto text-sm">
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

      <section>
        <h2 className="text-base font-medium">Privacy note</h2>
        <p className="text-sm">
          All processing happens locally in your browser.{" "}
          <Link to="/privacy" className="underline">Read our full Privacy Policy</Link>
        </p>
      </section>
    </Container>
  );
}
