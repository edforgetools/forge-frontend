import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ApiPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, id)}
      className="ml-2"
    >
      {copiedCode === id ? "Copied!" : "Copy"}
    </Button>
  );

  const curlExample = `curl -X POST https://forge-layer.com/api/thumb \\
  -H "Content-Type: application/json" \\
  -d '{
    "source": "https://example.com/video.mp4",
    "timestamp": 5.2,
    "width": 1280,
    "height": 720
  }'`;

  const jsExample = `import { ForgeThumb } from '@forge-layer/thumb';

const thumb = new ForgeThumb({
  apiKey: 'your-api-key'
});

const result = await thumb.generate({
  source: 'https://example.com/video.mp4',
  timestamp: 5.2,
  width: 1280,
  height: 720
});

console.log(result.url);`;

  const pythonExample = `from forge_layer import ThumbGenerator

generator = ThumbGenerator(api_key="your-api-key")

result = generator.generate(
    source="https://example.com/video.mp4",
    timestamp=5.2,
    width=1280,
    height=720
)

print(result.url)`;

  return (
    <Page>
      <Container>
        <h1 className="text-xl text-center">API Documentation</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Generate thumbnails from videos and images using the Forge Layer API
        </p>

        <section className="mt-6 space-y-6">
          <div>
            <h2 className="text-base font-medium mb-3">Quick Start</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">REST API Endpoint</h3>
              <code className="text-sm bg-white p-2 rounded block">
                POST https://forge-layer.com/api/thumb
              </code>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Parameters</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <code className="font-mono">source</code>{" "}
                  <span className="text-muted-foreground">(required)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    URL to video or image file
                  </p>
                </div>
                <div>
                  <code className="font-mono">timestamp</code>{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Time in seconds for video frames
                  </p>
                </div>
                <div>
                  <code className="font-mono">width</code>{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Output width in pixels (default: source width)
                  </p>
                </div>
                <div>
                  <code className="font-mono">height</code>{" "}
                  <span className="text-muted-foreground">(optional)</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Output height in pixels (default: source height)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Examples</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  cURL
                  <CopyButton text={curlExample} id="curl" />
                </h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  <code>{curlExample}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  JavaScript/Node.js
                  <CopyButton text={jsExample} id="js" />
                </h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  <code>{jsExample}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center">
                  Python
                  <CopyButton text={pythonExample} id="python" />
                </h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Response</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
                <code>{`{
  "success": true,
  "url": "https://forge-layer.com/thumb/abc123.jpg",
  "width": 1280,
  "height": 720,
  "size": 245760
}`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-3">Rate Limits</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <ul className="space-y-1">
                <li>• Free tier: 10 generations per day</li>
                <li>• Pro tier: 1000 generations per day</li>
                <li>• Enterprise: Custom limits</li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/docs" className="text-xs underline">
              ← Product Help
            </Link>
          </div>
        </section>
      </Container>
    </Page>
  );
}
