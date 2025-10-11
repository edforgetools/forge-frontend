import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { env } from "@/env";

export default function Landing() {
  return (
    <Page>
      <Container>
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-xl">Forge Tools</h1>
            <p className="text-sm text-muted-foreground">
              Fast in-browser creative tools powered by Forge Layer
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="primary" className="w-full">
              <Link to="/app">Try Snapthumb</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/api">Use API</Link>
            </Button>
          </div>
          <footer className="flex justify-center gap-4 text-xs text-muted-foreground">
            <Button asChild variant="outline" className="text-xs">
              <Link to="/privacy">Privacy</Link>
            </Button>
            {env.VITE_CANONICAL_URL && (
              <Button asChild variant="outline" className="text-xs">
                <a
                  href={env.VITE_CANONICAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Project Canonical
                </a>
              </Button>
            )}
          </footer>
        </div>
      </Container>
    </Page>
  );
}
