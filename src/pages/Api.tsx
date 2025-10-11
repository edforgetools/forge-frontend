import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_LAYER_BASE_URL || "http://localhost:3000";

export default function ApiPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">(
    "curl"
  );
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "API • Forge";
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const CopyButton = ({ text, copyKey }: { text: string; copyKey: string }) => (
    <div className="flex flex-col items-end">
      <Button
        variant="outline"
        onClick={() => copyToClipboard(text, copyKey)}
        className="ml-auto"
      >
        Copy
      </Button>
      {copiedStates[copyKey] && (
        <span className="text-xs text-muted-foreground mt-1">Copied</span>
      )}
    </div>
  );

  const curlExample = `curl -X POST ${BASE}/api/thumb \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "https://example.com/video.mp4",
    "timestamp": 5.2,
    "width": 1280,
    "height": 720
  }'`;

  const nodeExample = `const response = await fetch('${BASE}/api/thumb', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source: 'https://example.com/video.mp4',
    timestamp: 5.2,
    width: 1280,
    height: 720
  })
});

const result = await response.json();
console.log(result.url);`;

  const pythonExample = `import requests

response = requests.post('${BASE}/api/thumb', json={
    'source': 'https://example.com/video.mp4',
    'timestamp': 5.2,
    'width': 1280,
    'height': 720
})

result = response.json()
print(result['url'])`;

  const getCurrentExample = () => {
    switch (activeTab) {
      case "curl":
        return curlExample;
      case "node":
        return nodeExample;
      case "python":
        return pythonExample;
      default:
        return curlExample;
    }
  };

  return (
    <Container className="max-w-[720px]">
      <h1 className="text-center text-2xl font-bold mb-2">API Documentation</h1>
      <p className="text-center text-muted-foreground mb-8">
        Generate thumbnails using Forge Layer.
      </p>

      <Card className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">REST endpoint</h2>
          <div className="bg-muted p-3 rounded border">
            <code className="text-sm font-mono">POST {BASE}/api/thumb</code>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Parameters</h2>
          <dl className="space-y-3">
            <div>
              <dt className="font-medium text-sm">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  source
                </code>
                <span className="text-muted-foreground ml-2">(required)</span>
              </dt>
              <dd className="text-sm text-muted-foreground ml-0 mt-1">
                URL to video or image file
              </dd>
            </div>
            <div>
              <dt className="font-medium text-sm">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  timestamp
                </code>
                <span className="text-muted-foreground ml-2">(optional)</span>
              </dt>
              <dd className="text-sm text-muted-foreground ml-0 mt-1">
                Time in seconds for video frames
              </dd>
            </div>
            <div>
              <dt className="font-medium text-sm">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  width
                </code>
                <span className="text-muted-foreground ml-2">(optional)</span>
              </dt>
              <dd className="text-sm text-muted-foreground ml-0 mt-1">
                Output width in pixels
              </dd>
            </div>
            <div>
              <dt className="font-medium text-sm">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  height
                </code>
                <span className="text-muted-foreground ml-2">(optional)</span>
              </dt>
              <dd className="text-sm text-muted-foreground ml-0 mt-1">
                Output height in pixels
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Examples</h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="flex border-b bg-muted/50">
              <Button
                variant={activeTab === "curl" ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveTab("curl")}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-none border-r-0 ${
                  activeTab === "curl"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                cURL
              </Button>
              <Button
                variant={activeTab === "node" ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveTab("node")}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-none border-r-0 ${
                  activeTab === "node"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Node.js
              </Button>
              <Button
                variant={activeTab === "python" ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveTab("python")}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-none ${
                  activeTab === "python"
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Python
              </Button>
            </div>
            <div className="relative">
              <pre className="rounded border p-3 overflow-auto max-h-80">
                <code>{getCurrentExample()}</code>
              </pre>
              <CopyButton
                text={getCurrentExample()}
                copyKey={`example-${activeTab}`}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Response</h2>
          <div className="relative">
            <pre className="rounded border p-3 overflow-auto max-h-80 bg-muted">
              <code>{`{
  "success": true,
  "url": "${BASE}/thumb/abc123.jpg",
  "width": 1280,
  "height": 720,
  "size": 245760
}`}</code>
            </pre>
            <CopyButton
              text={`{
  "success": true,
  "url": "${BASE}/thumb/abc123.jpg",
  "width": 1280,
  "height": 720,
  "size": 245760
}`}
              copyKey="response"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Rate limits</h2>
          <ul className="space-y-2 text-sm">
            <li>Free: 10/day</li>
            <li>Pro: unlimited* if key</li>
            <li>Reset: daily UTC</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            *subject to fair use
          </p>
        </div>
      </Card>
    </Container>
  );
}
