import { useState, useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
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
} from "../lib/metrics";

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
            "name": "Forge Tools",
            "description": "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite.",
            "url": "https://forge-frontend.vercel.app",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "Forge Tools"
            },
            "featureList": [
              "YouTube Thumbnail Generator",
              "Podcast Caption Generator",
              "AI Audiogram Creator",
              "Automatic Video Clipper"
            ]
          })}
        </script>
      </Helmet>

      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" className="p-4 max-w-5xl mx-auto">
        {/* SEO Content */}
        <section className="mb-8" aria-labelledby="main-heading">
          <h1
            id="main-heading"
            className="text-4xl font-bold mb-6 text-center text-white"
          >
            Free AI-Powered Content Creation Tools
          </h1>

          <div className="max-w-4xl mx-auto space-y-4 text-lg leading-relaxed text-white mb-8">
            <p>
              Create professional content with Forge's suite of free AI-powered
              tools. Generate eye-catching YouTube thumbnails, engaging podcast
              captions, stunning audiograms, and viral-ready video clips.
              Perfect for content creators, podcasters, and marketers looking to
              maximize their social media impact. Learn more in our 
              <a href="/blog" className="link-primary">comprehensive blog</a> 
              with expert tips and tutorials.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Our Free Content Creation Tools
            </h2>

            <div
              className="grid md:grid-cols-2 gap-6 mb-8"
              role="list"
              aria-label="Available tools"
            >
              <div className="bg-gray-800 rounded-lg p-6" role="listitem">
                <h3 className="text-xl font-semibold mb-3">
                  <a
                    href="/free-youtube-thumbnail-tool"
                    className="link-primary"
                    onClick={() =>
                      trackToolDiscovery("youtube-thumbnail", "homepage")
                    }
                  >
                    YouTube Thumbnail Generator
                  </a>
                </h3>
                <p className="text-gray-300">
                  Create eye-catching YouTube thumbnails that get more clicks.
                  Upload images, add text overlays, and design professional
                  thumbnails optimized for maximum engagement.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6" role="listitem">
                <h3 className="text-xl font-semibold mb-3">
                  <a
                    href="/free-podcast-caption-generator"
                    className="link-primary"
                    onClick={() =>
                      trackToolDiscovery("podcast-caption", "homepage")
                    }
                  >
                    Podcast Caption Generator
                  </a>
                </h3>
                <p className="text-gray-300">
                  Generate engaging social media captions from your podcast
                  episodes. Upload audio files to get automatic transcription
                  and AI-optimized captions for all platforms.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6" role="listitem">
                <h3 className="text-xl font-semibold mb-3">
                  <a
                    href="/free-ai-audiogram-generator"
                    className="link-primary"
                    onClick={() =>
                      trackToolDiscovery("ai-audiogram", "homepage")
                    }
                  >
                    AI Audiogram Creator
                  </a>
                </h3>
                <p className="text-gray-300">
                  Transform your audio content into stunning visual audiograms.
                  Perfect for social media marketing with automatic
                  transcription and professional design.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6" role="listitem">
                <h3 className="text-xl font-semibold mb-3">
                  <a
                    href="/clip-short-video-automatically"
                    className="link-primary"
                    onClick={() =>
                      trackToolDiscovery("video-clipper", "homepage")
                    }
                  >
                    Automatic Video Clipper
                  </a>
                </h3>
                <p className="text-gray-300">
                  Automatically generate short video clips from longer content.
                  Our AI identifies the most engaging moments for TikTok,
                  Instagram Reels, and YouTube Shorts.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Why Choose Forge Tools?
            </h2>
            <p>
              All our tools are completely free to use with no watermarks or
              limitations. Powered by advanced AI technology, they're designed
              to help content creators save time while producing
              professional-quality content that drives engagement and grows your
              audience across all social media platforms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Learn & Grow</h2>
            <p className="mb-6">
              Get expert tips, tutorials, and insights to maximize your content
              creation potential. Our blog covers everything from YouTube
              optimization to social media strategies.
            </p>
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-3">
                <a
                  href="/blog"
                  className="link-primary"
                  onClick={() => trackToolDiscovery("blog", "homepage")}
                >
                  📚 Content Creation Blog
                </a>
              </h3>
              <p className="text-gray-300">
                Learn how to create professional content with our comprehensive
                guides. From YouTube thumbnail design to podcast caption
                strategies, we've got you covered.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-between items-center mb-4">
          <nav
            className="flex gap-2"
            role="navigation"
            aria-label="Tool selection"
          >
            <button
              className={`btn ${tab === "captions" ? "border-white" : ""}`}
              onClick={() => {
                setTab("captions");
                trackActivity("tab_switch");
                trackToolDiscovery("captions", "homepage");
              }}
              aria-pressed={tab === "captions"}
            >
              Captions
            </button>
            <button
              className={`btn ${tab === "thumb" ? "border-white" : ""}`}
              onClick={() => {
                setTab("thumb");
                trackActivity("tab_switch");
                trackToolDiscovery("thumbnail", "homepage");
              }}
              aria-pressed={tab === "thumb"}
            >
              Thumbnail
            </button>
          </nav>
          <PlanSelector />
        </div>
        {tab === "captions" ? <ForgePlusDashboard /> : <ThumbTool />}
      </main>

      <footer
        className="mt-8 py-4 border-t border-gray-700 text-center text-gray-400 text-sm"
        role="contentinfo"
      >
        <p>&copy; 2024 Forge Tools. All rights reserved.</p>
      </footer>
    </HelmetProvider>
  );
}
