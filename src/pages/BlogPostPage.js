import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import BlogPost from "../blog/BlogPost";
import { getBlogPost } from "../blog/blogData";
export default function BlogPostPage() {
    // Get slug from URL path
    const path = window.location.pathname;
    const slug = path.replace("/blog/", "");
    const blogPost = getBlogPost(slug);
    if (!blogPost) {
        return (_jsx("div", { className: "min-h-screen bg-gray-900 text-white flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Post Not Found" }), _jsx("p", { className: "text-gray-400 mb-8", children: "The blog post you're looking for doesn't exist." }), _jsx("a", { href: "/blog", className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors", children: "Back to Blog" })] }) }));
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
    return (_jsx(BlogPost, { frontmatter: frontmatter, children: _jsx(Component, {}) }));
}
