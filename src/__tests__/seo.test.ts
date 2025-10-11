import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("SEO Meta Tags", () => {
  it("should have all required meta tags in index.html", () => {
    // Read the index.html file
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    // Required meta tags (using more flexible matching)
    const requiredTags = [
      // Basic meta tags
      '<meta charset="UTF-8" />',
      'name="viewport"',
      "<title>Snapthumb - Create Perfect 16:9 Thumbnails</title>",
      'name="description"',

      // OpenGraph tags
      'property="og:title"',
      'property="og:description"',
      '<meta property="og:type" content="website" />',
      'property="og:url"',
      'property="og:image"',
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      '<meta property="og:site_name" content="Snapthumb" />',

      // Twitter Card tags
      '<meta name="twitter:card" content="summary_large_image" />',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',

      // SEO tags
      'name="keywords"',
      '<meta name="author" content="Forge Tools" />',
      '<meta name="robots" content="index, follow" />',
      '<link rel="canonical"',

      // Performance hints
      '<link rel="preconnect"',
      '<link rel="dns-prefetch"',
      '<meta name="format-detection" content="telephone=no" />',
    ];

    // Check each required tag
    for (const tag of requiredTags) {
      expect(html).toContain(tag);
    }
  });

  it("should have JSON-LD structured data", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    // Check for JSON-LD script tag
    expect(html).toContain('<script type="application/ld+json">');

    // Check for required JSON-LD properties
    const jsonLdContent = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1];
    expect(jsonLdContent).toBeDefined();

    if (jsonLdContent) {
      const structuredData = JSON.parse(jsonLdContent);

      // Validate required fields
      expect(structuredData["@context"]).toBe("https://schema.org");
      expect(structuredData["@type"]).toBe("SoftwareApplication");
      expect(structuredData.name).toBe("Snapthumb");
      expect(structuredData.description).toContain(
        "Create perfect 16:9 thumbnails"
      );
      expect(structuredData.url).toBe("https://snapthumb.tools/");
      expect(structuredData.applicationCategory).toBe("MultimediaApplication");
      expect(structuredData.operatingSystem).toBe("Web Browser");
      expect(structuredData.creator["@type"]).toBe("Organization");
      expect(structuredData.creator.name).toBe("Forge Tools");
      expect(structuredData.featureList).toBeInstanceOf(Array);
      expect(structuredData.featureList.length).toBeGreaterThan(0);
    }
  });

  it("should have proper OpenGraph image dimensions", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    // Check for proper OG image dimensions (1200x630 is the recommended size)
    expect(html).toContain('<meta property="og:image:width" content="1200" />');
    expect(html).toContain('<meta property="og:image:height" content="630" />');
  });

  it("should have canonical URL pointing to production domain", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    expect(html).toContain(
      '<link rel="canonical" href="https://snapthumb.tools/" />'
    );
  });

  it("should have proper viewport meta tag for mobile", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    expect(html).toContain('name="viewport"');
    expect(html).toContain(
      "width=device-width, initial-scale=1, viewport-fit=cover"
    );
  });

  it("should have performance optimization hints", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    // Check for preconnect hints
    expect(html).toContain(
      '<link rel="preconnect" href="https://fonts.googleapis.com" />'
    );
    expect(html).toContain(
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />'
    );

    // Check for DNS prefetch
    expect(html).toContain(
      '<link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />'
    );

    // Check for module preloading
    expect(html).toContain('<link rel="modulepreload" href="/src/main.tsx" />');
    expect(html).toContain('<link rel="modulepreload" href="/src/App.tsx" />');

    // Check for CSS preloading
    expect(html).toContain(
      '<link rel="preload" href="/src/styles/globals.css" as="style" />'
    );
  });

  it("should have proper robots meta tag for indexing", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    expect(html).toContain('<meta name="robots" content="index, follow" />');
  });

  it("should have comprehensive keywords for SEO", () => {
    const htmlPath = resolve(process.cwd(), "index.html");
    const html = readFileSync(htmlPath, "utf-8");

    const keywordsMatch = html.match(
      /<meta name="keywords" content="([^"]*)" \/>/
    );
    expect(keywordsMatch).toBeDefined();

    if (keywordsMatch) {
      const keywords = keywordsMatch[1];
      const expectedKeywords = [
        "thumbnail maker",
        "video thumbnail",
        "image crop",
        "16:9 aspect ratio",
        "video frame extractor",
        "thumbnail generator",
        "online image editor",
        "video thumbnail creator",
      ];

      for (const keyword of expectedKeywords) {
        expect(keywords).toContain(keyword);
      }
    }
  });
});
