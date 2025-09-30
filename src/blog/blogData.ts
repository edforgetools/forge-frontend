import GettingStartedPost from "./posts/getting-started-with-forge-tools.mdx";
import ThumbnailBestPracticesPost from "./posts/youtube-thumbnail-best-practices.mdx";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  featured: boolean;
  component: React.ComponentType;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "getting-started-with-forge-tools",
    title: "Getting Started with Forge Tools: Your Complete Guide",
    excerpt:
      "Learn how to create professional content with our free AI-powered tools. From YouTube thumbnails to podcast captions, we've got you covered.",
    date: "2024-01-15",
    author: "Forge Team",
    tags: ["tutorial", "getting-started", "content-creation"],
    featured: true,
    component: GettingStartedPost,
  },
  {
    slug: "youtube-thumbnail-best-practices",
    title:
      "YouTube Thumbnail Best Practices: 10 Tips for Higher Click-Through Rates",
    excerpt:
      "Discover proven strategies to create thumbnails that drive more clicks and boost your YouTube channel's performance.",
    date: "2024-01-10",
    author: "Forge Team",
    tags: ["youtube", "thumbnails", "design", "marketing"],
    featured: false,
    component: ThumbnailBestPracticesPost,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
