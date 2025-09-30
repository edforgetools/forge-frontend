import React from "react";
import BlogPost from "../blog/BlogPost";
import { getBlogPost } from "../blog/blogData";

export default function BlogPostPage() {
  // Get slug from URL path
  const path = window.location.pathname;
  const slug = path.replace("/blog/", "");

  const blogPost = getBlogPost(slug);

  if (!blogPost) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <a
            href="/blog"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  const { component: Component } = blogPost;
  const frontmatter = {
    title: blogPost.title,
    excerpt: blogPost.excerpt,
    date: blogPost.date,
    author: blogPost.author,
    tags: blogPost.tags,
    featured: blogPost.featured,
  };

  return (
    <BlogPost frontmatter={frontmatter}>
      <Component />
    </BlogPost>
  );
}
