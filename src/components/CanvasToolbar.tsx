import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Grid3X3,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Monitor,
} from "lucide-react";
import {
  useCanvasStore,
  AspectRatio as AspectRatioType,
} from "@/state/canvasStore";
import { useTelemetry } from "@/hooks/useTelemetry";

export function CanvasToolbar() {
  const {
    aspect,
    zoom,
    showGrid,
    showSafeZone,
    setAspectRatio,
    setZoom,
    setZoomPreset,
    zoomIn,
    zoomOut,
    resetView,
    toggleGrid,
    toggleSafeZone,
  } = useCanvasStore();
  const { trackControlChange } = useTelemetry();

  const aspectRatioOptions: { value: AspectRatioType; label: string }[] = [
    { value: "16:9", label: "16:9 (Landscape)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "9:16", label: "9:16 (Portrait)" },
  ];

  const zoomPresets = [0.5, 0.75, 1, 1.5, 2];

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0] ?? 1;
    setZoom(newZoom);
    trackControlChange("slider", "zoom", newZoom);
  };

  const handleAspectRatioChange = (value: AspectRatioType) => {
    setAspectRatio(value);
    trackControlChange("select", "aspectRatio", value);
  };

  const handleToggleGrid = () => {
    toggleGrid();
    trackControlChange("button", "showGrid", !showGrid);
  };

  const handleToggleSafeZone = () => {
    toggleSafeZone();
    trackControlChange("button", "showSafeZone", !showSafeZone);
  };

  const handleZoomIn = () => {
    zoomIn();
    trackControlChange("button", "zoomIn", zoom * 1.2);
  };

  const handleZoomOut = () => {
    zoomOut();
    trackControlChange("button", "zoomOut", zoom * 0.8);
  };

  const handleResetView = () => {
    resetView();
    trackControlChange("button", "resetView", { zoom: 1, aspect: "16:9" });
  };

  return (
    <div
      className="z-20 sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-2 md:py-3"
      data-testid="canvas-z-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left side - Ratio presets */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Monitor className="w-[18px] h-[18px] text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Ratio:</span>
            </div>
            <div className="flex items-center space-x-1">
              {aspectRatioOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={aspect === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAspectRatioChange(option.value)}
                  className="h-8 px-2 text-xs"
                  data-testid={`ratio-${option.value}`}
                  aria-label={`Set aspect ratio to ${option.label}`}
                  tabIndex={7 + aspectRatioOptions.indexOf(option)}
                >
                  {option.value}
                </Button>
              ))}
            </div>
          </div>

          {/* Center - Toggle buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={handleToggleGrid}
              className="h-8 px-3"
              data-testid="grid-toggle"
              aria-label={`${showGrid ? "Hide" : "Show"} grid overlay`}
              aria-pressed={showGrid}
              tabIndex={8}
            >
              <Grid3X3 className="w-[18px] h-[18px] mr-1" />
              Grid
            </Button>
            <Button
              variant={showSafeZone ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSafeZone}
              className="h-8 px-3"
              data-testid="safe-zone-toggle"
              aria-label={`${showSafeZone ? "Hide" : "Show"} safe zone overlay`}
              aria-pressed={showSafeZone}
              tabIndex={9}
            >
              <Shield className="w-[18px] h-[18px] mr-1" />
              Safe Zone
            </Button>
          </div>

          {/* Right side - Zoom controls and info */}
          <div className="flex items-center space-x-4">
            {/* Zoom Presets */}
            <div className="flex items-center space-x-1">
              {zoomPresets.map((preset) => (
                <Button
                  key={preset}
                  variant={zoom === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setZoomPreset(preset)}
                  className="h-8 px-2 text-xs"
                  data-testid={`zoom-preset-${preset}`}
                  aria-label={`Zoom to ${Math.round(preset * 100)}%`}
                  tabIndex={10 + zoomPresets.indexOf(preset)}
                >
                  {Math.round(preset * 100)}%
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 w-8 p-0"
                data-testid="zoom-out"
                aria-label="Zoom out (Ctrl/Cmd + -)"
                tabIndex={15}
              >
                <ZoomOut className="w-[18px] h-[18px]" />
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
                  aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 w-8 p-0"
                data-testid="zoom-in"
                aria-label="Zoom in (Ctrl/Cmd + +)"
                tabIndex={16}
              >
                <ZoomIn className="w-[18px] h-[18px]" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetView}
                className="h-8 px-2"
                data-testid="reset-view"
                aria-label="Reset zoom and pan to default view"
                tabIndex={17}
              >
                <RotateCcw className="w-[18px] h-[18px]" />
              </Button>
            </div>

            {/* Current ratio and zoom display */}
            <div
              className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
              data-testid="canvas-info"
            >
              {aspect} • {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center space-x-2">
            <Monitor className="w-[18px] h-[18px] text-gray-500" />
            <div className="flex items-center space-x-1">
              {aspectRatioOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={aspect === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAspectRatioChange(option.value)}
                  className="min-h-[44px] px-2 text-xs min-w-[44px]"
                  data-testid={`ratio-${option.value}`}
                  aria-label={`Set aspect ratio to ${option.label}`}
                  tabIndex={7 + aspectRatioOptions.indexOf(option)}
                >
                  {option.value}
                </Button>
              ))}
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={handleToggleGrid}
              className="min-h-[44px] min-w-[44px] p-0"
              data-testid="grid-toggle"
              aria-label={`${showGrid ? "Hide" : "Show"} grid overlay`}
              aria-pressed={showGrid}
              tabIndex={8}
            >
              <Grid3X3 className="w-[18px] h-[18px]" />
            </Button>
            <Button
              variant={showSafeZone ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSafeZone}
              className="min-h-[44px] min-w-[44px] p-0"
              data-testid="safe-zone-toggle"
              aria-label={`${showSafeZone ? "Hide" : "Show"} safe zone overlay`}
              aria-pressed={showSafeZone}
              tabIndex={9}
            >
              <Shield className="w-[18px] h-[18px]" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            {/* Zoom Presets - Mobile */}
            <div className="flex items-center space-x-1">
              {zoomPresets.map((preset) => (
                <Button
                  key={preset}
                  variant={zoom === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setZoomPreset(preset)}
                  className="min-h-[44px] px-1 text-xs min-w-[44px]"
                  data-testid={`zoom-preset-${preset}`}
                  aria-label={`Zoom to ${Math.round(preset * 100)}%`}
                  tabIndex={10 + zoomPresets.indexOf(preset)}
                >
                  {Math.round(preset * 100)}%
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="min-h-[44px] min-w-[44px] p-0"
              data-testid="zoom-out"
              aria-label="Zoom out (Ctrl/Cmd + -)"
              tabIndex={15}
            >
              <ZoomOut className="w-[18px] h-[18px]" />
            </Button>
            <div className="w-12">
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
                data-testid="zoom-slider"
                aria-label={`Zoom level: ${Math.round(zoom * 100)}%`}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="min-h-[44px] min-w-[44px] p-0"
              data-testid="zoom-in"
              aria-label="Zoom in (Ctrl/Cmd + +)"
              tabIndex={16}
            >
              <ZoomIn className="w-[18px] h-[18px]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
