import { useState, useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image,
  Type,
  Music,
  Scissors,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import ForgePlusDashboard from "../ForgePlusDashboard";
import ThumbTool from "../tools/thumb/ThumbTool";
import ThumbnailToolPage from "../pages/ThumbnailToolPage";
import CaptionToolPage from "../pages/CaptionToolPage";
import AudiogramToolPage from "../pages/AudiogramToolPage";
import ClipperToolPage from "../pages/ClipperToolPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import PlanSelector from "../components/PlanSelector";
import UndoRedoTest from "../components/UndoRedoTest";
import {
  trackPageView,
  initSession,
  trackActivity,
  trackToolDiscovery,
  trackPageViewTool,
  trackReturnVisit,
} from "../lib/metrics";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/useToast";
import { ShareButton } from "@/components/ShareButton";
import { UpgradeCTA } from "@/components/UpgradeCTA";

type Route =
  | "home"
  | "free-youtube-thumbnail-tool"
  | "free-podcast-caption-generator"
  | "free-ai-audiogram-generator"
  | "clip-short-video-automatically"
  | "blog"
  | "blog-post"
  | "undo-redo-test";

export default function App() {
  const [tab, setTab] = useState<"captions" | "thumb">("captions");
  const [route, setRoute] = useState<Route>("home");
  const { toasts, removeToast } = useToast();

  // Initialize session tracking
  useEffect(() => {
    initSession();
  }, []);

  // Simple routing based on URL path
  useEffect(() => {
    const path = window.location.pathname;
    let newRoute: Route;

    switch (path) {
      case "/free-youtube-thumbnail-tool":
        newRoute = "free-youtube-thumbnail-tool";
        break;
      case "/free-podcast-caption-generator":
        newRoute = "free-podcast-caption-generator";
        break;
      case "/free-ai-audiogram-generator":
        newRoute = "free-ai-audiogram-generator";
        break;
      case "/clip-short-video-automatically":
        newRoute = "clip-short-video-automatically";
        break;
      case "/blog":
        newRoute = "blog";
        break;
      case "/undo-redo-test":
        newRoute = "undo-redo-test";
        break;
      default:
        if (path.startsWith("/blog/")) {
          newRoute = "blog-post";
        } else {
          newRoute = "home";
        }
    }

    setRoute(newRoute);

    // Track page view
    trackPageView(newRoute, {
      path,
      referrer: document.referrer,
    });

    // Track specific tool page views
    if (newRoute === "free-youtube-thumbnail-tool") {
      trackPageViewTool("thumbnail");
    } else if (newRoute === "free-podcast-caption-generator") {
      trackPageViewTool("caption");
    } else if (newRoute === "free-ai-audiogram-generator") {
      trackPageViewTool("audiogram");
    } else if (newRoute === "clip-short-video-automatically") {
      trackPageViewTool("clipper");
    }

    // Track return visits
    if (localStorage.getItem("forge_visited")) {
      trackReturnVisit();
    } else {
      localStorage.setItem("forge_visited", "true");
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      let newRoute: Route;

      switch (path) {
        case "/free-youtube-thumbnail-tool":
          newRoute = "free-youtube-thumbnail-tool";
          break;
        case "/free-podcast-caption-generator":
          newRoute = "free-podcast-caption-generator";
          break;
        case "/free-ai-audiogram-generator":
          newRoute = "free-ai-audiogram-generator";
          break;
        case "/clip-short-video-automatically":
          newRoute = "clip-short-video-automatically";
          break;
        case "/blog":
          newRoute = "blog";
          break;
        case "/undo-redo-test":
          newRoute = "undo-redo-test";
          break;
        default:
          if (path.startsWith("/blog/")) {
            newRoute = "blog-post";
          } else {
            newRoute = "home";
          }
      }

      setRoute(newRoute);

      // Track page view for navigation
      trackPageView(newRoute, {
        path,
        navigation: "browser_back_forward",
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Render different pages based on route
  if (route === "free-youtube-thumbnail-tool") {
    return (
      <HelmetProvider>
        <ThumbnailToolPage />
      </HelmetProvider>
    );
  }

  if (route === "free-podcast-caption-generator") {
    return (
      <HelmetProvider>
        <CaptionToolPage />
      </HelmetProvider>
    );
  }

  if (route === "free-ai-audiogram-generator") {
    return (
      <HelmetProvider>
        <AudiogramToolPage />
      </HelmetProvider>
    );
  }

  if (route === "clip-short-video-automatically") {
    return (
      <HelmetProvider>
        <ClipperToolPage />
      </HelmetProvider>
    );
  }

  if (route === "blog") {
    return (
      <HelmetProvider>
        <BlogPage />
      </HelmetProvider>
    );
  }

  if (route === "blog-post") {
    return (
      <HelmetProvider>
        <BlogPostPage />
      </HelmetProvider>
    );
  }

  // Default home page with existing functionality
  return (
    <HelmetProvider>
      <Helmet>
        <title>Forge Tools - Free AI-Powered Content Creation Tools</title>
        <meta
          name="description"
          content="Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite."
        />
        <meta
          name="keywords"
          content="content creation tools, AI tools, YouTube thumbnail maker, podcast caption generator, audiogram creator, video clipper, social media tools, free content tools"
        />
        <meta
          property="og:title"
          content="Forge Tools - Free AI-Powered Content Creation Tools"
        />
        <meta
          property="og:description"
          content="Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Forge Tools - Free AI-Powered Content Creation Tools"
        />
        <meta
          name="twitter:description"
          content="Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Forge Tools",
            description:
              "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite.",
            url: "https://forge-frontend.vercel.app",
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web Browser",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            creator: {
              "@type": "Organization",
              name: "Forge Tools",
            },
            featureList: [
              "Snapthumb - YouTube Thumbnail Generator",
              "Captiq - Podcast Caption Generator",
              "AI Audiogram Creator",
              "Automatic Video Clipper",
            ],
          })}
        </script>
      </Helmet>

      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main
        id="main-content"
        className="container mx-auto px-4 py-8 max-w-7xl"
        role="main"
        aria-label="Forge Tools - Free AI-Powered Content Creation Tools"
      >
        {/* Hero Section */}
        <motion.section
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            id="main-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent"
          >
            Free AI-Powered Content Creation Tools
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create professional content with Forge's suite of free AI-powered
            tools. Generate eye-catching YouTube thumbnails, engaging podcast
            captions, stunning audiograms, and viral-ready video clips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Creating
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <BookOpen className="h-5 w-5 mr-2" />
              Learn More
            </Button>
            <ShareButton size="lg" className="text-lg px-8" />
          </div>
        </motion.section>

        {/* Tools Grid */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Free Content Creation Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Snapthumb - YouTube Thumbnail Generator",
                description:
                  "Create eye-catching YouTube thumbnails that get more clicks. Upload images, add text overlays, and design professional thumbnails optimized for maximum engagement.",
                href: "/free-youtube-thumbnail-tool",
                icon: <Image className="h-8 w-8" />,
                color: "bg-red-500",
                trackId: "youtube-thumbnail",
              },
              {
                title: "Captiq - Podcast Caption Generator",
                description:
                  "Generate engaging social media captions from your podcast episodes. Upload audio files to get automatic transcription and AI-optimized captions for all platforms.",
                href: "/free-podcast-caption-generator",
                icon: <Type className="h-8 w-8" />,
                color: "bg-blue-500",
                trackId: "podcast-caption",
              },
              {
                title: "AI Audiogram Creator",
                description:
                  "Transform your audio content into stunning visual audiograms. Perfect for social media marketing with automatic transcription and professional design.",
                href: "/free-ai-audiogram-generator",
                icon: <Music className="h-8 w-8" />,
                color: "bg-purple-500",
                trackId: "ai-audiogram",
              },
              {
                title: "Automatic Video Clipper",
                description:
                  "Automatically generate short video clips from longer content. Our AI identifies the most engaging moments for TikTok, Instagram Reels, and YouTube Shorts.",
                href: "/clip-short-video-automatically",
                icon: <Scissors className="h-8 w-8" />,
                color: "bg-green-500",
                trackId: "video-clipper",
              },
            ].map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center text-white mb-4`}
                    >
                      {tool.icon}
                    </div>
                    <CardTitle className="text-xl">
                      <a
                        href={tool.href}
                        className="hover:text-primary transition-colors"
                        onClick={() =>
                          trackToolDiscovery(tool.trackId, "homepage")
                        }
                      >
                        {tool.title}
                      </a>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          trackToolDiscovery(tool.trackId, "homepage")
                        }
                      >
                        Try Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <div className="flex gap-2">
                        <ShareButton
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                        />
                        <UpgradeCTA
                          variant="inline"
                          size="sm"
                          feature={tool.title}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Blog Section */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary-300/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Content Creation Blog
              </CardTitle>
              <CardDescription className="text-lg">
                Get expert tips, tutorials, and insights to maximize your
                content creation potential.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="lg"
                onClick={() => trackToolDiscovery("blog", "homepage")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Read Our Blog
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Tool Interface */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="flex-1">
              <Tabs
                value={tab}
                onValueChange={(value) => {
                  setTab(value as "captions" | "thumb");
                  trackActivity("tab_switch");
                  trackToolDiscovery(
                    value === "captions" ? "captions" : "thumbnail",
                    "homepage"
                  );
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="captions"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Captiq
                  </TabsTrigger>
                  <TabsTrigger
                    value="thumb"
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Snapthumb
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="captions" className="mt-6">
                  <ForgePlusDashboard />
                </TabsContent>
                <TabsContent value="thumb" className="mt-6">
                  <ThumbTool />
                </TabsContent>
              </Tabs>
            </div>
            <div className="lg:w-80">
              <PlanSelector />
            </div>
          </div>
        </motion.section>
      </main>

      <footer
        className="mt-16 py-8 border-t border-border text-center text-muted-foreground text-sm"
        role="contentinfo"
      >
        <p>&copy; 2024 Forge Tools. All rights reserved.</p>
      </footer>

      <Toaster toasts={toasts} onRemove={removeToast} />
    </HelmetProvider>
  );
}
