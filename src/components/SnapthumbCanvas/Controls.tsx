import { useSnapthumbStore } from "@/lib/snapthumb-state";
import {
  GridPosition,
  BackgroundFit,
  Quality,
  QUALITY_COMPRESSION_MAP,
} from "./types";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Move,
  Layers,
  Monitor,
  Settings,
  RotateCcw,
  Grid3X3,
} from "lucide-react";

interface ControlsProps {
  className?: string;
}

export function Controls({ className = "" }: ControlsProps) {
  const config = useSnapthumbStore((state) => state.config);
  const updateConfig = useSnapthumbStore((state) => state.updateConfig);
  const resetConfig = useSnapthumbStore((state) => state.resetConfig);

  // Grid position buttons
  const gridPositions = [
    { position: GridPosition.TOP_LEFT, label: "Top Left" },
    { position: GridPosition.TOP_CENTER, label: "Top Center" },
    { position: GridPosition.TOP_RIGHT, label: "Top Right" },
    { position: GridPosition.CENTER_LEFT, label: "Center Left" },
    { position: GridPosition.CENTER, label: "Center" },
    { position: GridPosition.CENTER_RIGHT, label: "Center Right" },
    { position: GridPosition.BOTTOM_LEFT, label: "Bottom Left" },
    { position: GridPosition.BOTTOM_CENTER, label: "Bottom Center" },
    { position: GridPosition.BOTTOM_RIGHT, label: "Bottom Right" },
  ];

  // Background fit options
  const backgroundFitOptions = [
    { value: BackgroundFit.CONTAIN, label: "Contain" },
    { value: BackgroundFit.COVER, label: "Cover" },
    { value: BackgroundFit.CROP_16_9, label: "16:9 Crop" },
  ];

  // Quality options
  const qualityOptions = [
    { value: Quality.LOW, label: "Low" },
    { value: Quality.MEDIUM, label: "Medium" },
    { value: Quality.HIGH, label: "High" },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grid Position Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Grid3X3 className="w-4 h-4" />
            Position Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {gridPositions.map(({ position, label }) => (
              <Button
                key={position}
                variant={
                  config.gridPosition === position ? "default" : "outline"
                }
                size="sm"
                onClick={() => updateConfig({ gridPosition: position })}
                className="text-xs h-8"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Padding Control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Move className="w-4 h-4" />
            Padding: {config.padding}px
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Slider
            value={[config.padding]}
            onValueChange={([value]) => updateConfig({ padding: value })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0px</span>
            <span>100px</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Overlay Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4" />
            Overlay Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scale Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Scale</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(config.scale * 100)}%
              </span>
            </div>
            <Slider
              value={[config.scale]}
              onValueChange={([value]) => updateConfig({ scale: value })}
              min={0.1}
              max={1.5}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10%</span>
              <span>150%</span>
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Opacity</span>
              <span className="text-sm text-muted-foreground">
                {config.opacity}%
              </span>
            </div>
            <Slider
              value={[config.opacity]}
              onValueChange={([value]) => updateConfig({ opacity: value })}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Background Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Monitor className="w-4 h-4" />
            Background Fit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {backgroundFitOptions.map(({ value, label }) => (
              <Button
                key={value}
                variant={config.backgroundFit === value ? "default" : "outline"}
                size="sm"
                onClick={() => updateConfig({ backgroundFit: value })}
                className="justify-start text-xs h-8"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            Export Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {qualityOptions.map(({ value, label }) => {
              const compression = QUALITY_COMPRESSION_MAP[value];
              return (
                <Button
                  key={value}
                  variant={config.quality === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateConfig({ quality: value })}
                  className="justify-start text-xs h-8"
                >
                  <div className="flex flex-col items-start">
                    <span>{label}</span>
                    <span className="text-xs text-muted-foreground">
                      JPEG: {Math.round(compression.jpeg * 100)}% | WebP:{" "}
                      {Math.round(compression.webp * 100)}%
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Canvas Dimensions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Monitor className="w-4 h-4" />
            Canvas Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Width */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Width</span>
              <span className="text-sm text-muted-foreground">
                {config.canvasWidth}px
              </span>
            </div>
            <Slider
              value={[config.canvasWidth]}
              onValueChange={([value]) => updateConfig({ canvasWidth: value })}
              min={100}
              max={4000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100px</span>
              <span>4000px</span>
            </div>
          </div>

          {/* Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Height</span>
              <span className="text-sm text-muted-foreground">
                {config.canvasHeight}px
              </span>
            </div>
            <Slider
              value={[config.canvasHeight]}
              onValueChange={([value]) => updateConfig({ canvasHeight: value })}
              min={100}
              max={4000}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100px</span>
              <span>4000px</span>
            </div>
          </div>

          {/* Aspect Ratio Info */}
          <div className="text-xs text-muted-foreground text-center">
            Aspect Ratio:{" "}
            {(config.canvasWidth / config.canvasHeight).toFixed(2)}
            :1
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Reset Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={resetConfig}
            className="w-full"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
