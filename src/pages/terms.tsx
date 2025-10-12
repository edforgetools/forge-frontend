import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <Card className="space-y-8 p-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                By accessing and using Snapthumb ("the Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                2. Description of Service
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Snapthumb is a web-based application that allows users to create
                thumbnails from videos and images. The service provides tools
                for cropping, editing, and exporting images in various formats.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                3. User Responsibilities
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You are responsible for ensuring that any content you upload
                  does not violate any laws or third-party rights
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You must not use the service for any illegal or unauthorized
                  purpose
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You are responsible for maintaining the confidentiality of any
                  account information
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You agree to use the service only for lawful purposes
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                4. Privacy and Data
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We respect your privacy. All processing of your images and
                videos is done locally in your browser. We do not store,
                transmit, or have access to your uploaded content. Please review
                our Privacy Policy for more information.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The Snapthumb service and its original content, features, and
                functionality are owned by Forge Tools and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                In no event shall Forge Tools, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                7. Changes to Terms
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms of Service at any time. If a revision is
                material, we will try to provide at least 30 days notice prior
                to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">
                8. Contact Information
              </h2>
              <p className="text-sm leading-relaxed">
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:legal@forge.tools"
                  className="text-forge hover:underline"
                >
                  legal@forge.tools
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
