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
          // Vendor chunks - more granular splitting
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui/react-dialog")) {
              return "vendor-dialog";
            }
            if (id.includes("@radix-ui/react-select")) {
              return "vendor-select";
            }
            if (id.includes("@radix-ui/react-slider")) {
              return "vendor-slider";
            }
            if (id.includes("@radix-ui/react-checkbox")) {
              return "vendor-checkbox";
            }
            if (id.includes("@radix-ui/react-label")) {
              return "vendor-label";
            }
            if (id.includes("@radix-ui/react-popover")) {
              return "vendor-popover";
            }
            if (id.includes("@radix-ui/react-tooltip")) {
              return "vendor-tooltip";
            }
            if (id.includes("@radix-ui/react-toast")) {
              return "vendor-toast";
            }
            if (id.includes("@radix-ui/react-separator")) {
              return "vendor-separator";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("clsx") || id.includes("tailwind")) {
              return "vendor-utils";
            }
            if (id.includes("@vercel/analytics")) {
              return "vendor-analytics";
            }
            return "vendor-misc";
          }
          // App chunks - more specific splitting
          if (id.includes("src/components/ui")) {
            return "ui-components";
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
            id.includes("src/components") &&
            !id.includes("src/components/ui")
          ) {
            return "components";
          }
          if (id.includes("src/hooks")) {
            return "hooks";
          }
          if (id.includes("src/lib")) {
            return "lib";
          }
          if (id.includes("src/pages/app")) {
            return "editor-page";
          }
          if (id.includes("src/pages")) {
            return "pages";
          }
        },
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()
            : "chunk";
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
