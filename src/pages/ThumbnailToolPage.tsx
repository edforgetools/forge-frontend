import React from "react";
import { Helmet } from "react-helmet-async";
import ThumbTool from "../tools/thumb/ThumbTool";

export default function ThumbnailToolPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Helmet>
        <title>
          Free YouTube Thumbnail Maker - AI-Powered Thumbnail Generator 2024
        </title>
        <meta
          name="description"
          content="Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <meta
          name="keywords"
          content="youtube thumbnail maker, free thumbnail generator, youtube thumbnail tool, thumbnail creator, youtube thumbnail design, AI thumbnail generator, youtube CTR, click-through rate"
        />
        <meta
          property="og:title"
          content="Free YouTube Thumbnail Maker - AI-Powered Thumbnail Generator 2024"
        />
        <meta
          property="og:description"
          content="Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Free YouTube Thumbnail Maker - AI-Powered Thumbnail Generator 2024"
        />
        <meta
          name="twitter:description"
          content="Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Free YouTube Thumbnail Maker",
            description:
              "Create viral YouTube thumbnails in seconds with our free AI-powered thumbnail generator. Upload images, add text overlays, and design click-worthy thumbnails that boost CTR and views.",
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
                href="/free-podcast-caption-generator"
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
            Free YouTube Thumbnail Maker - AI-Powered Generator
          </h1>

          <div className="max-w-4xl mx-auto space-y-4 text-lg leading-relaxed">
            <p>
              Create viral YouTube thumbnails in seconds with our free
              AI-powered thumbnail generator. Upload your images or capture
              frames from videos, add custom text overlays, and design
              click-worthy thumbnails that boost CTR and views. Our advanced AI
              technology analyzes your content to create thumbnails optimized
              for maximum engagement. Learn more about
              <a href="/blog" className="link-primary">
                YouTube thumbnail best practices
              </a>
              in our comprehensive guides.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Why Our YouTube Thumbnail Tool Works
            </h2>
            <p>
              Our free YouTube thumbnail maker supports multiple aspect ratios
              (16:9, 9:16, 1:1), text presets, overlay images, and smart
              positioning features. Export high-quality thumbnails under 2MB to
              meet YouTube's requirements and boost your channel's performance.
              Whether you're a beginner or an experienced YouTuber, our
              intuitive interface makes it easy to create thumbnails that stand
              out in the crowded YouTube landscape.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Advanced Features for Content Creators
            </h2>
            <p>
              The tool includes advanced features like automatic text sizing,
              color contrast optimization, and template suggestions based on
              your content type. You can also save your designs as templates for
              future use, ensuring brand consistency across all your videos.
              Perfect for gaming channels, educational content, vlogs, and any
              other YouTube niche that needs compelling visual content.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              More Free Content Creation Tools
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href="/free-podcast-caption-generator"
                    className="link-primary"
                  >
                    Podcast Caption Generator
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
          <ThumbTool />
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
