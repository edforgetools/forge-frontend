import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Play, Camera, Video, Download, ExternalLink } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [useAnimated, setUseAnimated] = useState(false);

  // Upgrade to animated version after initial load for better FCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigate("/app");
  };

  if (useAnimated) {
    return (
      <main className="h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-[680px] mx-auto px-4 text-center">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="hero-title text-gray-900 mb-6">Snapthumb</h1>

          {/* Subtitle */}
          <p className="hero-subtitle text-gray-600 mb-12 max-w-lg mx-auto">
            Create perfect thumbnails from your videos and images with our
            intuitive editor
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Card className="text-center">
              <CardHeader className="pb-3">
                <Video className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Video Frames</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Extract frames from any video at any timestamp
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Camera className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Smart Cropping</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Auto-crop to perfect 16:9 aspect ratio
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-3">
                <Download className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">Export Ready</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>
                  Optimized files under 2MB for all platforms
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Button */}
          <div className="mb-16">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg btn-text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-500">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <Card className="px-3 py-2 bg-gray-50 border-gray-200">
                <CardContent className="p-0">
                  <span className="text-gray-700 leading-tight">
                    Drag & drop support
                  </span>
                </CardContent>
              </Card>
              <Card className="px-3 py-2 bg-gray-50 border-gray-200">
                <CardContent className="p-0">
                  <span className="text-gray-700 leading-tight">
                    Keyboard shortcuts
                  </span>
                </CardContent>
              </Card>
              <Card className="px-3 py-2 bg-gray-50 border-gray-200">
                <CardContent className="p-0">
                  <span className="text-gray-700 leading-tight">
                    Responsive design
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => navigate("/about")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
              >
                About
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
              >
                Privacy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
              >
                Terms
              </button>
            </div>

            {/* Built with Forge Badge */}
            <div className="flex items-center justify-center">
              <a
                href="https://forge.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 hover:text-gray-900 transition-colors text-sm min-h-[44px]"
              >
                <span>Built with</span>
                <span className="font-semibold">Forge</span>
                <ExternalLink className="w-[18px] h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Static version for faster FCP
  return (
    <main className="h-[100dvh] bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-[680px] mx-auto px-4 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="hero-title text-gray-900 mb-6">Snapthumb</h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-gray-600 mb-12 max-w-lg mx-auto">
          Create perfect thumbnails from your videos and images with our
          intuitive editor
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="text-center">
            <CardHeader className="pb-3">
              <Video className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Video Frames</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Extract frames from any video at any timestamp
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <Camera className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Cropping</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Auto-crop to perfect 16:9 aspect ratio
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="pb-3">
              <Download className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Export Ready</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription>
                Optimized files under 2MB for all platforms
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="mb-16">
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg btn-text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Card className="px-3 py-2 bg-gray-50 border-gray-200">
              <CardContent className="p-0">
                <span className="text-gray-700 leading-tight">
                  Drag & drop support
                </span>
              </CardContent>
            </Card>
            <Card className="px-3 py-2 bg-gray-50 border-gray-200">
              <CardContent className="p-0">
                <span className="text-gray-700 leading-tight">
                  Keyboard shortcuts
                </span>
              </CardContent>
            </Card>
            <Card className="px-3 py-2 bg-gray-50 border-gray-200">
              <CardContent className="p-0">
                <span className="text-gray-700 leading-tight">
                  Responsive design
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => navigate("/about")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
            >
              About
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 min-h-[44px] min-w-[44px]"
            >
              Terms
            </button>
          </div>

          {/* Built with Forge Badge */}
          <div className="flex items-center justify-center">
            <a
              href="https://forge.tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 hover:text-gray-900 transition-colors text-sm min-h-[44px]"
            >
              <span>Built with</span>
              <span className="font-semibold">Forge</span>
              <ExternalLink className="w-[18px] h-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
