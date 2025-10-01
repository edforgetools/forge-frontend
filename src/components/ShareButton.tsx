import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { trackShareClick } from "@/lib/metrics";
import { useToast } from "@/hooks/useToast";

interface ShareButtonProps {
  url?: string;
  text?: string;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function ShareButton({
  url = window.location.href,
  text = "Check this out!",
  className,
  variant = "outline",
  size = "sm",
  children,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const handleShare = async () => {
    try {
      // Try native share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text,
          url,
        });
        trackShareClick("native", url);
        return;
      }

      // Fallback to copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success("Link copied!", "Share link copied to clipboard");
      trackShareClick("copy", url);

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback: select text in a temporary input
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      success("Link copied!", "Share link copied to clipboard");
      trackShareClick("copy", url);

      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {children || (copied ? "Copied!" : "Share")}
    </Button>
  );
}
