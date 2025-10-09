import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export type CompressionPreset = "high" | "medium" | "low";

export interface CompressionSettings {
  preset: CompressionPreset;
  quality: number;
  targetSizeMB: number;
  ssimThreshold: number;
}

interface CompressionSelectorProps {
  value: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  disabled?: boolean;
  showAdvanced?: boolean;
}

const PRESET_CONFIGS: Record<
  CompressionPreset,
  Omit<CompressionSettings, "preset">
> = {
  high: {
    quality: 0.9,
    targetSizeMB: 1.5,
    ssimThreshold: 0.85,
  },
  medium: {
    quality: 0.7,
    targetSizeMB: 1.0,
    ssimThreshold: 0.8,
  },
  low: {
    quality: 0.5,
    targetSizeMB: 0.8,
    ssimThreshold: 0.75,
  },
};

export function CompressionSelector({
  value,
  onChange,
  disabled = false,
  showAdvanced = false,
}: CompressionSelectorProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);

  const handlePresetChange = (preset: CompressionPreset) => {
    const config = PRESET_CONFIGS[preset];
    onChange({
      preset,
      ...config,
    });
  };

  const handleQualityChange = (quality: number[]) => {
    onChange({
      ...value,
      quality: quality[0] ?? 0.8,
    });
  };

  const handleTargetSizeChange = (targetSizeMB: number[]) => {
    onChange({
      ...value,
      targetSizeMB: targetSizeMB[0] ?? 1,
    });
  };

  const handleSSIMChange = (ssimThreshold: number[]) => {
    onChange({
      ...value,
      ssimThreshold: ssimThreshold[0] ?? 0.9,
    });
  };

  const getPresetLabel = (preset: CompressionPreset): string => {
    const config = PRESET_CONFIGS[preset];
    return `${preset.charAt(0).toUpperCase() + preset.slice(1)} (≤${
      config.targetSizeMB
    }MB, SSIM ≥${Math.round(config.ssimThreshold * 100)}%)`;
  };

  const getQualityLabel = (quality: number): string => {
    if (quality >= 0.85) return "High";
    if (quality >= 0.65) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-3">
      {/* Preset Buttons */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Quality:</label>
        <div className="flex space-x-1">
          {(["high", "medium", "low"] as CompressionPreset[]).map((preset) => (
            <Button
              key={preset}
              variant={value.preset === preset ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetChange(preset)}
              disabled={disabled}
              className="text-xs px-2 py-1"
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Preset Description */}
      <div className="text-xs text-gray-600">
        {getPresetLabel(value.preset)}
      </div>

      {/* Advanced Settings Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          disabled={disabled}
          className="text-xs p-1 h-auto"
        >
          {isAdvancedOpen ? "Hide" : "Show"} Advanced
        </Button>
      </div>

      {/* Advanced Settings */}
      {isAdvancedOpen && (
        <div className="space-y-3 pl-2 border-l-2 border-gray-200">
          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Quality: {getQualityLabel(value.quality)} (
                {Math.round(value.quality * 100)}%)
              </label>
            </div>
            <Slider
              value={[value.quality]}
              onValueChange={handleQualityChange}
              min={0.1}
              max={1.0}
              step={0.05}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Target Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Target Size: ≤{value.targetSizeMB}MB
              </label>
            </div>
            <Slider
              value={[value.targetSizeMB]}
              onValueChange={handleTargetSizeChange}
              min={0.5}
              max={2.0}
              step={0.1}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* SSIM Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                SSIM Threshold: ≥{Math.round(value.ssimThreshold * 100)}%
              </label>
            </div>
            <Slider
              value={[value.ssimThreshold]}
              onValueChange={handleSSIMChange}
              min={0.5}
              max={0.95}
              step={0.05}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
