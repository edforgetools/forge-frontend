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
import {
  Play,
  Camera,
  Video,
  ExternalLink,
  Sparkles,
  Zap,
  Palette,
  MousePointer,
  Keyboard,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { V2BetaCTA } from "@/components/V2BetaCTA";

export default function Home() {
  const navigate = useNavigate();
  const [useAnimated, setUseAnimated] = useState(false);
  const [showV2CTA, setShowV2CTA] = useState(false);

  // Upgrade to animated version after initial load for better FCP
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if v2 CTA should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem("snapthumb_v2_cta_dismissed");
    if (!dismissed) {
      setShowV2CTA(true);
    }
  }, []);

  const handleStart = () => {
    navigate("/app");
  };

  if (useAnimated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              {/* Logo/Icon */}
              <div className="mb-8 animate-fade-in-up">
                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Camera className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Snapthumb v1.2
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in-up">
                Create Perfect
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Thumbnails
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up">
                Extract frames from videos, crop images, and create stunning
                thumbnails with our intuitive editor. Perfect for content
                creators, marketers, and developers.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up">
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* V2 Beta CTA */}
            {showV2CTA && (
              <div className="mb-16">
                <V2BetaCTA onDismiss={() => setShowV2CTA(false)} />
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    Video Frame Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Extract high-quality frames from any video at any timestamp
                    with precision controls
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Smart Cropping</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Auto-crop to perfect 16:9 aspect ratio with intelligent
                    composition detection
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Optimized processing with files under 2MB for all platforms
                    and devices
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* New Features Section */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What's New in v1.2
                </h2>
                <p className="text-lg text-muted-foreground">
                  Enhanced features and improved performance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Beautiful dark theme support
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MousePointer className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Better UX</h3>
                  <p className="text-sm text-muted-foreground">
                    Improved drag & drop interface
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Keyboard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Shortcuts</h3>
                  <p className="text-sm text-muted-foreground">
                    Keyboard shortcuts for power users
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Mobile Ready</h3>
                  <p className="text-sm text-muted-foreground">
                    Fully responsive design
                  </p>
                </Card>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Loved by Creators
                </h2>
                <p className="text-lg text-muted-foreground">
                  See what our users are saying
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Snapthumb has revolutionized my thumbnail creation process.
                    The interface is intuitive and the results are perfect every
                    time."
                  </p>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">
                    Content Creator
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The video frame extraction is incredibly precise. I can get
                    exactly the moment I need for my thumbnails."
                  </p>
                  <div className="font-semibold">Mike Rodriguez</div>
                  <div className="text-sm text-muted-foreground">YouTuber</div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Fast, reliable, and the dark mode is beautiful. This tool
                    has become essential for my workflow."
                  </p>
                  <div className="font-semibold">Alex Thompson</div>
                  <div className="text-sm text-muted-foreground">
                    Digital Marketer
                  </div>
                </Card>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Create Amazing Thumbnails?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of creators who trust Snapthumb for their
                thumbnail needs. Start creating today - it's completely free!
              </p>
              <Button
                onClick={handleStart}
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Play className="w-5 h-5 mr-2" />
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-muted/30 py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">Snapthumb</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Create perfect thumbnails from your videos and images with our
                  intuitive editor.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button
                      onClick={() => navigate("/app")}
                      className="hover:text-foreground transition-colors"
                    >
                      Editor
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/about")}
                      className="hover:text-foreground transition-colors"
                    >
                      Features
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Pricing
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Contact
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Status
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button
                      onClick={() => navigate("/privacy")}
                      className="hover:text-foreground transition-colors"
                    >
                      Privacy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/terms")}
                      className="hover:text-foreground transition-colors"
                    >
                      Terms
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-foreground transition-colors">
                      Cookies
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                © 2024 Snapthumb. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Layer v0.2 Connected
                </div>
                <a
                  href="https://forge.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <span>Built with</span>
                  <span className="font-semibold">Forge</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // Static version for faster FCP
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            {/* Logo/Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Snapthumb v1.2
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Create Perfect
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Thumbnails
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Extract frames from videos, crop images, and create stunning
              thumbnails with our intuitive editor. Perfect for content
              creators, marketers, and developers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                onClick={handleStart}
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Creating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                <Video className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  Video Frame Extraction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Extract high-quality frames from any video at any timestamp
                  with precision controls
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Cropping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Auto-crop to perfect 16:9 aspect ratio with intelligent
                  composition detection
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Optimized processing with files under 2MB for all platforms
                  and devices
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Create Amazing Thumbnails?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust Snapthumb for their thumbnail
              needs. Start creating today - it's completely free!
            </p>
            <Button
              onClick={handleStart}
              size="lg"
              className="text-lg px-8 py-6 h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Snapthumb</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Create perfect thumbnails from your videos and images with our
                intuitive editor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigate("/app")}
                    className="hover:text-foreground transition-colors"
                  >
                    Editor
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/about")}
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Status
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </button>
                </li>
                <li>
                  <button className="hover:text-foreground transition-colors">
                    Cookies
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 Snapthumb. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Layer v0.2 Connected
              </div>
              <a
                href="https://forge.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <span>Built with</span>
                <span className="font-semibold">Forge</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
