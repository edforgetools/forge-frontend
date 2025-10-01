import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "@/components/ShareButton";
import { UpgradeCTA } from "@/components/UpgradeCTA";
import { trackPageViewTool } from "@/lib/metrics";
import {
  Image,
  Type,
  Music,
  Scissors,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Home,
  Menu,
  Mic,
  Zap,
  Sparkles,
} from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function AudiogramToolPage() {
  // Track page view
  React.useEffect(() => {
    trackPageViewTool("audiogram");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Free AI Audiogram Generator - Viral Visual Content Creator 2024
        </title>
        <meta
          name="description"
          content="Create viral audiograms from podcast episodes with our free AI audiogram generator. Transform audio into stunning visual content that drives engagement on Instagram, TikTok, and all social platforms."
        />
        <meta
          name="keywords"
          content="audiogram generator, AI audiogram maker, free audiogram tool, podcast visual content, viral audiogram, social media content, content creator tools, AI video generator"
        />
        <meta
          property="og:title"
          content="Free AI Audiogram Generator - Viral Visual Content Creator 2024"
        />
        <meta
          property="og:description"
          content="Create viral audiograms from podcast episodes with our free AI audiogram generator. Transform audio into stunning visual content that drives engagement on Instagram, TikTok, and all social platforms."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Free AI Audiogram Generator - Viral Visual Content Creator 2024"
        />
        <meta
          name="twitter:description"
          content="Create viral audiograms from podcast episodes with our free AI audiogram generator. Transform audio into stunning visual content that drives engagement on Instagram, TikTok, and all social platforms."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Free AI Audiogram Generator",
            description:
              "Create viral audiograms from podcast episodes with our free AI audiogram generator. Transform audio into stunning visual content that drives engagement on Instagram, TikTok, and all social platforms.",
            category: "MultimediaApplication",
            url: "https://forge-frontend.vercel.app/free-ai-audiogram-generator",
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
              "AI-powered audiogram generation",
              "Automatic audio transcription",
              "Visual waveform analysis",
              "Multi-platform optimization",
              "Professional typography",
              "Brand customization",
            ],
            screenshot:
              "https://forge-frontend.vercel.app/free-ai-audiogram-generator",
            softwareVersion: "1.0",
            datePublished: "2024-01-01",
            dateModified: "2024-01-01",
          })}
        </script>
        <link
          rel="canonical"
          href="https://forge-frontend.vercel.app/free-ai-audiogram-generator"
        />
      </Helmet>

      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <motion.header
        className="border-b border-border bg-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <a href="/" className="hover:text-primary transition-colors">
                  Forge Tools
                </a>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Free AI-Powered Content Creation
              </p>
            </div>
            <nav
              className="hidden md:flex gap-6"
              role="navigation"
              aria-label="Main navigation"
            >
              <Button variant="ghost" asChild>
                <a href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/blog">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Blog
                </a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/free-youtube-thumbnail-tool">
                  <Image className="h-4 w-4 mr-2" />
                  Tools
                </a>
              </Button>
            </nav>
            <div className="flex items-center gap-2">
              <ShareButton size="sm" variant="ghost" />
              <UpgradeCTA
                variant="inline"
                size="sm"
                feature="AI Audiogram Generator"
              />
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main
        id="main-content"
        className="container mx-auto px-4 py-8"
        role="main"
        aria-label="Free AI Audiogram Generator"
      >
        {/* Upgrade Banner */}
        <UpgradeCTA
          variant="banner"
          plan="plus"
          feature="advanced audiogram templates and unlimited exports"
          className="mb-8"
        />

        {/* Hero Section */}
        <motion.section
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-300 bg-clip-text text-transparent">
            Free AI Audiogram Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create viral audiograms from podcast episodes with our free AI
            audiogram generator. Transform audio into stunning visual content
            that drives engagement on Instagram, TikTok, and all social
            platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Music className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Viral Content
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Multi-Platform
            </Badge>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 text-lg leading-relaxed">
            <p>
              Create viral audiograms from your podcast episodes and audio
              content with our free AI-powered audiogram generator. Transform
              your audio into engaging visual content perfect for social media
              marketing and audience growth. Our advanced AI technology
              automatically identifies the most compelling moments from your
              audio and creates visually appealing video content that drives
              engagement across all social platforms. Works perfectly with our
              <a
                href="/free-podcast-caption-generator"
                className="link-primary"
              >
                podcast caption generator
              </a>
              for complete content marketing workflows.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How Our AI Audiogram Generator Works
            </h2>
            <p>
              Our free AI audiogram generator automatically transcribes your
              audio, generates captions, and creates shareable video content
              optimized for Instagram, TikTok, and other social platforms.
              Perfect for podcasters, content creators, and marketers looking to
              maximize their reach. The tool analyzes your audio content to
              identify key quotes, emotional moments, and trending topics that
              will resonate with your target audience.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Perfect for Social Media Marketing
            </h2>
            <p>
              Whether you're promoting a new episode, sharing key insights, or
              creating teaser content, our audiogram generator helps you
              transform your audio content into visually stunning social media
              posts. The AI automatically selects the best visual elements,
              applies professional typography, and ensures your content meets
              platform-specific requirements for maximum visibility and
              engagement.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              More Free Content Creation Tools
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href="/free-youtube-thumbnail-tool"
                    className="link-primary"
                  >
                    Snapthumb - YouTube Thumbnail Maker
                  </a>
                </h3>
                <p className="text-sm text-gray-300">
                  Create eye-catching YouTube thumbnails that boost CTR and
                  views with AI.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href="/free-podcast-caption-generator"
                    className="link-primary"
                  >
                    Captiq - Podcast Caption Generator
                  </a>
                </h3>
                <p className="text-sm text-gray-300">
                  Generate engaging social media captions from your podcast
                  episodes with AI.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href="/clip-short-video-automatically"
                    className="link-primary"
                  >
                    Video Clipper Tool
                  </a>
                </h3>
                <p className="text-sm text-gray-300">
                  Automatically generate short video clips from longer content
                  with AI.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Coming Soon Component */}
        <div className="bg-gray-800 rounded-lg p-6">
          <ComingSoon />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-gray-800 border-t border-gray-700 mt-16"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-text-muted text-sm">
            <p>&copy; 2024 Forge Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
