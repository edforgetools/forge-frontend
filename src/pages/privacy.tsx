import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <Page>
      <Container>
        <h1 className="text-xl text-center">Privacy</h1>

        <section className="mt-6 space-y-3 text-sm leading-6">
          <div>
            <h2 className="font-medium text-base mb-2">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              Snapthumb is designed with privacy in mind. We collect minimal
              information:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Usage Analytics:</strong> Anonymous usage statistics to
                improve the service
              </li>
              <li>
                <strong>Error Reports:</strong> Technical error information to
                fix bugs
              </li>
              <li>
                <strong>No Personal Data:</strong> We do not collect names,
                emails, or personal identifiers
              </li>
              <li>
                <strong>No Content Storage:</strong> Your images and videos are
                never stored on our servers
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">
              2. How We Use Information
            </h2>
            <p className="mb-3">
              The limited information we collect is used to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Improve the functionality and performance of Snapthumb</li>
              <li>Identify and fix technical issues</li>
              <li>Understand how users interact with the service</li>
              <li>Ensure the service remains secure and reliable</li>
            </ul>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">3. Data Processing</h2>
            <p>
              All image and video processing happens locally in your browser.
              Your content never leaves your device and is not transmitted to
              our servers. This ensures complete privacy and security of your
              media files.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">
              4. Third-Party Services
            </h2>
            <p className="mb-3">We use the following third-party services:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Vercel Analytics:</strong> Anonymous usage analytics (no
                personal data)
              </li>
              <li>
                <strong>Google Fonts:</strong> Web fonts (no personal data
                collected)
              </li>
              <li>
                <strong>CDN Services:</strong> For fast content delivery (no
                personal data stored)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">
              5. Cookies and Local Storage
            </h2>
            <p>
              We use minimal local storage to remember your preferences and
              improve your experience. This includes settings like compression
              level and export format. No tracking cookies are used.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect any
              information we collect. Since we don't store your media files,
              there's no risk of data breaches affecting your personal content.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">
              7. Children's Privacy
            </h2>
            <p>
              Snapthumb is safe for users of all ages. We do not knowingly
              collect personal information from children under 13. Since we
              don't collect personal information from anyone, this is not a
              concern.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">
              8. Changes to Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify users of any material changes by posting the new Privacy
              Policy on this page and updating the "Last updated" date.
            </p>
          </div>

          <div>
            <h2 className="font-medium text-base mb-2">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:privacy@forge.tools"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                privacy@forge.tools
              </a>
            </p>
          </div>
        </section>

        <div className="mt-6">
          <Link to="/" className="text-xs underline">
            ← Back
          </Link>
        </div>
      </Container>
    </Page>
  );
}
