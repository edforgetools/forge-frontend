import React from "react";
import { logEvent } from "../lib/logEvent";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const PLATFORM_URLS = {
  tiktok: "https://www.tiktok.com/upload",
  youtube: "https://www.youtube.com/shorts/upload",
  instagram: "https://www.instagram.com/create/reel/",
};

export default function ExportModal({
  isOpen,
  onClose,
  onDownload,
}: ExportModalProps) {
  if (!isOpen) return null;

  const handleShareClick = (platform: keyof typeof PLATFORM_URLS) => {
    // Log the share click event
    logEvent("share_clicked", { platform });

    // Open platform URL in new tab
    window.open(PLATFORM_URLS[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Export Complete!</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className="text-neutral-300 mb-6">
          Your thumbnail has been exported successfully. Share it on your
          favorite platform!
        </p>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-300 mb-3">
            Share to:
          </h3>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleShareClick("tiktok")}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <div className="text-white font-medium">TikTok</div>
                <div className="text-xs text-neutral-400">
                  Upload your thumbnail
                </div>
              </div>
            </button>

            <button
              onClick={() => handleShareClick("youtube")}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">YT</span>
              </div>
              <div>
                <div className="text-white font-medium">YouTube Shorts</div>
                <div className="text-xs text-neutral-400">
                  Upload your thumbnail
                </div>
              </div>
            </button>

            <button
              onClick={() => handleShareClick("instagram")}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors text-left"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">IG</span>
              </div>
              <div>
                <div className="text-white font-medium">Instagram Reels</div>
                <div className="text-xs text-neutral-400">
                  Upload your thumbnail
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onDownload}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Download Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
