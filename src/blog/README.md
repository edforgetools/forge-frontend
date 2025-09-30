# Blog Structure

This directory contains the blog scaffolding for Forge Tools. The blog is built with MDX and is designed to be backlog-ready for V1.

## Structure

```
src/blog/
├── BlogLayout.tsx          # Main blog layout component
├── BlogList.tsx           # Blog post listing component
├── BlogPost.tsx           # Individual blog post component
├── posts/                 # MDX blog posts
│   ├── free-youtube-thumbnail-tool-guide.mdx
│   └── free-podcast-caption-generator-guide.mdx
└── README.md              # This file
```

## Features

- **MDX Pipeline**: Configured with Vite MDX plugin for rich content
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **SEO Optimized**: Proper meta tags and structured data
- **Navigation**: Integrated with main app routing
- **Stub Content**: Ready-to-use example posts

## Adding New Posts

1. Create a new `.mdx` file in `src/blog/posts/`
2. Add frontmatter with required fields:
   ```yaml
   ---
   title: "Your Post Title"
   excerpt: "Brief description"
   date: "2024-01-01"
   author: "Author Name"
   tags: ["tag1", "tag2"]
   featured: false
   ---
   ```
3. Add the post to the blog posts data in `src/pages/BlogPage.tsx`
4. Import the MDX component in `src/pages/BlogPostPage.tsx`

## Routes

- `/blog` - Blog listing page
- `/blog/{slug}` - Individual blog post pages

## Dependencies

- `@mdx-js/react` - MDX React integration
- `@mdx-js/mdx` - MDX compiler
- `@vitejs/plugin-mdx` - Vite MDX plugin

## Status

✅ **Backlog Ready** - Structure is complete and ready for V1 implementation
