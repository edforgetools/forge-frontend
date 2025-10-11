import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };
  return (
    <Page>
      <Container>
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-[18px] h-[18px] mr-2" />
            Back to Snapthumb
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Terms of Service</CardTitle>
            <CardDescription>Last updated: January 1, 2024</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <section>
              <h2 className="text-base mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm">
                By accessing and using Snapthumb ("the Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">2. Description of Service</h2>
              <p className="text-sm">
                Snapthumb is a web-based application that allows users to create
                thumbnails from videos and images. The service provides tools
                for cropping, editing, and exporting images in various formats.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  You are responsible for ensuring that any content you upload
                  does not violate any laws or third-party rights
                </li>
                <li>
                  You must not use the service for any illegal or unauthorized
                  purpose
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of any
                  account information
                </li>
                <li>You agree to use the service only for lawful purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base mb-3">4. Privacy and Data</h2>
              <p className="text-sm">
                We respect your privacy. All processing of your images and
                videos is done locally in your browser. We do not store,
                transmit, or have access to your uploaded content. Please review
                our Privacy Policy for more information.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">5. Intellectual Property</h2>
              <p className="text-sm">
                The Snapthumb service and its original content, features, and
                functionality are owned by Forge Tools and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">6. Limitation of Liability</h2>
              <p className="text-sm">
                In no event shall Forge Tools, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">7. Changes to Terms</h2>
              <p className="text-sm">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms of Service at any time. If a revision is
                material, we will try to provide at least 30 days notice prior
                to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-base mb-3">8. Contact Information</h2>
              <p className="text-sm">
                If you have any questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:legal@forge.tools"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  legal@forge.tools
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </Container>
    </Page>
  );
}
