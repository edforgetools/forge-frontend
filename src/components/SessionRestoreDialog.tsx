import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Clock, FileText, X } from "lucide-react";

interface SessionRestoreDialogProps {
  isOpen: boolean;
  onRestore: () => void;
  onDismiss: () => void;
  lastSaveTime: Date | null;
  toolName: string;
}

export default function SessionRestoreDialog({
  isOpen,
  onRestore,
  onDismiss,
  lastSaveTime,
  toolName,
}: SessionRestoreDialogProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!lastSaveTime) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaveTime.getTime();

      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setTimeAgo(`${days} day${days > 1 ? "s" : ""} ago`);
      } else if (hours > 0) {
        setTimeAgo(`${hours} hour${hours > 1 ? "s" : ""} ago`);
      } else if (minutes > 0) {
        setTimeAgo(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
      } else {
        setTimeAgo("Just now");
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSaveTime]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Restore Last Session?</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            We found a saved session from your previous work on the {toolName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastSaveTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last saved: {timeAgo}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={onRestore} className="w-full">
              Yes, Restore My Work
            </Button>
            <Button onClick={onDismiss} variant="outline" className="w-full">
              Start Fresh
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your work is automatically saved every 2 seconds while you're
            editing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
