interface SizeEstimateOptions {
  width: number;
  height: number;
  format: "jpeg" | "png" | "webp";
  quality: number;
}

export async function estimateSize(
  options: SizeEstimateOptions
): Promise<number> {
  const { width, height, format, quality } = options;

  // Create a small test canvas to estimate compression
  const testCanvas = document.createElement("canvas");
  const testSize = Math.min(100, Math.min(width, height));
  testCanvas.width = testSize;
  testCanvas.height = testSize;

  const ctx = testCanvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Create a test pattern that's representative of typical thumbnail content
  const gradient = ctx.createLinearGradient(0, 0, testSize, testSize);
  gradient.addColorStop(0, "#3b82f6");
  gradient.addColorStop(0.5, "#1e40af");
  gradient.addColorStop(1, "#1e3a8a");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, testSize, testSize);

  // Add some text to simulate overlay content
  ctx.fillStyle = "white";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Sample", testSize / 2, testSize / 2);

  // Convert to blob to measure compression
  const mimeType = `image/${format}`;
  const testQuality = format === "png" ? undefined : quality;

  const testBlob = await new Promise<Blob>((resolve, reject) => {
    testCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create test blob"));
      },
      mimeType,
      testQuality
    );
  });

  // Calculate compression ratio
  const testPixels = testSize * testSize;
  const targetPixels = width * height;
  const compressionRatio = testBlob.size / testPixels;

  // Estimate final size based on pixel count and compression ratio
  const estimatedBytes = targetPixels * compressionRatio;

  // Add some overhead for metadata and variations in content
  const overhead = 1.2; // 20% overhead for safety

  return (estimatedBytes * overhead) / (1024 * 1024); // Convert to MB
}

// Alternative method using canvas data analysis
export async function estimateSizeAdvanced(
  options: SizeEstimateOptions
): Promise<number> {
  // This would analyze the actual canvas content for more accurate estimates
  // For now, we'll use the simple method above

  return estimateSize(options);
}

// Quick estimation for UI feedback
export function quickEstimate(
  width: number,
  height: number,
  format: string
): number {
  const pixels = width * height;
  const bytesPerPixel = format === "png" ? 4 : format === "jpeg" ? 1.5 : 2;
  return (pixels * bytesPerPixel) / (1024 * 1024); // Convert to MB
}
