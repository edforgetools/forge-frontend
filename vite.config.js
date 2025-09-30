import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import path from "path";
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        mdx({
            jsxImportSource: "react",
            providerImportSource: "@mdx-js/react",
            remarkPlugins: [],
            rehypePlugins: [],
        }),
    ],
    resolve: { alias: { "@": path.resolve(__dirname, "src") } },
    base: "/",
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: mode !== "production",
        minify: mode === "production" ? "esbuild" : false,
        rollupOptions: {
            input: {
                main: "./index.html",
                "free-youtube-thumbnail-tool": "./free-youtube-thumbnail-tool.html",
                "free-podcast-caption-generator": "./free-podcast-caption-generator.html",
                "free-ai-audiogram-generator": "./free-ai-audiogram-generator.html",
                "clip-short-video-automatically": "./clip-short-video-automatically.html",
                blog: "./blog.html",
            },
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    },
    envPrefix: "VITE_",
}));
