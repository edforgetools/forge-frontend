import React from "react";
import { Helmet } from "react-helmet-async";

interface BlogLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

export default function BlogLayout({
  children,
  title = "Forge Blog",
  description = "Tips, tutorials, and insights for content creators",
  author = "Forge Team",
  date,
  tags = [],
}: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Helmet>
        <title>{title} | Forge Blog</title>
        <meta name="description" content={description} />
        <meta name="author" content={author} />
        {tags.length > 0 && <meta name="keywords" content={tags.join(", ")} />}
        <meta property="og:title" content={`${title} | Forge Blog`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Forge Blog`} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                <a href="/" className="link-primary">
                  Forge Tools
                </a>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Free AI-Powered Content Creation
              </p>
            </div>
            <nav className="flex gap-6">
              <a
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </a>
              <a href="/blog" className="link-primary font-medium">
                Blog
              </a>
              <a
                href="/free-youtube-thumbnail-tool"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Tools
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-400">
            <a href="/" className="hover:text-white">
              Home
            </a>
            <span className="mx-2">/</span>
            <a href="/blog" className="hover:text-white">
              Blog
            </a>
            {title !== "Forge Blog" && (
              <>
                <span className="mx-2">/</span>
                <span className="text-white">{title}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Forge Tools</h3>
              <p className="text-gray-400 text-sm">
                Free AI-powered content creation tools for creators, podcasters,
                and marketers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/free-youtube-thumbnail-tool"
                    className="text-gray-400 hover:text-white"
                  >
                    YouTube Thumbnails
                  </a>
                </li>
                <li>
                  <a
                    href="/free-podcast-caption-generator"
                    className="text-gray-400 hover:text-white"
                  >
                    Podcast Captions
                  </a>
                </li>
                <li>
                  <a
                    href="/free-ai-audiogram-generator"
                    className="text-gray-400 hover:text-white"
                  >
                    Audiograms
                  </a>
                </li>
                <li>
                  <a
                    href="/clip-short-video-automatically"
                    className="text-gray-400 hover:text-white"
                  >
                    Video Clipper
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/blog" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/blog/free-youtube-thumbnail-tool-guide"
                    className="text-gray-400 hover:text-white"
                  >
                    Thumbnail Guide
                  </a>
                </li>
                <li>
                  <a
                    href="/blog/free-podcast-caption-generator-guide"
                    className="text-gray-400 hover:text-white"
                  >
                    Caption Guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Forge Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
