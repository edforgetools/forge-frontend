import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Enable compression for better performance
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
    }),
    process.env.ANALYZE &&
      visualizer({
        filename: "dist/bundle-analysis.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Optimize for performance
    minify: "esbuild",
    // Target modern browsers for smaller bundles
    target: "es2020",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable compression
    reportCompressedSize: true,
    // Optimize for faster LCP
    assetsInlineLimit: 4096, // Inline small assets
    // Optimize dependencies
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TypeScript warnings during build
        if (
          warning.code === "PLUGIN_WARNING" &&
          warning.plugin === "typescript"
        ) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks - more granular splitting for better caching
          if (id.includes("node_modules")) {
            // React core - keep separate for better caching
            if (id.includes("react") && !id.includes("react-dom")) {
              return "vendor-react-core";
            }
            if (id.includes("react-dom")) {
              return "vendor-react-dom";
            }

            // Radix UI components - split by usage frequency
            if (
              id.includes("@radix-ui/react-dialog") ||
              id.includes("@radix-ui/react-popover")
            ) {
              return "vendor-radix-overlays";
            }
            if (
              id.includes("@radix-ui/react-select") ||
              id.includes("@radix-ui/react-dropdown-menu")
            ) {
              return "vendor-radix-forms";
            }
            if (
              id.includes("@radix-ui/react-slider") ||
              id.includes("@radix-ui/react-checkbox") ||
              id.includes("@radix-ui/react-switch")
            ) {
              return "vendor-radix-controls";
            }
            if (
              id.includes("@radix-ui/react-label") ||
              id.includes("@radix-ui/react-separator") ||
              id.includes("@radix-ui/react-tabs")
            ) {
              return "vendor-radix-layout";
            }
            if (
              id.includes("@radix-ui/react-tooltip") ||
              id.includes("@radix-ui/react-toast")
            ) {
              return "vendor-radix-feedback";
            }

            // Animation and UI libraries
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }

            // Utility libraries
            if (
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority")
            ) {
              return "vendor-utils";
            }
            if (id.includes("zod")) {
              return "vendor-validation";
            }
            if (id.includes("zustand")) {
              return "vendor-state";
            }

            // External services
            if (id.includes("@vercel/analytics")) {
              return "vendor-analytics";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "vendor-supabase";
            }
            if (id.includes("react-dropzone")) {
              return "vendor-upload";
            }
            if (id.includes("react-router-dom")) {
              return "vendor-router";
            }

            // Everything else
            return "vendor-misc";
          }

          // App chunks - more specific splitting
          if (id.includes("src/components/ui")) {
            return "ui-components";
          }
          if (id.includes("src/components/SnapthumbCanvas")) {
            return "snapthumb-components";
          }
          if (id.includes("src/components/Canvas")) {
            return "canvas-components";
          }
          if (id.includes("src/components/Export")) {
            return "export-components";
          }
          if (id.includes("src/components/Overlay")) {
            return "overlay-components";
          }
          if (
            id.includes("src/components/TextOverlay") ||
            id.includes("src/components/CanvasTextOverlay")
          ) {
            return "text-components";
          }
          if (
            id.includes("src/components/Header") ||
            id.includes("src/components/StatusBar") ||
            id.includes("src/components/StickyFooter")
          ) {
            return "layout-components";
          }
          if (
            id.includes("src/components") &&
            !id.includes("src/components/ui") &&
            !id.includes("src/components/SnapthumbCanvas")
          ) {
            return "components";
          }
          if (id.includes("src/hooks")) {
            return "hooks";
          }
          if (id.includes("src/lib")) {
            return "lib";
          }
          if (id.includes("src/state")) {
            return "state";
          }
          if (id.includes("src/pages/app")) {
            return "editor-page";
          }
          if (id.includes("src/pages")) {
            return "pages";
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: () => {
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  // Enable bundle analysis in development
  define: {
    __BUNDLE_ANALYZER__: process.env.ANALYZE === "true",
  },
});
