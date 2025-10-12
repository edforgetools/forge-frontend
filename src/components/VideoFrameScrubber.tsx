import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Download } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { extractFrameFromVideo, getVideoInfo } from "@/lib/video";
import { useToast } from "@/hooks/use-toast";

interface VideoFrameScrubberProps {
  className?: string;
}

export function VideoFrameScrubber({ className }: VideoFrameScrubberProps) {
  const { videoSrc, setImage } = useCanvasStore();
  const { toast } = useToast();

  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    width: number;
    height: number;
    aspectRatio: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video when videoSrc changes
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const videoElement = videoRef.current;
    videoElement.src = videoSrc;

    const handleLoadedMetadata = () => {
      const info = getVideoInfo(videoElement);
      setDuration(info.duration);
      setVideoInfo({
        width: info.width,
        height: info.height,
        aspectRatio: info.aspectRatio,
      });
      setVideo(videoElement);

      // Set initial time to middle of video
      const initialTime = info.duration * 0.5;
      videoElement.currentTime = initialTime;
      setCurrentTime(initialTime);

      // Extract initial frame
      extractInitialFrame(initialTime);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", () => {
      setCurrentTime(videoElement.currentTime);
    });
    videoElement.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", () => {
        setCurrentTime(videoElement.currentTime);
      });
      videoElement.removeEventListener("ended", () => {
        setIsPlaying(false);
      });
    };
  }, [videoSrc]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const extractInitialFrame = useCallback(
    async (timestamp: number) => {
      if (!videoRef.current) return;

      try {
        setIsLoading(true);
        const frame = await extractFrameFromVideo(videoRef.current, timestamp);

        // Convert canvas to image
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = frame.canvas.toDataURL();

        toast({
          title: "Frame extracted",
          description: `Frame at ${timestamp.toFixed(1)}s loaded`,
        });
      } catch (error) {
        console.error("Failed to extract frame:", error);
        toast({
          title: "Frame extraction failed",
          description: "Could not extract frame from video",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setImage, toast]
  );

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      videoRef.current.play();
      // Update current time every 100ms for smoother scrubbing
      intervalRef.current = setInterval(() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }, 100);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current || value[0] === undefined) return;
    const newTime = value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleExtractFrame = async () => {
    if (!videoRef.current) return;
    await extractInitialFrame(currentTime);
  };

  const handleSkip = (direction: "back" | "forward") => {
    if (!videoRef.current) return;
    const skipAmount = 1; // 1 second
    const newTime =
      direction === "back"
        ? Math.max(0, currentTime - skipAmount)
        : Math.min(duration, currentTime + skipAmount);

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!videoSrc) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <p>No video loaded</p>
        <p className="text-sm">Upload a video to use the frame scrubber</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Video Info */}
      {videoInfo && (
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span>
              Resolution: {videoInfo.width}×{videoInfo.height}
            </span>
            <span>Duration: {formatTime(duration)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Aspect Ratio: {videoInfo.aspectRatio.toFixed(2)}:1
          </div>
        </div>
      )}

      {/* Video Player (Hidden) */}
      <video ref={videoRef} className="hidden" muted preload="metadata" />

      {/* Timeline Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSkip("back")}
          disabled={!video || isLoading}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={handlePlayPause}
          disabled={!video || isLoading}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSkip("forward")}
          disabled={!video || isLoading}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Extract Frame Button */}
      <Button
        onClick={handleExtractFrame}
        disabled={!video || isLoading}
        className="w-full"
        size="md"
      >
        <Download className="w-4 h-4 mr-2" />
        {isLoading ? "Extracting..." : "Extract Frame"}
      </Button>

      {/* Quick Time Buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSeek([0])}
          disabled={!video || isLoading}
          className="flex-1"
        >
          0%
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSeek([duration * 0.25])}
          disabled={!video || isLoading}
          className="flex-1"
        >
          25%
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSeek([duration * 0.5])}
          disabled={!video || isLoading}
          className="flex-1"
        >
          50%
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSeek([duration * 0.75])}
          disabled={!video || isLoading}
          className="flex-1"
        >
          75%
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleSeek([duration])}
          disabled={!video || isLoading}
          className="flex-1"
        >
          100%
        </Button>
      </div>
    </div>
  );
}
