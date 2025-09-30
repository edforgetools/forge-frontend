export const TEXT_PRESETS = [
    {
        id: "youtube-bold",
        name: "YouTube Bold",
        description: "Bold white text with black outline - perfect for YouTube thumbnails",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 72,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 8,
        opacity: 1,
    },
    {
        id: "tiktok-white-outline",
        name: "TikTok White Outline",
        description: "Clean white text with subtle outline for TikTok vertical videos",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 64,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 4,
        opacity: 1,
    },
    {
        id: "instagram-clean",
        name: "Instagram Clean",
        description: "Minimalist style perfect for Instagram square posts",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "600",
        fontSize: 56,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 6,
        opacity: 0.95,
    },
    {
        id: "twitter-trending",
        name: "Twitter Trending",
        description: "High contrast style that stands out on Twitter feeds",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 68,
        fill: "#ffffff",
        stroke: "#1da1f2",
        strokeWidth: 10,
        opacity: 1,
    },
    {
        id: "linkedin-professional",
        name: "LinkedIn Professional",
        description: "Clean, professional style for business content",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "500",
        fontSize: 60,
        fill: "#ffffff",
        stroke: "#0077b5",
        strokeWidth: 5,
        opacity: 0.9,
    },
    {
        id: "facebook-engaging",
        name: "Facebook Engaging",
        description: "Eye-catching style optimized for Facebook's algorithm",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 70,
        fill: "#ffffff",
        stroke: "#1877f2",
        strokeWidth: 8,
        opacity: 1,
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean, simple style with no stroke for modern designs",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "400",
        fontSize: 58,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 0,
        opacity: 0.9,
    },
    {
        id: "neon-glow",
        name: "Neon Glow",
        description: "Bright, attention-grabbing style with thick stroke",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 66,
        fill: "#00ffff",
        stroke: "#ff00ff",
        strokeWidth: 12,
        opacity: 1,
        isPremium: true,
    },
    {
        id: "vintage-retro",
        name: "Vintage Retro",
        description: "Classic style with warm colors for nostalgic content",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 62,
        fill: "#ffd700",
        stroke: "#8b4513",
        strokeWidth: 6,
        opacity: 1,
        isPremium: true,
    },
    {
        id: "dark-mode",
        name: "Dark Mode",
        description: "Dark text with light stroke for dark backgrounds",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        fontWeight: "bold",
        fontSize: 64,
        fill: "#000000",
        stroke: "#ffffff",
        strokeWidth: 4,
        opacity: 1,
        isPremium: true,
    },
];
export function getPresetById(id) {
    return TEXT_PRESETS.find((preset) => preset.id === id);
}
export function getPresetsByCategory(category) {
    // For now, return all presets. In the future, we can add category filtering
    return TEXT_PRESETS;
}
export function getAvailablePresets(hasPremiumAccess) {
    if (hasPremiumAccess) {
        return TEXT_PRESETS;
    }
    return TEXT_PRESETS.filter((preset) => !preset.isPremium);
}
export function isPresetPremium(presetId) {
    const preset = getPresetById(presetId);
    return preset?.isPremium || false;
}
