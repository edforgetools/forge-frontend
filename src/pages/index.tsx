import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export default function Index() {
  return (
    <Layout>
      <Container>
        <div className="space-y-4 md:space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="typo-h1 font-semibold text-foreground">
              Create Perfect Thumbnails
            </h1>
            <p className="typo-body text-muted-foreground">
              Professional thumbnail generation with 9-grid positioning, drag
              controls, and live preview
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="primary">
              <Link to="/app">Launch Snapthumb</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/api">View API docs</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-card/50 border rounded-2xl p-4">
              <h3 className="font-medium mb-2">Controls</h3>
              <ul className="typo-caption text-muted-foreground space-y-1">
                <li>• Use 9-grid presets for quick positioning</li>
                <li>• Drag overlay to fine-tune position</li>
                <li>• Arrow keys: 1px movement</li>
                <li>• Shift + Arrow: 10px movement</li>
                <li>• Adjust scale, opacity, and padding</li>
              </ul>
            </div>
            <div className="bg-card/50 border rounded-2xl p-4">
              <h3 className="font-medium mb-2">Features</h3>
              <ul className="typo-caption text-muted-foreground space-y-1">
                <li>• Live canvas preview</li>
                <li>• URL state persistence</li>
                <li>• Touch device support</li>
                <li>• Background fit options</li>
                <li>• Quality presets for export</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
