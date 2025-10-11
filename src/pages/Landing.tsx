import { Link } from "react-router-dom";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <Page>
      <Container>
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-xl font-medium text-center">Forge Tools</h1>
            <p className="text-center text-sm text-muted-foreground">
              Fast in-browser creative tools powered by Forge Layer
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="primary">
              <Link to="/app">
                Try Snapthumb
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/docs">
                Use API
              </a>
            </Button>
          </div>
          <footer className="flex justify-center gap-4 text-xs text-muted-foreground">
            <a href="/privacy">Privacy</a>
            <a
              href="https://github.com/forge-tools/forge-layer/docs/canonical.md"
              target="_blank"
              rel="noreferrer"
            >
              Canonical Doc
            </a>
          </footer>
        </div>
      </Container>
    </Page>
  );
}
