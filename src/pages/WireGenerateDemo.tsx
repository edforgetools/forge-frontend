/**
 * Wire Generate Demo Page
 * Demonstrates the Wire Generate functionality with mock data
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Page from "@/components/layout/Page";
import Container from "@/components/layout/Container";
import { WireGenerate } from "@/components/WireGenerate";
import { useCanvasStore } from "@/state/canvasStore";
// import { useSnapthumbStore } from "@/lib/snapthumb-state";

export default function WireGenerateDemo() {
  const navigate = useNavigate();
  const [demoResults, setDemoResults] = useState<unknown[]>([]);

  const handleBack = () => {
    navigate("/");
  };

  const loadDemoData = () => {
    // Load some demo canvas data
    const canvasStore = useCanvasStore.getState();

    // Set demo image (placeholder)
    canvasStore.setImage(new Image());

    // Add some demo overlays
    canvasStore.addOverlay({
      type: "text",
      text: "Demo Text Overlay",
      font: "Arial",
      size: 24,
      weight: 600,
      letter: 0,
      shadow: true,
      align: "center",
      color: "#ffffff",
      x: 100,
      y: 100,
      w: 200,
      h: 50,
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 100,
    } as any);

    canvasStore.addOverlay({
      type: "text",
      text: "Another Overlay",
      font: "Arial",
      size: 18,
      weight: 400,
      letter: 0,
      shadow: false,
      align: "left",
      color: "#ff0000",
      x: 300,
      y: 200,
      w: 150,
      h: 40,
      rot: 0,
      locked: false,
      hidden: false,
      opacity: 80,
    } as any);
  };

  const handleResult = (result: unknown) => {
    setDemoResults((prev) => [...prev, result]);
  };

  return (
    <Page>
      <Container>
        <Card className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              Wire Generate Demo
            </h1>
          </div>

          {/* Demo Controls */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Demo Setup</h2>
            <p className="text-sm text-gray-600 mb-4">
              Load demo data to test the Wire Generate functionality
            </p>
            <Button onClick={loadDemoData}>Load Demo Canvas Data</Button>
          </div>

          {/* Wire Generate Component */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Wire Generate</h2>
            <WireGenerate onResult={handleResult} />
          </div>

          {/* Results Display */}
          {demoResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Generation Results</h2>
              <p className="text-sm text-gray-600 mb-4">
                Results from wire generation attempts
              </p>
              <div className="space-y-4">
                {demoResults.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-2">
                      Generation #{index + 1}
                    </h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features List */}
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Wire Generate Features
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This implementation includes all the requested features
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">
                  ✅ Implemented Features:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Serialize inputs to layer schema</li>
                  <li>• POST via API client with retry/backoff</li>
                  <li>• Show progress bar and disable controls</li>
                  <li>• Preview result with download button</li>
                  <li>• Copy URL functionality</li>
                  <li>• Caching for identical inputs</li>
                  <li>• "Cached" badge for instant responses</li>
                  <li>• Error handling with toast notifications</li>
                  <li>• Non-blocking fallback</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">
                  🔧 Technical Details:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Exponential backoff with jitter</li>
                  <li>• Input hash-based caching</li>
                  <li>• Mock API for development</li>
                  <li>• TypeScript type safety</li>
                  <li>• Responsive design</li>
                  <li>• Accessibility features</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </Page>
  );
}
