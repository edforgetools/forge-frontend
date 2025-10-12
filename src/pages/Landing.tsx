import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <Layout>
      <Container>
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Create Perfect Thumbnails
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional thumbnail generation with 9-grid positioning, drag
              controls, and live preview
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="primary" className="h-10 px-6">
              <Link to="/app">Launch Snapthumb</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 px-6">
              <Link to="/api">API docs</Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-forge/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-forge"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Quick Positioning</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                9-grid presets and drag controls for precise overlay placement
              </p>
            </div>
            <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-forge/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-forge"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real-time canvas preview with URL state persistence
              </p>
            </div>
            <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-forge/10 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-forge"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Export Ready</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quality presets and touch device support for all workflows
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
