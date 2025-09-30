import React from "react";
import { Helmet } from "react-helmet-async";
import BlogLayout from "../blog/BlogLayout";
import BlogList from "../blog/BlogList";
import { blogPosts } from "../blog/blogData";

export default function BlogPage() {
  return (
    <BlogLayout
      title="Forge Blog"
      description="Tips, tutorials, and insights for content creators using AI-powered tools"
    >
      <Helmet>
        <title>Blog | Forge Tools - Content Creation Tips & Tutorials</title>
        <meta
          name="description"
          content="Learn how to create professional content with our free AI tools. Get tips on YouTube thumbnails, podcast captions, audiograms, and more."
        />
        <meta
          name="keywords"
          content="content creation blog, YouTube thumbnail tips, podcast caption guide, social media marketing, AI tools tutorial"
        />
        <meta
          property="og:title"
          content="Blog | Forge Tools - Content Creation Tips & Tutorials"
        />
        <meta
          property="og:description"
          content="Learn how to create professional content with our free AI tools. Get tips on YouTube thumbnails, podcast captions, audiograms, and more."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Blog | Forge Tools - Content Creation Tips & Tutorials"
        />
        <meta
          name="twitter:description"
          content="Learn how to create professional content with our free AI tools. Get tips on YouTube thumbnails, podcast captions, audiograms, and more."
        />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-white">
          Content Creation Blog
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          Learn how to create professional content with our free AI-powered
          tools. Get expert tips, tutorials, and insights to boost your social
          media presence and grow your audience.
        </p>
      </div>

      <BlogList posts={blogPosts} />

      {/* Newsletter Signup */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Stay Updated</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Get the latest content creation tips, tool updates, and exclusive
          tutorials delivered straight to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <label htmlFor="email-subscription" className="sr-only">
            Email address for newsletter subscription
          </label>
          <input
            id="email-subscription"
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="text-blue-100 text-sm mt-4">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </BlogLayout>
  );
}
