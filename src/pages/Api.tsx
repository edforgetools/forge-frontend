import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_LAYER_BASE_URL || "http://localhost:3000";

export default function ApiPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python">(
    "curl"
  );
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Code example copied successfully",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text }: { text: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text)}
      className="ml-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      tabIndex={0}
    >
      Copy
    </Button>
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
    <Page>
      <Container>
        <h1 className="text-center text-xl font-bold mb-4">
          API Documentation
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Generate thumbnails using Forge Layer.
        </p>

        <section className="space-y-8">
          <div>
            <h2 className="text-base font-semibold mb-4">REST Endpoint</h2>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm font-mono">POST {BASE}/api/thumb</code>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-4">Parameters</h2>
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
            <h2 className="text-base font-semibold mb-4">Examples</h2>
            <div className="border rounded-lg overflow-hidden">
              <div className="flex border-b bg-muted/50">
                <Button
                  variant={activeTab === "curl" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("curl")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "python"
                      ? "bg-background text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Python
                </Button>
                <CopyButton text={getCurrentExample()} />
              </div>
              <div className="p-3">
                <pre className="rounded-lg border p-3 overflow-auto max-h-80">
                  <code>{getCurrentExample()}</code>
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-4">Response</h2>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-80">
                <code>{`{
  "success": true,
  "url": "${BASE}/thumb/abc123.jpg",
  "width": 1280,
  "height": 720,
  "size": 245760
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold mb-4">Rate Limits</h2>
            <ul className="space-y-2 text-sm">
              <li>Free tier: 10 generations per day</li>
              <li>Pro tier: 1000 generations per day</li>
              <li>Enterprise: Custom limits</li>
            </ul>
          </div>
        </section>
      </Container>
    </Page>
  );
}
