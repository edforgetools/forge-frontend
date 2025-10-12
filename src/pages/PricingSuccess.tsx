import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/env";
import { copyWithFeedback } from "@/lib/copy-to-clipboard";

interface ApiKeyResponse {
  key: string;
  plan: string;
}

export default function PricingSuccess() {
  const [searchParams] = useSearchParams();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchApiKey = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const layerUrl = env.VITE_FORGE_LAYER_URL || "/api";
        const response = await fetch(
          `${layerUrl}/billing/key?session_id=${sessionId}`
        );

        if (response.ok) {
          const data: ApiKeyResponse = await response.json();
          setApiKey(data.key);
          setPlan(data.plan);

          // Send telemetry ping for API key reveal
          try {
            const { sendLayerUIEvent } = await import("@/lib/telemetry-api");
            await sendLayerUIEvent("api_key_revealed", {
              plan: data.plan,
            });
          } catch (telemetryError) {
            // Don't block UX if telemetry fails
            console.warn("Telemetry ping failed:", telemetryError);
          }
        } else {
          setError("Failed to retrieve API key");
        }
      } catch (err) {
        setError("Error fetching API key");
        console.error("API key fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [sessionId]);

  const handleCopyKey = async (text: string) => {
    await copyWithFeedback(
      text,
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        console.error("Failed to copy API key");
      }
    );
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-8)}` : "";

  if (loading) {
    return (
      <Layout>
        <Container>
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forge mx-auto"></div>
            <p className="text-muted-foreground">Retrieving your API key...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Error</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button asChild variant="primary">
              <a href="/pricing">Return to Pricing</a>
            </Button>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold">Welcome to {plan}!</h1>
            <p className="text-lg text-muted-foreground">
              Your subscription is now active. Here's your API key:
            </p>
          </div>

          {/* API Key Card */}
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Your API Key</h2>
              <p className="text-sm text-muted-foreground">
                Keep this key secure and don't share it publicly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <code className="font-mono text-sm">{maskedKey}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => apiKey && handleCopyKey(apiKey)}
                  className="ml-3"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Click "Copy" to copy the full key to your clipboard
              </div>
            </div>
          </Card>

          {/* Usage Instructions */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">How to use your API key</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Environment Variable</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm">FORGE_API_KEY={apiKey}</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">SDK Usage</h4>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {`import { ForgeClient } from '@forge/sdk';

const client = new ForgeClient({
  apiKey: '${apiKey}'
});`}
                  </pre>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">What's next?</h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary">
                <a href="/api">View API Documentation</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/app">Launch App</a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
