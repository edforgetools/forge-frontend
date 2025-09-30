import React from "react";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
}

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps) {
  const featuredPost = posts.find((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <div className="space-y-12">
      {/* Featured Post */}
      {featuredPost && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-4">
            <span className="bg-blue-500 px-2 py-1 rounded text-xs font-medium">
              FEATURED
            </span>
            <span>{featuredPost.date}</span>
            <span>•</span>
            <span>{featuredPost.author}</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            <a
              href={`/blog/${featuredPost.slug}`}
              className="hover:text-blue-200 transition-colors"
            >
              {featuredPost.title}
            </a>
          </h2>
          <p className="text-blue-100 text-lg mb-6 leading-relaxed">
            {featuredPost.excerpt}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {featuredPost.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={`/blog/${featuredPost.slug}`}
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Read More
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {regularPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.author}</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">
              <a
                href={`/blog/${post.slug}`}
                className="text-white hover:text-blue-300 transition-colors"
              >
                {post.title}
              </a>
            </h3>
            <p className="text-gray-300 mb-4 leading-relaxed">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
            <a
              href={`/blog/${post.slug}`}
              className="inline-flex items-center link-primary font-medium text-sm"
            >
              Read More
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No blog posts yet
          </h3>
          <p className="text-gray-400">
            Check back soon for content creation tips and tutorials.
          </p>
        </div>
      )}
    </div>
  );
}
