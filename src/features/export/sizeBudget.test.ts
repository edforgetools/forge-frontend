import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { exportUnder2MB } from "./sizeBudget";

const ctxStub: Partial<CanvasRenderingContext2D> = {
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  // @ts-expect-error runtime property not typed strictly
  imageSmoothingQuality: "high",
};

let getContextSpy: ReturnType<typeof vi.spyOn>;
let toBlobSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(() => ctxStub as CanvasRenderingContext2D);

  toBlobSpy = vi
    .spyOn(HTMLCanvasElement.prototype, "toBlob")
    .mockImplementation(function (
      callback: BlobCallback,
      type?: string,
      quality?: number
    ): void {
      const q = typeof quality === "number" ? quality : 0.9;
      const size = q > 0.75 ? 2_400_000 : 1_500_000;
      const blob = new Blob([new Uint8Array(size)], {
        type: type || "image/jpeg",
      });
      callback(blob);
    });
});

afterAll(() => {
  getContextSpy.mockRestore();
  toBlobSpy.mockRestore();
});

describe("exportUnder2MB", () => {
  it("exports something (smoke)", async () => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = 1080;
    const ctx = c.getContext("2d")!;
    // @ts-expect-error fillStyle is fine at runtime
    ctx.fillStyle = "#123456";
    ctx.fillRect(0, 0, c.width, c.height);

    const blob = await exportUnder2MB(c, "image/jpeg");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeLessThanOrEqual(2_000_000);
  });

  it("handles different canvas sizes", async () => {
    const sizes = [
      { w: 1280, h: 720 }, // 16:9
      { w: 720, h: 1280 }, // 9:16
      { w: 1080, h: 1080 }, // 1:1
    ];

    for (const { w, h } of sizes) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      // @ts-expect-error fillStyle is fine at runtime
      ctx.fillStyle = "#abcdef";
      ctx.fillRect(0, 0, w, h);

      const blob = await exportUnder2MB(c, 2 * 1024 * 1024);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeLessThanOrEqual(2_000_000);
    }
  });

  it("uses custom size limit", async () => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = 1080;
    const ctx = c.getContext("2d")!;
    // @ts-expect-error fillStyle is fine at runtime
    ctx.fillStyle = "#123456";
    ctx.fillRect(0, 0, c.width, c.height);

    const customLimit = 1_000_000; // 1MB
    const blob = await exportUnder2MB(c, customLimit);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeLessThanOrEqual(customLimit);
  });

  it("handles quality options", async () => {
    const c = document.createElement("canvas");
    c.width = 1920;
    c.height = 1080;
    const ctx = c.getContext("2d")!;
    // @ts-expect-error fillStyle is fine at runtime
    ctx.fillStyle = "#123456";
    ctx.fillRect(0, 0, c.width, c.height);

    const options = {
      minQuality: 0.3,
      maxQuality: 0.8,
      minWidth: 800,
      minHeight: 600,
    };

    const blob = await exportUnder2MB(c, 2 * 1024 * 1024, options);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeLessThanOrEqual(2_000_000);
  });

  it("handles very large canvas with downscaling", async () => {
    const c = document.createElement("canvas");
    c.width = 4000;
    c.height = 3000;
    const ctx = c.getContext("2d")!;
    // @ts-expect-error fillStyle is fine at runtime
    ctx.fillStyle = "#123456";
    ctx.fillRect(0, 0, c.width, c.height);

    const blob = await exportUnder2MB(c, 2 * 1024 * 1024);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeLessThanOrEqual(2_000_000);
  });

  it("returns null for unsupported canvas", async () => {
    // Mock canvas without toBlob support
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    // @ts-expect-error Mocking for test
    HTMLCanvasElement.prototype.toBlob = undefined;

    const c = document.createElement("canvas");
    c.width = 100;
    c.height = 100;

    const blob = await exportUnder2MB(c, 2 * 1024 * 1024);
    expect(blob).toBeNull();

    // Restore original method
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });
});
