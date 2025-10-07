import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Grid3X3,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Monitor,
} from "lucide-react";
import { useCanvasStore, AspectRatio as AspectRatioType } from "@/state/canvasStore";

export function CanvasToolbar() {
  const {
    aspect,
    zoom,
    showGrid,
    showSafeZone,
    setAspectRatio,
    setZoom,
    zoomIn,
    zoomOut,
    resetView,
    toggleGrid,
    toggleSafeZone,
  } = useCanvasStore();

  const aspectRatioOptions: { value: AspectRatioType; label: string }[] = [
    { value: "16:9", label: "16:9 (Landscape)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "9:16", label: "9:16 (Portrait)" },
  ];

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-3" data-testid="canvas-toolbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Ratio presets */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Ratio:</span>
          </div>
          <Select value={aspect} onValueChange={(value) => setAspectRatio(value as AspectRatioType)}>
            <SelectTrigger className="w-40" data-testid="ratio-selector" aria-label="Select aspect ratio" tabIndex={7}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aspectRatioOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Center - Toggle buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={toggleGrid}
            className="h-8 px-3"
            data-testid="grid-toggle"
            aria-label={`${showGrid ? 'Hide' : 'Show'} grid overlay`}
            aria-pressed={showGrid}
            tabIndex={8}
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={showSafeZone ? "default" : "outline"}
            size="sm"
            onClick={toggleSafeZone}
            className="h-8 px-3"
            data-testid="safe-zone-toggle"
            aria-label={`${showSafeZone ? 'Hide' : 'Show'} safe zone overlay`}
            aria-pressed={showSafeZone}
            tabIndex={9}
          >
            <Shield className="w-4 h-4 mr-1" />
            Safe Zone
          </Button>
        </div>

        {/* Right side - Zoom controls and info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
              data-testid="zoom-out"
              aria-label="Zoom out"
              tabIndex={10}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="w-24">
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
                data-testid="zoom-slider"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
              data-testid="zoom-in"
              aria-label="Zoom in"
              tabIndex={11}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="h-8 px-2"
              data-testid="reset-view"
              aria-label="Reset zoom and pan to default view"
              tabIndex={12}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Current ratio and zoom display */}
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full" data-testid="canvas-info">
            {aspect} • {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
