import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { apiCaptions, apiExportZip } from "../lib/api";
import { logEvent } from "../lib/logEvent";
import { trackFirstFileUpload, trackFirstExport, trackToolUse, trackActivity, trackError, trackActivation, } from "../lib/metrics";
export default function CaptionTool() {
    const [transcript, setTranscript] = useState("");
    const [selectedPlatforms, setSelectedPlatforms] = useState([
        "youtube",
    ]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!file.name.toLowerCase().endsWith(".txt")) {
            setError("Please upload a .txt file");
            trackError("invalid_file_type", {
                fileType: file.type,
                fileName: file.name,
            });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            setTranscript(content);
            setError(null);
            // Track file upload
            trackFirstFileUpload("caption-tool", "txt");
            trackActivity("file_upload");
        };
        reader.readAsText(file);
    };
    const handlePlatformChange = (platform) => {
        setSelectedPlatforms((prev) => {
            const newPlatforms = prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform];
            // Track platform selection
            trackActivity("platform_selection");
            trackToolUse("caption-tool", "platform_change", {
                platform,
                selectedPlatforms: newPlatforms,
            });
            return newPlatforms;
        });
    };
    const handleGenerate = async () => {
        if (!transcript.trim()) {
            setError("Please enter a transcript or upload a .txt file");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await apiCaptions({
                transcript: transcript.trim(),
                tone: "default",
            });
            setResults(response);
            // Track successful generation
            trackActivation("caption_generate", {
                transcriptLength: transcript.length,
                platforms: selectedPlatforms,
            });
            trackActivity("caption_generation");
            logEvent("captions_generated", {
                transcriptLength: transcript.length,
                platforms: selectedPlatforms,
            });
        }
        catch (err) {
            setError(err.message || "Failed to generate captions");
            // Track error
            trackError("caption_generation_failed", {
                message: err.message,
                transcriptLength: transcript.length,
            });
            logEvent("error_captions", {
                message: err.message,
                transcriptLength: transcript.length,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleExportZip = async () => {
        if (!results)
            return;
        setLoading(true);
        setError(null);
        try {
            const captions = {};
            selectedPlatforms.forEach((platform) => {
                if (platform === "youtube" && results.youtube) {
                    captions[platform] = results.youtube;
                }
                else if (platform === "tiktok" && results.tweet) {
                    captions[platform] = results.tweet;
                }
                else if (platform === "instagram" && results.instagram) {
                    captions[platform] = results.instagram;
                }
            });
            const response = await apiExportZip({
                platforms: selectedPlatforms,
                captions,
            });
            // Track successful export
            trackFirstExport("caption-tool", "zip");
            trackActivity("export");
            trackToolUse("caption-tool", "export", { platforms: selectedPlatforms });
            // Create download link
            const link = document.createElement("a");
            link.href = response.downloadUrl;
            link.download = "captions.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            logEvent("export_zip", {
                platforms: selectedPlatforms,
                captionCount: Object.keys(captions).length,
            });
        }
        catch (err) {
            setError(err.message || "Failed to export ZIP");
            logEvent("error_export", {
                message: err.message,
            });
        }
        finally {
            setLoading(false);
        }
    };
    const canGenerate = transcript.trim().length > 0 && !loading;
    const canExport = results && selectedPlatforms.length > 0 && !loading;
    return (_jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "transcript-textarea", className: "block text-sm font-medium text-text-primary", children: "Transcript" }), _jsx("textarea", { id: "transcript-textarea", className: "w-full border rounded p-3 h-32 bg-bg-secondary border-gray-600 text-text-primary", value: transcript, onChange: (e) => setTranscript(e.target.value), placeholder: "Paste your transcript here or upload a .txt file...", "aria-describedby": "transcript-help" }), _jsx("div", { id: "transcript-help", className: "text-sm text-text-muted", children: "Enter your podcast transcript or upload a .txt file to generate social media captions" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { htmlFor: "transcript-file", className: "sr-only", children: "Upload transcript file" }), _jsx("input", { id: "transcript-file", ref: fileInputRef, type: "file", accept: ".txt", onChange: handleFileUpload, className: "hidden" }), _jsx("button", { className: "btn", onClick: () => fileInputRef.current?.click(), disabled: loading, "aria-describedby": "file-upload-help", children: "Upload .txt File" }), _jsx("span", { id: "file-upload-help", className: "text-sm text-gray-400", children: "Optional: Upload a .txt file with your transcript" })] })] }), _jsxs("fieldset", { className: "space-y-2", children: [_jsx("legend", { className: "block text-sm font-medium text-text-primary", children: "Select Platforms" }), _jsx("div", { className: "flex gap-4", role: "group", "aria-labelledby": "platform-legend", children: ["youtube", "tiktok", "instagram"].map((platform) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: selectedPlatforms.includes(platform), onChange: () => handlePlatformChange(platform), disabled: loading, className: "rounded", "aria-describedby": `${platform}-help` }), _jsx("span", { className: "text-sm capitalize text-text-primary", children: platform }), _jsxs("span", { id: `${platform}-help`, className: "sr-only", children: ["Generate captions for ", platform] })] }, platform))) })] }), error && (_jsx("div", { className: "text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3", children: error })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { className: "btn", onClick: handleGenerate, disabled: !canGenerate, children: loading ? "Generating..." : "Generate Captions" }), results && (_jsx("button", { className: "btn", onClick: handleExportZip, disabled: !canExport, children: loading ? "Exporting..." : "Export ZIP" }))] }), results && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Generated Captions" }), _jsxs("div", { className: "grid gap-4", children: [selectedPlatforms.includes("youtube") && results.youtube && (_jsxs("div", { className: "border rounded p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "YouTube" }), _jsx("p", { className: "text-sm whitespace-pre-wrap", children: results.youtube })] })), selectedPlatforms.includes("tiktok") && results.tweet && (_jsxs("div", { className: "border rounded p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "TikTok" }), _jsx("p", { className: "text-sm whitespace-pre-wrap", children: results.tweet })] })), selectedPlatforms.includes("instagram") && results.instagram && (_jsxs("div", { className: "border rounded p-4", children: [_jsx("h4", { className: "font-medium mb-2", children: "Instagram" }), _jsx("p", { className: "text-sm whitespace-pre-wrap", children: results.instagram })] }))] })] }))] }));
}
