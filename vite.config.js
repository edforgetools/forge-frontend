import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
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
        // Enable tree-shaking
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    // Vendor chunks
                    if (id.includes("node_modules")) {
                        if (id.includes("react") || id.includes("react-dom")) {
                            return "vendor-react";
                        }
                        if (id.includes("@radix-ui")) {
                            return "vendor-ui";
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
                        return "vendor-misc";
                    }
                    // App chunks
                    if (id.includes("src/components")) {
                        return "components";
                    }
                    if (id.includes("src/hooks")) {
                        return "hooks";
                    }
                    if (id.includes("src/lib")) {
                        return "lib";
                    }
                },
            },
        },
        // Enable source maps for better debugging
        sourcemap: true,
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
        // Optimize for performance
        minify: "esbuild",
        // Target modern browsers for smaller bundles
        target: "esnext",
        // Enable CSS code splitting
        cssCodeSplit: true,
    },
    // Enable bundle analysis in development
    define: {
        __BUNDLE_ANALYZER__: process.env.ANALYZE === "true",
    },
});
