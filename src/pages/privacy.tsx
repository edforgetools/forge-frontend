import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy • Forge";
  }, []);

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <Container>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Card className="privacy-page space-y-8 p-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Information We Collect
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Usage analytics (anonymous)
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Error reports
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No personal data
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No content storage
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                How We Use Information
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Improve Snapthumb
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Fix technical issues
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Keep the service reliable
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Data Processing</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                All processing happens locally in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                Third-Party Services
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Vercel Analytics (anonymous)
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Google Fonts
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  CDN for assets
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                Cookies & Local Storage
              </h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Preferences only (format, quality)
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No tracking cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Security</h2>
              <ul className="space-y-2 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Encrypted transport
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  No media uploads to our servers
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <p className="text-sm leading-relaxed">
                <a
                  href="mailto:privacy@forge.tools"
                  className="text-forge hover:underline"
                >
                  privacy@forge.tools
                </a>
              </p>
            </section>

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <Link
                to="/"
                className="underline hover:text-forge transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
