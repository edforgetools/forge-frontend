declare module "*.mdx" {
  import { ComponentType } from "react";

  const MDXComponent: ComponentType<any>;
  export default MDXComponent;

  export const frontmatter: {
    title: string;
    excerpt: string;
    date: string;
    author: string;
    tags: string[];
    featured?: boolean;
  };
}
