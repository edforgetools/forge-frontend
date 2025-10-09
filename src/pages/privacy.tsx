import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };
  return (
    <div className="h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-[18px] h-[18px] mr-2" />
            Back to Snapthumb
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <CardDescription>Last updated: January 1, 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Snapthumb is designed with privacy in mind. We collect minimal
                information:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>
                  <strong>Usage Analytics:</strong> Anonymous usage statistics
                  to improve the service
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
                  <strong>No Content Storage:</strong> Your images and videos
                  are never stored on our servers
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. How We Use Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                The limited information we collect is used to:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>Improve the functionality and performance of Snapthumb</li>
                <li>Identify and fix technical issues</li>
                <li>Understand how users interact with the service</li>
                <li>Ensure the service remains secure and reliable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Processing</h2>
              <p className="text-gray-700 leading-relaxed">
                All image and video processing happens locally in your browser.
                Your content never leaves your device and is not transmitted to
                our servers. This ensures complete privacy and security of your
                media files.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                4. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>
                  <strong>Vercel Analytics:</strong> Anonymous usage analytics
                  (no personal data)
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
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                5. Cookies and Local Storage
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use minimal local storage to remember your preferences and
                improve your experience. This includes settings like compression
                level and export format. No tracking cookies are used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect any
                information we collect. Since we don't store your media files,
                there's no risk of data breaches affecting your personal
                content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                7. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Snapthumb is safe for users of all ages. We do not knowingly
                collect personal information from children under 13. Since we
                don't collect personal information from anyone, this is not a
                concern.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                8. Changes to Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify users of any material changes by posting the new Privacy
                Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at{" "}
                <a
                  href="mailto:privacy@forge.tools"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  privacy@forge.tools
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
