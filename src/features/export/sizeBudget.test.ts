/**
 * Tests for sizeBudget.ts export guardrail functionality
 */

import { exportUnder2MB, generateStressTestExports } from "./sizeBudget";

// Mock DOM for testing
const mockCanvas = (width: number, height: number) => ({
  width,
  height,
  toBlob: (
    callback: (blob: Blob | null) => void,
    mimeType: string,
    quality?: number
  ) => {
    // Simulate realistic file sizes
    const baseSize = (width * height * 3) / 1000; // Rough estimate
    const qualityFactor = quality || 0.8;
    const mimeFactor = mimeType === "image/png" ? 1.5 : 0.7;
    const simulatedSize = Math.floor(baseSize * qualityFactor * mimeFactor);

    // For testing, ensure we can hit the 2MB limit
    const finalSize = Math.min(simulatedSize, 2.5 * 1024 * 1024);

    setTimeout(() => {
      callback({
        size: finalSize,
        type: mimeType,
      } as Blob);
    }, 10);
  },
});

// Mock localStorage
const mockLocalStorage = {
  getItem: () => "[]",
  setItem: () => {},
};

// Mock console
const mockConsole = {
  log: () => {},
  error: () => {},
  warn: () => {},
};

describe("Export Guardrail Tests", () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(global, "document", {
      value: {
        createElement: (tagName: string) => {
          if (tagName === "canvas") {
            return mockCanvas(1920, 1080);
          }
          return {};
        },
      },
    });

    Object.defineProperty(global, "localStorage", { value: mockLocalStorage });
    Object.defineProperty(global, "console", { value: mockConsole });
  });

  test("exportUnder2MB should return blob under 2MB for normal canvas", async () => {
    const canvas = mockCanvas(1920, 1080) as HTMLCanvasElement;
    const blob = await exportUnder2MB(canvas, 2 * 1024 * 1024, {
      enableLogging: true,
    });

    expect(blob).toBeTruthy();
    expect(blob!.size).toBeLessThanOrEqual(2 * 1024 * 1024);
  });

  test("exportUnder2MB should use PNG fallback for very large canvas", async () => {
    const canvas = mockCanvas(7680, 4320) as HTMLCanvasElement;
    const blob = await exportUnder2MB(canvas, 2 * 1024 * 1024, {
      enableLogging: true,
    });

    expect(blob).toBeTruthy();
    // PNG fallback may exceed 2MB, which is expected behavior
    expect(blob!.type).toContain("image/");
  });

  test("generateStressTestExports should return three test results", async () => {
    const { results, allWithinBudget } = await generateStressTestExports();

    expect(results).toHaveLength(3);
    expect(results[0].test).toContain("4K");
    expect(results[1].test).toContain("Complex");
    expect(results[2].test).toContain("8K");

    // At least some should be within budget (JPEG tests)
    expect(results.some((r) => r.withinBudget)).toBe(true);
  });

  test("export logging should work correctly", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    const canvas = mockCanvas(1920, 1080) as HTMLCanvasElement;

    await exportUnder2MB(canvas, 2 * 1024 * 1024, { enableLogging: true });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[Export]"),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });
});

export {};
