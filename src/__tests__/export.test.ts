import { describe, it, expect } from "vitest";
import { getCompressionPresets } from "@/lib/ssim-compression";

describe("Export Functionality", () => {
  describe("Compression Presets", () => {
    it("should have valid compression presets", () => {
      const presets = getCompressionPresets();

      expect(presets).toHaveProperty("low");
      expect(presets).toHaveProperty("medium");
      expect(presets).toHaveProperty("high");

      expect(presets.low?.quality).toBe(0.6);
      expect(presets.low?.ssimThreshold).toBe(0.7);
      expect(presets.low?.targetSizeMB).toBe(2);

      expect(presets.medium?.quality).toBe(0.8);
      expect(presets.medium?.ssimThreshold).toBe(0.8);
      expect(presets.medium?.targetSizeMB).toBe(2);

      expect(presets.high?.quality).toBe(0.9);
      expect(presets.high?.ssimThreshold).toBe(0.9);
      expect(presets.high?.targetSizeMB).toBe(2);
    });

    it("should have valid quality ranges", () => {
      const presets = getCompressionPresets();

      Object.values(presets).forEach((preset) => {
        expect(preset.quality).toBeGreaterThan(0);
        expect(preset.quality).toBeLessThanOrEqual(1);
        expect(preset.ssimThreshold).toBeGreaterThan(0);
        expect(preset.ssimThreshold).toBeLessThanOrEqual(1);
        expect(preset.targetSizeMB).toBeGreaterThan(0);
      });
    });
  });
});
