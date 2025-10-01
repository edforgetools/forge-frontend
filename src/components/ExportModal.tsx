import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Download, X } from "lucide-react";
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

const platformData = [
  {
    id: "tiktok" as const,
    name: "TikTok",
    description: "Upload your thumbnail",
    icon: "T",
    bgColor: "bg-black",
  },
  {
    id: "youtube" as const,
    name: "YouTube Shorts",
    description: "Upload your thumbnail",
    icon: "YT",
    bgColor: "bg-red-600",
  },
  {
    id: "instagram" as const,
    name: "Instagram Reels",
    description: "Upload your thumbnail",
    icon: "IG",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
];

export default function ExportModal({
  isOpen,
  onClose,
  onDownload,
}: ExportModalProps) {
  const handleShareClick = (platform: keyof typeof PLATFORM_URLS) => {
    // Log the share click event
    logEvent("share_clicked", { platform });

    // Open platform URL in new tab
    window.open(PLATFORM_URLS[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Export Complete!
          </DialogTitle>
          <DialogDescription>
            Your thumbnail has been exported successfully. Share it on your
            favorite platform!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Share to:</h3>

          <div className="grid grid-cols-1 gap-3">
            {platformData.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleShareClick(platform.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${platform.bgColor} rounded flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-sm">
                          {platform.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {platform.description}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Again
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
