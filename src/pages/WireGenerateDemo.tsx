/**
 * Wire Generate Demo Page
 * Demonstrates the Wire Generate functionality with mock data
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Wire Generate Demo
          </h1>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Setup</CardTitle>
            <CardDescription>
              Load demo data to test the Wire Generate functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadDemoData}>Load Demo Canvas Data</Button>
          </CardContent>
        </Card>

        {/* Wire Generate Component */}
        <WireGenerate onResult={handleResult} />

        {/* Results Display */}
        {demoResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generation Results</CardTitle>
              <CardDescription>
                Results from wire generation attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Wire Generate Features</CardTitle>
            <CardDescription>
              This implementation includes all the requested features
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
