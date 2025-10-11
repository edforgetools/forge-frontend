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
        <h1 className="text-xl text-center">Snapthumb Help</h1>
        <section className="mt-6 space-y-6 text-sm leading-6">
          <div>
            <h2 className="text-base font-medium mb-3">Quick Start</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Upload an image or video file to get started</li>
              <li>If using video, pick the perfect frame to capture</li>
              <li>Add your logo or text overlay to the canvas</li>
              <li>Adjust position, size, and styling as needed</li>
              <li>Export your finished thumbnail image</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Supported Formats</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Input:</strong> MP4, WebM, JPG, PNG, WebP
              </li>
              <li>
                <strong>Output:</strong> JPG, PNG, WebP
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Limits</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free tier:</strong> 10 generations per day
              </li>
              <li>
                <strong>Export size:</strong> Optimized files under 2 MB
              </li>
            </ul>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-base font-medium mb-3">
              Keyboard shortcuts
            </summary>
            <div className="mt-2 max-h-64 overflow-auto">
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

          <div>
            <h2 className="text-base font-medium mb-3">Privacy</h2>
            <p className="mb-3">
              All processing happens locally in your browser. No files are
              uploaded to our servers.
            </p>
            <Link to="/privacy" className="underline">
              Read our full Privacy Policy
            </Link>
          </div>

          <div className="pt-4">
            <Link to="/" className="text-xs underline">
              ← Back to Editor
            </Link>
          </div>
        </section>
      </Container>
    </Page>
  );
}
