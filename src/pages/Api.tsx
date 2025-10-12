import { Button } from "@/components/ui/Button";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_LAYER_BASE_URL ||
  "http://localhost:3000";

export default function ApiPage() {
  useEffect(() => {
    document.title = "API • Forge";
  }, []);

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

  return (
    <Layout>
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              API Documentation
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate thumbnails using Forge Layer.
            </p>
          </div>

          {/* Sticky Endpoint Card */}
          <Card className="sticky top-20 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold mb-1">REST endpoint</h2>
                <code className="text-sm text-muted-foreground font-mono">
                  POST {`${BASE}/api/thumb`}
                </code>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigator.clipboard.writeText(`${BASE}/api/thumb`)
                }
              >
                Copy
              </Button>
            </div>
          </Card>

          <Card className="space-y-6">
            <section>
              <h2 className="font-semibold mb-3">Parameters</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <dt className="font-medium">
                    source <span className="text-red-600">(required)</span>
                  </dt>
                  <dd className="text-muted-foreground">URL to image/video</dd>
                </div>
                <div>
                  <dt className="font-medium">timestamp</dt>
                  <dd className="text-muted-foreground">
                    Seconds from start (video)
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">width</dt>
                  <dd className="text-muted-foreground">Output width (px)</dd>
                </div>
                <div>
                  <dt className="font-medium">height</dt>
                  <dd className="text-muted-foreground">Output height (px)</dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Examples</h2>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <div className="relative">
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre">
                        {curlExample}
                      </pre>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(curlExample)}
                    >
                      Copy
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="node" className="mt-4">
                  <div className="relative">
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre">
                        {nodeExample}
                      </pre>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => navigator.clipboard.writeText(nodeExample)}
                    >
                      Copy
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <div className="relative">
                    <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm font-mono whitespace-pre">
                        {pythonExample}
                      </pre>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        navigator.clipboard.writeText(pythonExample)
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Response</h2>
              <div className="code bg-muted/50">
                <pre className="whitespace-pre">
                  {`{ "success": true, "url": "https://…/thumb/abc123.jpg", "width": 1280, "height": 720, "size": 245760 }`}
                </pre>
              </div>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Rate limits</h2>
              <ul className="lists text-sm text-muted-foreground">
                <li>Free: 10 generations/day</li>
                <li>Pro: key-enabled, fair use</li>
                <li>Reset: daily at 00:00 UTC</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold mb-3">Privacy</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                UI processing is local. API calls send only your provided source
                URL and transform options to the Forge Layer service; no uploads
                are stored.
              </p>
            </section>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
