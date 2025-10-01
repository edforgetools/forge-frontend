import React from "react";
import { Helmet } from "react-helmet-async";
import CaptionTool from "../components/CaptionTool";

export default function CaptionToolPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Helmet>
        <title>
          Free AI Podcast Caption Generator - Viral Social Media Captions 2024
        </title>
        <meta
          name="description"
          content="Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <meta
          name="keywords"
          content="podcast caption generator, AI caption generator, free caption tool, social media captions, podcast marketing, viral captions, content creator tools, AI transcription"
        />
        <meta
          property="og:title"
          content="Free AI Podcast Caption Generator - Viral Social Media Captions 2024"
        />
        <meta
          property="og:description"
          content="Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Free AI Podcast Caption Generator - Viral Social Media Captions 2024"
        />
        <meta
          name="twitter:description"
          content="Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Free AI Podcast Caption Generator",
            description:
              "Generate viral social media captions from podcast episodes with our free AI caption generator. Upload audio files for instant transcription and engagement-optimized captions for all platforms.",
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
      </Helmet>

      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                <a href="/" className="link-primary">
                  Forge Tools
                </a>
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Free AI-Powered Content Creation
              </p>
            </div>
            <nav
              className="flex gap-6"
              role="navigation"
              aria-label="Main navigation"
            >
              <a
                href="/"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Home
              </a>
              <a
                href="/blog"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Blog
              </a>
              <a
                href="/free-youtube-thumbnail-tool"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Tools
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* SEO Content */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 text-center">
            Free AI Podcast Caption Generator - Viral Social Media Captions
          </h1>

          <div className="max-w-4xl mx-auto space-y-4 text-lg leading-relaxed">
            <p>
              Generate viral social media captions from your podcast episodes
              with our free AI-powered caption generator. Upload your audio or
              video files to get automatic transcription, then create
              engagement-optimized captions for Twitter, Instagram, TikTok, and
              other social platforms. Our advanced AI technology understands
              context, tone, and trending topics to create captions that drive
              maximum engagement. Perfect for content creators who want to
              maximize their reach across all social media platforms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              How Our AI Caption Generator Works
            </h2>
            <p>
              Our free podcast caption generator uses advanced AI to analyze
              your content and create compelling social media posts that drive
              engagement. Perfect for podcasters, content creators, and
              marketers looking to maximize their reach across all platforms.
              The tool automatically identifies the most quotable moments,
              extracts key insights, and formats them for maximum social media
              impact. For more content creation tips, check out our
              <a href="/blog" className="link-primary">
                content creation blog
              </a>
              with expert guides and tutorials.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Perfect for Content Creators & Marketers
            </h2>
            <p>
              Whether you're promoting a new episode, sharing key takeaways, or
              creating teaser content, our caption generator helps you maintain
              a consistent social media presence without the time-consuming
              manual work. The AI understands your podcast's unique voice and
              creates captions that match your brand's tone and style, helping
              you build a stronger connection with your audience across all
              social platforms.
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
                    YouTube Thumbnail Maker
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
                    href="/free-ai-audiogram-generator"
                    className="link-primary"
                  >
                    AI Audiogram Creator
                  </a>
                </h3>
                <p className="text-sm text-gray-300">
                  Transform audio content into stunning visual audiograms for
                  social media.
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
        </div>

        {/* Embedded Tool */}
        <div className="bg-gray-800 rounded-lg p-6">
          <CaptionTool />
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
