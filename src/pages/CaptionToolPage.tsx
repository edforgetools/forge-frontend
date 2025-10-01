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
  Mic,
  Zap,
} from "lucide-react";
import CaptionTool from "../components/CaptionTool";

export default function CaptionToolPage() {
  // Track page view
  React.useEffect(() => {
    trackPageViewTool("caption");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>
          Captiq - Free AI Podcast Caption Generator - Viral Social Media
          Captions 2024
        </title>
        <meta
          name="description"
          content="Captiq - Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <meta
          name="keywords"
          content="podcast caption generator, AI caption generator, free caption tool, social media captions, podcast marketing, viral captions, content creator tools, AI transcription"
        />
        <meta
          property="og:title"
          content="Captiq - Free AI Podcast Caption Generator - Viral Social Media Captions 2024"
        />
        <meta
          property="og:description"
          content="Captiq - Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Captiq - Free AI Podcast Caption Generator - Viral Social Media Captions 2024"
        />
        <meta
          name="twitter:description"
          content="Captiq - Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Captiq - AI Podcast Caption Generator",
            description:
              "Captiq - Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms.",
            category: "MultimediaApplication",
            url: "https://forge-frontend.vercel.app/free-podcast-caption-generator",
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
              "AI-powered caption generation",
              "Automatic audio transcription",
              "Multi-platform optimization",
              "Engagement-focused formatting",
              "Key quote extraction",
              "Brand voice matching",
            ],
            screenshot:
              "https://forge-frontend.vercel.app/free-podcast-caption-generator",
            softwareVersion: "1.0",
            datePublished: "2024-01-01",
            dateModified: "2024-01-01",
          })}
        </script>
        <link
          rel="canonical"
          href="https://forge-frontend.vercel.app/free-podcast-caption-generator"
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
                feature="Podcast Caption Generator"
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
        aria-label="Captiq - Podcast Caption Generator"
      >
        {/* Upgrade Banner */}
        <UpgradeCTA
          variant="banner"
          plan="pro"
          feature="unlimited caption generation and premium templates"
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
            Captiq - Free AI Podcast Caption Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Generate viral social media captions from your podcast episodes with
            our free AI-powered caption generator. Upload your audio or video
            files to get automatic transcription, then create
            engagement-optimized captions for all platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Mic className="h-3 w-3 mr-1" />
              AI Transcription
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              Multi-Platform
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Viral Captions
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
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Mic className="h-6 w-6" />
                </div>
                <CardTitle>Automatic Transcription</CardTitle>
                <CardDescription>
                  Upload your audio or video files and get instant, accurate
                  transcription powered by advanced AI technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Type className="h-6 w-6" />
                </div>
                <CardTitle>Smart Caption Generation</CardTitle>
                <CardDescription>
                  Our AI analyzes your content to create compelling social media
                  posts that drive maximum engagement across all platforms.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle>Multi-Platform Optimization</CardTitle>
                <CardDescription>
                  Generate captions optimized for Twitter, Instagram, TikTok,
                  and other social platforms with platform-specific formatting.
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
            <CaptionTool />
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
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white mb-4">
                  <Image className="h-6 w-6" />
                </div>
                <CardTitle>
                  <a
                    href="/free-youtube-thumbnail-tool"
                    className="hover:text-primary transition-colors"
                  >
                    Snapthumb - YouTube Thumbnail Maker
                  </a>
                </CardTitle>
                <CardDescription>
                  Create eye-catching YouTube thumbnails that boost CTR and
                  views with AI.
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
