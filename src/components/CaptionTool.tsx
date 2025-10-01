import React, { useState, useRef } from "react";
import { apiCaptions, apiExportZip } from "../lib/api";
import { logEvent } from "../lib/logEvent";
import {
  trackFirstFileUpload,
  trackFirstExport,
  trackToolUse,
  trackActivity,
  trackError,
  trackActivation,
} from "../lib/metrics";

type Platform = "youtube" | "tiktok" | "instagram";

interface CaptionResults {
  tweet: string;
  instagram: string;
  youtube: string;
}

export default function CaptionTool() {
  const [transcript, setTranscript] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "youtube",
  ]);
  const [results, setResults] = useState<CaptionResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      const content = e.target?.result as string;
      setTranscript(content);
      setError(null);

      // Track file upload
      trackFirstFileUpload("caption-tool", "txt");
      trackActivity("file_upload");
    };
    reader.readAsText(file);
  };

  const handlePlatformChange = (platform: Platform) => {
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
    } catch (err: any) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleExportZip = async () => {
    if (!results) return;

    setLoading(true);
    setError(null);

    try {
      const captions: Record<string, string> = {};
      selectedPlatforms.forEach((platform) => {
        if (platform === "youtube" && results.youtube) {
          captions[platform] = results.youtube;
        } else if (platform === "tiktok" && results.tweet) {
          captions[platform] = results.tweet;
        } else if (platform === "instagram" && results.instagram) {
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
    } catch (err: any) {
      setError(err.message || "Failed to export ZIP");
      logEvent("error_export", {
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = transcript.trim().length > 0 && !loading;
  const canExport = results && selectedPlatforms.length > 0 && !loading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Transcript Input */}
      <div className="space-y-2">
        <label htmlFor="transcript-textarea" className="block text-sm font-medium text-text-primary">
          Transcript
        </label>
        <textarea
          id="transcript-textarea"
          className="w-full border rounded p-3 h-32 bg-bg-secondary border-gray-600 text-text-primary"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your transcript here or upload a .txt file..."
          aria-describedby="transcript-help"
        />
        <div id="transcript-help" className="text-sm text-text-muted">
          Enter your podcast transcript or upload a .txt file to generate social media captions
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-2">
          <label htmlFor="transcript-file" className="sr-only">
            Upload transcript file
          </label>
          <input
            id="transcript-file"
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            aria-describedby="file-upload-help"
          >
            Upload .txt File
          </button>
          <span id="file-upload-help" className="text-sm text-gray-400">
            Optional: Upload a .txt file with your transcript
          </span>
        </div>
      </div>

      {/* Platform Selection */}
      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-text-primary">Select Platforms</legend>
        <div className="flex gap-4" role="group" aria-labelledby="platform-legend">
          {(["youtube", "tiktok", "instagram"] as Platform[]).map(
            (platform) => (
              <label key={platform} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platform)}
                  onChange={() => handlePlatformChange(platform)}
                  disabled={loading}
                  className="rounded"
                  aria-describedby={`${platform}-help`}
                />
                <span className="text-sm capitalize text-text-primary">{platform}</span>
                <span id={`${platform}-help`} className="sr-only">
                  Generate captions for {platform}
                </span>
              </label>
            )
          )}
        </div>
      </fieldset>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          className="btn"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {loading ? "Generating..." : "Generate Captions"}
        </button>

        {results && (
          <button
            className="btn"
            onClick={handleExportZip}
            disabled={!canExport}
          >
            {loading ? "Exporting..." : "Export ZIP"}
          </button>
        )}
      </div>

      {/* Results Panel */}
      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Captions</h3>

          <div className="grid gap-4">
            {selectedPlatforms.includes("youtube") && results.youtube && (
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">YouTube</h4>
                <p className="text-sm whitespace-pre-wrap">{results.youtube}</p>
              </div>
            )}

            {selectedPlatforms.includes("tiktok") && results.tweet && (
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">TikTok</h4>
                <p className="text-sm whitespace-pre-wrap">{results.tweet}</p>
              </div>
            )}

            {selectedPlatforms.includes("instagram") && results.instagram && (
              <div className="border rounded p-4">
                <h4 className="font-medium mb-2">Instagram</h4>
                <p className="text-sm whitespace-pre-wrap">
                  {results.instagram}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
