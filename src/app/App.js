import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import ForgePlusDashboard from "../ForgePlusDashboard";
import ThumbTool from "../tools/thumb/ThumbTool";
import ThumbnailToolPage from "../pages/ThumbnailToolPage";
import CaptionToolPage from "../pages/CaptionToolPage";
import AudiogramToolPage from "../pages/AudiogramToolPage";
import ClipperToolPage from "../pages/ClipperToolPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import PlanSelector from "../components/PlanSelector";
import { trackPageView, initSession, trackActivity, trackToolDiscovery, } from "../lib/metrics";
export default function App() {
    const [tab, setTab] = useState("captions");
    const [route, setRoute] = useState("home");
    // Initialize session tracking
    useEffect(() => {
        initSession();
    }, []);
    // Simple routing based on URL path
    useEffect(() => {
        const path = window.location.pathname;
        let newRoute;
        switch (path) {
            case "/free-youtube-thumbnail-tool":
                newRoute = "free-youtube-thumbnail-tool";
                break;
            case "/free-podcast-caption-generator":
                newRoute = "free-podcast-caption-generator";
                break;
            case "/free-ai-audiogram-generator":
                newRoute = "free-ai-audiogram-generator";
                break;
            case "/clip-short-video-automatically":
                newRoute = "clip-short-video-automatically";
                break;
            case "/blog":
                newRoute = "blog";
                break;
            case "/undo-redo-test":
                newRoute = "undo-redo-test";
                break;
            default:
                if (path.startsWith("/blog/")) {
                    newRoute = "blog-post";
                }
                else {
                    newRoute = "home";
                }
        }
        setRoute(newRoute);
        // Track page view
        trackPageView(newRoute, {
            path,
            referrer: document.referrer,
        });
    }, []);
    // Handle browser back/forward
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            let newRoute;
            switch (path) {
                case "/free-youtube-thumbnail-tool":
                    newRoute = "free-youtube-thumbnail-tool";
                    break;
                case "/free-podcast-caption-generator":
                    newRoute = "free-podcast-caption-generator";
                    break;
                case "/free-ai-audiogram-generator":
                    newRoute = "free-ai-audiogram-generator";
                    break;
                case "/clip-short-video-automatically":
                    newRoute = "clip-short-video-automatically";
                    break;
                case "/blog":
                    newRoute = "blog";
                    break;
                case "/undo-redo-test":
                    newRoute = "undo-redo-test";
                    break;
                default:
                    if (path.startsWith("/blog/")) {
                        newRoute = "blog-post";
                    }
                    else {
                        newRoute = "home";
                    }
            }
            setRoute(newRoute);
            // Track page view for navigation
            trackPageView(newRoute, {
                path,
                navigation: "browser_back_forward",
            });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);
    // Render different pages based on route
    if (route === "free-youtube-thumbnail-tool") {
        return (_jsx(HelmetProvider, { children: _jsx(ThumbnailToolPage, {}) }));
    }
    if (route === "free-podcast-caption-generator") {
        return (_jsx(HelmetProvider, { children: _jsx(CaptionToolPage, {}) }));
    }
    if (route === "free-ai-audiogram-generator") {
        return (_jsx(HelmetProvider, { children: _jsx(AudiogramToolPage, {}) }));
    }
    if (route === "clip-short-video-automatically") {
        return (_jsx(HelmetProvider, { children: _jsx(ClipperToolPage, {}) }));
    }
    if (route === "blog") {
        return (_jsx(HelmetProvider, { children: _jsx(BlogPage, {}) }));
    }
    if (route === "blog-post") {
        return (_jsx(HelmetProvider, { children: _jsx(BlogPostPage, {}) }));
    }
    // Default home page with existing functionality
    return (_jsxs(HelmetProvider, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "Forge Tools - Free AI-Powered Content Creation Tools" }), _jsx("meta", { name: "description", content: "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite." }), _jsx("meta", { name: "keywords", content: "content creation tools, AI tools, YouTube thumbnail maker, podcast caption generator, audiogram creator, video clipper, social media tools, free content tools" }), _jsx("meta", { property: "og:title", content: "Forge Tools - Free AI-Powered Content Creation Tools" }), _jsx("meta", { property: "og:description", content: "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite." }), _jsx("meta", { property: "og:type", content: "website" }), _jsx("meta", { name: "twitter:card", content: "summary_large_image" }), _jsx("meta", { name: "twitter:title", content: "Forge Tools - Free AI-Powered Content Creation Tools" }), _jsx("meta", { name: "twitter:description", content: "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite." }), _jsx("script", { type: "application/ld+json", children: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            name: "Forge Tools",
                            description: "Create professional content with Forge's free AI tools: YouTube thumbnails, podcast captions, audiograms, and video clips. Boost your social media presence with our powerful content creation suite.",
                            url: "https://forge-frontend.vercel.app",
                            applicationCategory: "MultimediaApplication",
                            operatingSystem: "Web Browser",
                            offers: {
                                "@type": "Offer",
                                price: "0",
                                priceCurrency: "USD",
                            },
                            creator: {
                                "@type": "Organization",
                                name: "Forge Tools",
                            },
                            featureList: [
                                "YouTube Thumbnail Generator",
                                "Podcast Caption Generator",
                                "AI Audiogram Creator",
                                "Automatic Video Clipper",
                            ],
                        }) })] }), _jsxs("div", { className: "p-4 max-w-5xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-6 text-center text-white", children: "Free AI-Powered Content Creation Tools" }), _jsxs("div", { className: "max-w-4xl mx-auto space-y-4 text-lg leading-relaxed text-white mb-8", children: [_jsx("p", { children: "Create professional content with Forge's suite of free AI-powered tools. Generate eye-catching YouTube thumbnails, engaging podcast captions, stunning audiograms, and viral-ready video clips. Perfect for content creators, podcasters, and marketers looking to maximize their social media impact." }), _jsx("h2", { className: "text-2xl font-semibold mt-8 mb-4", children: "Our Free Content Creation Tools" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "bg-gray-800 rounded-lg p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: _jsx("a", { href: "/free-youtube-thumbnail-tool", className: "text-blue-400 hover:text-blue-300", onClick: () => trackToolDiscovery("youtube-thumbnail", "homepage"), children: "YouTube Thumbnail Generator" }) }), _jsx("p", { className: "text-gray-300", children: "Create eye-catching YouTube thumbnails that get more clicks. Upload images, add text overlays, and design professional thumbnails optimized for maximum engagement." })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: _jsx("a", { href: "/free-podcast-caption-generator", className: "text-blue-400 hover:text-blue-300", onClick: () => trackToolDiscovery("podcast-caption", "homepage"), children: "Podcast Caption Generator" }) }), _jsx("p", { className: "text-gray-300", children: "Generate engaging social media captions from your podcast episodes. Upload audio files to get automatic transcription and AI-optimized captions for all platforms." })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: _jsx("a", { href: "/free-ai-audiogram-generator", className: "text-blue-400 hover:text-blue-300", onClick: () => trackToolDiscovery("ai-audiogram", "homepage"), children: "AI Audiogram Creator" }) }), _jsx("p", { className: "text-gray-300", children: "Transform your audio content into stunning visual audiograms. Perfect for social media marketing with automatic transcription and professional design." })] }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: _jsx("a", { href: "/clip-short-video-automatically", className: "text-blue-400 hover:text-blue-300", onClick: () => trackToolDiscovery("video-clipper", "homepage"), children: "Automatic Video Clipper" }) }), _jsx("p", { className: "text-gray-300", children: "Automatically generate short video clips from longer content. Our AI identifies the most engaging moments for TikTok, Instagram Reels, and YouTube Shorts." })] })] }), _jsx("h2", { className: "text-2xl font-semibold mt-8 mb-4", children: "Why Choose Forge Tools?" }), _jsx("p", { children: "All our tools are completely free to use with no watermarks or limitations. Powered by advanced AI technology, they're designed to help content creators save time while producing professional-quality content that drives engagement and grows your audience across all social media platforms." }), _jsx("h2", { className: "text-2xl font-semibold mt-8 mb-4", children: "Learn & Grow" }), _jsx("p", { className: "mb-6", children: "Get expert tips, tutorials, and insights to maximize your content creation potential. Our blog covers everything from YouTube optimization to social media strategies." }), _jsxs("div", { className: "bg-gray-800 rounded-lg p-6 mb-8", children: [_jsx("h3", { className: "text-xl font-semibold mb-3", children: _jsx("a", { href: "/blog", className: "text-blue-400 hover:text-blue-300", onClick: () => trackToolDiscovery("blog", "homepage"), children: "\uD83D\uDCDA Content Creation Blog" }) }), _jsx("p", { className: "text-gray-300", children: "Learn how to create professional content with our comprehensive guides. From YouTube thumbnail design to podcast caption strategies, we've got you covered." })] })] })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("nav", { className: "flex gap-2", children: [_jsx("button", { className: `btn ${tab === "captions" ? "border-white" : ""}`, onClick: () => {
                                            setTab("captions");
                                            trackActivity("tab_switch");
                                            trackToolDiscovery("captions", "homepage");
                                        }, children: "Captions" }), _jsx("button", { className: `btn ${tab === "thumb" ? "border-white" : ""}`, onClick: () => {
                                            setTab("thumb");
                                            trackActivity("tab_switch");
                                            trackToolDiscovery("thumbnail", "homepage");
                                        }, children: "Thumbnail" })] }), _jsx(PlanSelector, {})] }), tab === "captions" ? _jsx(ForgePlusDashboard, {}) : _jsx(ThumbTool, {})] })] }));
}
