import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/LinkButton";
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
            <LinkButton to="/app" variant="primary" className="w-full">
              Try Snapthumb
            </LinkButton>
            <LinkButton to="/api" variant="outline" className="w-full">
              Use API
            </LinkButton>
          </div>
          <footer className="flex justify-center gap-4 text-xs text-muted-foreground">
            <LinkButton to="/privacy" variant="link" className="text-xs">
              Privacy
            </LinkButton>
            {env.VITE_CANONICAL_URL && (
              <LinkButton
                href={env.VITE_CANONICAL_URL}
                variant="link"
                className="text-xs"
              >
                Project Canonical
              </LinkButton>
            )}
          </footer>
        </div>
      </Container>
    </Page>
  );
}
