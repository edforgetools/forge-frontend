import React from "react";
import BlogLayout from "./BlogLayout";

interface BlogPostProps {
  frontmatter: {
    title: string;
    excerpt: string;
    date: string;
    author: string;
    tags: string[];
    featured?: boolean;
  };
  children: React.ReactNode;
}

export default function BlogPost({ frontmatter, children }: BlogPostProps) {
  return (
    <BlogLayout
      title={frontmatter.title}
      description={frontmatter.excerpt}
      author={frontmatter.author}
      date={frontmatter.date}
      tags={frontmatter.tags}
    >
      <article className="prose prose-invert max-w-none">
        {/* Post Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <span>{frontmatter.date}</span>
            <span>•</span>
            <span>{frontmatter.author}</span>
            {frontmatter.featured && (
              <>
                <span>•</span>
                <span className="bg-blue-500 px-2 py-1 rounded text-xs font-medium text-white">
                  FEATURED
                </span>
              </>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4 text-white">
            {frontmatter.title}
          </h1>

          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            {frontmatter.excerpt}
          </p>

          <div className="flex flex-wrap gap-2">
            {frontmatter.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Post Content */}
        <div className="prose prose-invert max-w-none">{children}</div>

        {/* Post Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Ready to get started?
            </h3>
            <p className="text-gray-300 mb-4">
              Try our free tools and start creating professional content today.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/free-youtube-thumbnail-tool"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                YouTube Thumbnails
              </a>
              <a
                href="/free-podcast-caption-generator"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Podcast Captions
              </a>
              <a
                href="/free-ai-audiogram-generator"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                AI Audiograms
              </a>
            </div>
          </div>
        </footer>
      </article>
    </BlogLayout>
  );
}
