import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <Page>
      <Container>
        <h1 className="text-xl text-center">Forge Tools</h1>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Fast in-browser creative tools powered by Forge Layer.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="primary">
            <Link to="/app">Try Snapthumb</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/api">Use the API</Link>
          </Button>
        </div>
        <div className="mt-8 flex justify-center gap-6 text-xs text-neutral-600">
          <Link to="/privacy" className="underline">
            Privacy
          </Link>
          {import.meta.env.VITE_CANONICAL_URL && (
            <a
              className="underline"
              href={import.meta.env.VITE_CANONICAL_URL}
              target="_blank"
              rel="noreferrer"
            >
              Project Canonical
            </a>
          )}
        </div>
      </Container>
    </Page>
  );
}
