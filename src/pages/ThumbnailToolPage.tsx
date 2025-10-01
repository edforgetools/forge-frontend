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
import { trackPageViewTool, trackActivation } from "@/lib/metrics";
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
} from "lucide-react";
import ThumbTool from "../tools/thumb/ThumbTool";

export default function ThumbnailToolPage() {
  // Track page view
  React.useEffect(() => {
    trackPageViewTool("thumbnail");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Snapthumb - Free YouTube Thumbnail Maker - AI-Powered Thumbnail
          Generator 2024
        </title>
        <meta
          name="description"
          content="Snapthumb - Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <meta
          name="keywords"
          content="youtube thumbnail maker, free thumbnail generator, youtube thumbnail tool, thumbnail creator, youtube thumbnail design, AI thumbnail generator, youtube CTR, click-through rate"
        />
        <meta
          property="og:title"
          content="Snapthumb - Free YouTube Thumbnail Maker - AI-Powered Thumbnail Generator 2024"
        />
        <meta
          property="og:description"
          content="Snapthumb - Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Snapthumb - Free YouTube Thumbnail Maker - AI-Powered Thumbnail Generator 2024"
        />
        <meta
          name="twitter:description"
          content="Snapthumb - Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Snapthumb - YouTube Thumbnail Maker",
            description:
              "Snapthumb - Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views.",
            category: "MultimediaApplication",
            url: "https://forge-frontend.vercel.app/free-youtube-thumbnail-tool",
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
              "AI-powered thumbnail generation",
              "Text overlay customization",
              "Multiple aspect ratios (16:9, 9:16, 1:1)",
              "High-quality export under 2MB",
              "Template suggestions",
              "Color contrast optimization",
            ],
            screenshot:
              "https://forge-frontend.vercel.app/free-youtube-thumbnail-tool",
            softwareVersion: "1.0",
            datePublished: "2024-01-01",
            dateModified: "2024-01-01",
          })}
        </script>
        <link
          rel="canonical"
          href="https://forge-frontend.vercel.app/free-youtube-thumbnail-tool"
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
                <a href="/free-podcast-caption-generator">
                  <Type className="h-4 w-4 mr-2" />
                  Tools
                </a>
              </Button>
            </nav>
            <div className="flex items-center gap-2">
              <ShareButton size="sm" variant="ghost" />
              <UpgradeCTA
                variant="inline"
                size="sm"
                feature="YouTube Thumbnail Generator"
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
        aria-label="Snapthumb - YouTube Thumbnail Maker"
      >
        {/* Upgrade Banner */}
        <UpgradeCTA
          variant="banner"
          plan="pro"
          feature="unlimited exports and premium presets"
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
            Snapthumb - Free YouTube Thumbnail Maker
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Create viral YouTube thumbnails in seconds with our free AI-powered
            thumbnail generator. Upload your images or capture frames from
            videos, add custom text overlays, and design click-worthy thumbnails
            that boost CTR and views.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Image className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <ArrowRight className="h-3 w-3 mr-1" />
              Multiple Aspect Ratios
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              High-Quality Export
            </Badge>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Image className="h-6 w-6" />
                </div>
                <CardTitle>Smart AI Generation</CardTitle>
                <CardDescription>
                  Our advanced AI technology analyzes your content to create
                  thumbnails optimized for maximum engagement and CTR.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Type className="h-6 w-6" />
                </div>
                <CardTitle>Text Overlay Customization</CardTitle>
                <CardDescription>
                  Add custom text overlays with smart positioning, automatic
                  sizing, and color contrast optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <CardTitle>Multiple Aspect Ratios</CardTitle>
                <CardDescription>
                  Support for 16:9, 9:16, and 1:1 aspect ratios to fit any
                  platform or content type perfectly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        {/* Tool Interface */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <ThumbTool />
          </Card>
        </motion.section>

        {/* Related Tools */}
        <motion.section
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">
            More Free Content Creation Tools
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Type className="h-6 w-6" />
                </div>
                <CardTitle>
                  <a
                    href="/free-podcast-caption-generator"
                    className="hover:text-primary transition-colors"
                  >
                    Captiq - Podcast Caption Generator
                  </a>
                </CardTitle>
                <CardDescription>
                  Generate engaging social media captions from your podcast
                  episodes with AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Try Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Music className="h-6 w-6" />
                </div>
                <CardTitle>
                  <a
                    href="/free-ai-audiogram-generator"
                    className="hover:text-primary transition-colors"
                  >
                    AI Audiogram Creator
                  </a>
                </CardTitle>
                <CardDescription>
                  Transform audio content into stunning visual audiograms for
                  social media.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Try Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Scissors className="h-6 w-6" />
                </div>
                <CardTitle>
                  <a
                    href="/clip-short-video-automatically"
                    className="hover:text-primary transition-colors"
                  >
                    Video Clipper Tool
                  </a>
                </CardTitle>
                <CardDescription>
                  Automatically generate short video clips from longer content
                  with AI.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Try Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        className="bg-card border-t border-border mt-16"
        role="contentinfo"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Forge Tools. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
