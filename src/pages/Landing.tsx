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
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
            <Button asChild>
              <Link to="/app">Try Snapthumb</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/api">Use API</Link>
            </Button>
          </div>
          <footer className="flex justify-center gap-4">
            <Link to="/privacy" className="text-xs underline">Privacy</Link>
            {import.meta.env.VITE_CANONICAL_URL && (
              <a 
                href={import.meta.env.VITE_CANONICAL_URL} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs underline"
              >
                Project Canonical
              </a>
            )}
          </footer>
        </div>
      </Container>
    </Page>
  );
}
