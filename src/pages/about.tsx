import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Camera,
  Video,
  Download,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
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
            <CardTitle className="text-3xl font-bold">
              About Snapthumb
            </CardTitle>
            <CardDescription>
              The simple, powerful tool for creating perfect thumbnails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Snapthumb was created to solve a simple problem: making perfect
                16:9 thumbnails from videos and images shouldn't be complicated.
                We believe in privacy-first design, where your content stays on
                your device, and powerful tools that just work.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Video className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Video Frame Extraction
                    </h3>
                    <p className="text-sm text-gray-600">
                      Extract frames from any video at any timestamp with
                      precision
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Camera className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Smart Cropping
                    </h3>
                    <p className="text-sm text-gray-600">
                      Automatic 16:9 aspect ratio cropping with intelligent
                      positioning
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Optimized Export
                    </h3>
                    <p className="text-sm text-gray-600">
                      Export thumbnails under 2MB for all platforms
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Privacy First
                    </h3>
                    <p className="text-sm text-gray-600">
                      All processing happens locally in your browser
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Lightning Fast
                    </h3>
                    <p className="text-sm text-gray-600">
                      No uploads, no waiting - instant results
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Universal Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      Works with all major video and image formats
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Why We Built This</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As content creators ourselves, we were frustrated with existing
                thumbnail creation tools. They were either too complex, required
                expensive subscriptions, or compromised on privacy by uploading
                our content to external servers.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Snapthumb was born from the need for a simple, fast, and private
                solution that respects your content and your time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Technology</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Built with modern web technologies, Snapthumb runs entirely in
                your browser using:
              </p>
              <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
                <li>
                  <strong>React & TypeScript:</strong> For a smooth, type-safe
                  user experience
                </li>
                <li>
                  <strong>Canvas API:</strong> For high-quality image processing
                  and manipulation
                </li>
                <li>
                  <strong>Web Workers:</strong> For non-blocking video
                  processing
                </li>
                <li>
                  <strong>WebAssembly:</strong> For optimized compression
                  algorithms
                </li>
                <li>
                  <strong>Progressive Web App:</strong> For offline
                  functionality and app-like experience
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Built with Forge</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Snapthumb is proudly built with{" "}
                <a
                  href="https://forge.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  Forge
                </a>
                , a powerful toolkit for building modern web applications.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Forge provides the foundation for rapid development, ensuring
                Snapthumb is fast, reliable, and maintainable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Open Source</h2>
              <p className="text-gray-700 leading-relaxed">
                Snapthumb is open source and available on GitHub. We welcome
                contributions, bug reports, and feature requests from the
                community.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Have questions or feedback? We'd love to hear from you! Reach
                out to us at{" "}
                <a
                  href="mailto:hello@forge.tools"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  hello@forge.tools
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
