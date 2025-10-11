import { Link } from "react-router-dom";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <Page>
      <Container>
        <h1 className="text-xl text-center">Forge Tools</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Fast in-browser creative tools powered by Forge Layer
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link to="/app" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              Try Snapthumb
            </Button>
          </Link>
          <Link to="/docs" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              Use API
            </Button>
          </Link>
        </div>
        <footer className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy">Privacy</Link>
          <a href="/docs" className="underline">
            Canonical Doc
          </a>
        </footer>
      </Container>
    </Page>
  );
}
