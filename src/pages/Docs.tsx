import { Button } from "@/components/ui/button";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DocsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

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
        <h1 className="text-xl mb-6">Documentation</h1>

        <div className="flex flex-col gap-6">
          {/* Quick Start */}
          <section id="quick-start">
            <h2 className="text-base mb-3">Quick Start</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-sm">Upload Media</h3>
                  <p className="text-sm text-gray-600">
                    Click upload area or press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                      U
                    </kbd>{" "}
                    to select video (MP4, WebM) or image (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-sm">Frame Selection</h3>
                  <p className="text-sm text-gray-600">
                    For videos, scrub timeline to find perfect frame, then press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                      F
                    </kbd>{" "}
                    to capture it
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-sm">Crop & Resize</h3>
                  <p className="text-sm text-gray-600">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                      C
                    </kbd>{" "}
                    to toggle 16:9 crop overlay and position perfectly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-sm">Add Overlays</h3>
                  <p className="text-sm text-gray-600">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                      T
                    </kbd>{" "}
                    for text or drag & drop logo overlays. Use arrow keys to
                    fine-tune positioning
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  5
                </div>
                <div>
                  <h3 className="font-medium text-sm">Export</h3>
                  <p className="text-sm text-gray-600">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                      E
                    </kbd>{" "}
                    to open export options. Choose format and quality -
                    automatically optimizes to stay under 2MB
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limits */}
          <section id="limits">
            <h2 className="text-base mb-3">Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-sm">File Size Limits</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    <strong>Free Tier:</strong> 10MB max file size
                  </li>
                  <li>
                    <strong>Pro Tier:</strong> 50MB max file size
                  </li>
                  <li>
                    <strong>Export Limit:</strong> Automatic optimization to
                    stay under 2MB
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-sm">Rate Limits</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>
                    <strong>Free Tier:</strong> 10 generations per day
                  </li>
                  <li>
                    <strong>Pro Tier:</strong> Unlimited generations
                  </li>
                  <li>
                    <strong>Reset:</strong> Daily at midnight UTC
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-sm">Supported Formats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1 text-sm">Input</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>MP4, WebM (video)</li>
                    <li>JPG, PNG, WebP (image)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">Output</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>JPG, PNG, WebP</li>
                    <li>Up to 4K resolution</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">Aspect Ratio</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>16:9 (YouTube standard)</li>
                    <li>Auto-crop available</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-sm">Processing</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Client-side only</li>
                    <li>No server uploads</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy">
            <h2 className="text-base mb-3">Privacy</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-sm">Local Processing</h3>
                  <p className="text-sm text-gray-600">
                    All processing happens in your browser. Your files never
                    leave your device.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-sm">No Data Collection</h3>
                  <p className="text-sm text-gray-600">
                    We don't collect personal information or store your content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium text-sm">Anonymous Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Only anonymous usage statistics to improve the service.
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate("/privacy")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Read Privacy Policy
            </Button>
          </section>

          {/* Shortcuts */}
          <section id="shortcuts">
            <h2 className="text-base mb-3">Shortcuts</h2>
            <details className="mt-3">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Keyboard Shortcuts
              </summary>
              <div className="max-h-64 overflow-y-auto mt-3 flex flex-col gap-3">
                {shortcuts.map((category) => (
                  <div key={category.category} className="flex flex-col gap-2">
                    <h3 className="text-base font-medium text-gray-700">
                      {category.category}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {category.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span>{item.description}</span>
                          <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono font-semibold bg-gray-100 border border-gray-300 rounded text-gray-700 ml-2">
                            {item.key}
                          </kbd>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </Container>
    </Page>
  );
}
