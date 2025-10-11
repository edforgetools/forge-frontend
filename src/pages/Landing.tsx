import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/LinkButton";

export default function Landing() {
  return (
    <Page>
      <Container>
        <h1 className="text-xl text-center">Forge Tools</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Fast in-browser creative tools powered by Forge Layer
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <LinkButton to="/app" variant="primary">
            Try Snapthumb
          </LinkButton>
          <LinkButton to="/api" variant="outline">
            Use API
          </LinkButton>
        </div>
        <footer className="mt-8 flex justify-center gap-4 text-xs text-muted-foreground">
          <LinkButton to="/privacy" variant="link" className="text-xs">
            Privacy
          </LinkButton>
          <LinkButton
            href="https://forge-layer.com/docs/canonical.md"
            variant="link"
            className="text-xs"
          >
            Canonical
          </LinkButton>
        </footer>
      </Container>
    </Page>
  );
}
