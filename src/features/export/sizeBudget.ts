/**
 * exportUnder2MB — Encode a canvas to JPEG ≤ 2 MiB using binary search on quality
 * and progressive downscaling if quality floor is reached.
 * Falls back to PNG if JPEG cannot meet size requirements.
 * Includes byte logging for monitoring export sizes.
 *
 * Backward compatible signature:
 *   exportUnder2MB(canvas, 'image/jpeg') // old style, mime string ignored
 * New preferred signature:
 *   exportUnder2MB(canvas, 2 * 1024 * 1024)
 */
export async function exportUnder2MB(
  canvas: HTMLCanvasElement,
  arg1?: number | string,
  options?: {
    minQuality?: number;
    maxQuality?: number;
    minWidth?: number;
    minHeight?: number;
    enableLogging?: boolean;
  }
): Promise<Blob | null> {
  const maxBytes: number = typeof arg1 === "number" ? arg1 : 2 * 1024 * 1024;
  const minQ = options?.minQuality ?? 0.5; // quality floor
  const maxQ = options?.maxQuality ?? 0.95; // start high
  const minW = options?.minWidth ?? 960; // do not downscale below 960x540 by default
  const minH = options?.minHeight ?? 540;
  const enableLogging = options?.enableLogging ?? true;

  // Byte logging function
  const logExportSize = (
    format: string,
    size: number,
    quality?: number,
    dimensions?: string
  ) => {
    if (enableLogging) {
      const timestamp = new Date().toISOString();
      const sizeKB = Math.round(size / 1024);
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      const logEntry = {
        timestamp,
        format,
        sizeBytes: size,
        sizeKB,
        sizeMB: parseFloat(sizeMB),
        quality,
        dimensions,
        withinBudget: size <= maxBytes,
      };

      // Log to console for debugging
      console.log(
        `[Export] ${format} ${sizeMB}MB (${sizeKB}KB) - Quality: ${quality} - ${dimensions}`,
        logEntry
      );

      // Store in localStorage for persistence
      try {
        const existingLogs = JSON.parse(
          localStorage.getItem("forge_export_logs") || "[]"
        );
        existingLogs.push(logEntry);
        // Keep only last 50 entries
        if (existingLogs.length > 50) {
          existingLogs.splice(0, existingLogs.length - 50);
        }
        localStorage.setItem("forge_export_logs", JSON.stringify(existingLogs));
      } catch (e) {
        console.warn("Failed to log export size to localStorage:", e);
      }
    }
  };

  const attemptEncode = (c: HTMLCanvasElement, q: number) =>
    new Promise<Blob>((resolve, reject) => {
      if (!c.toBlob) return reject(new Error("Canvas.toBlob not supported"));
      c.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))),
        "image/jpeg",
        q
      );
    });

  const binarySearchQuality = async (c: HTMLCanvasElement) => {
    let low = minQ,
      high = maxQ;
    let best: Blob | null = null;
    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2;
      const blob = await attemptEncode(c, mid);
      const ok = blob.size <= maxBytes;
      if (ok) {
        best = blob;
        low = mid;
      } else {
        high = mid;
      }
    }
    if (!best) {
      const blob = await attemptEncode(c, low);
      return blob.size <= maxBytes ? blob : null;
    }
    return best;
  };

  // PNG fallback function
  const attemptPNGEncode = (c: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) => {
      if (!c.toBlob) return reject(new Error("Canvas.toBlob not supported"));
      c.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encode failed")),
        "image/png"
      );
    });

  const downscale = (c: HTMLCanvasElement, factor: number) => {
    const w = Math.max(Math.floor(c.width * factor), minW);
    const h = Math.max(Math.floor(c.height * factor), minH);
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D context unavailable");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(c, 0, 0, w, h);
    return off;
  };

  // 1) Try quality search at current size
  const result = await binarySearchQuality(canvas);
  if (result && result.size <= maxBytes) {
    logExportSize(
      "JPEG",
      result.size,
      undefined,
      `${canvas.width}x${canvas.height}`
    );
    return result;
  }

  // 2) Progressive downscale if still too large
  let work = canvas;
  const factors = [0.9, 0.85, 0.8, 0.75, 0.7];
  for (const f of factors) {
    if (work.width <= minW || work.height <= minH) break;
    work = downscale(work, f);
    const candidate = await binarySearchQuality(work);
    if (candidate && candidate.size <= maxBytes) {
      logExportSize(
        "JPEG",
        candidate.size,
        undefined,
        `${work.width}x${work.height}`
      );
      return candidate;
    }
  }

  // 3) Last try at min bounds
  if (work.width > minW || work.height > minH) {
    const atMin = downscale(
      work,
      Math.min(minW / work.width, minH / work.height)
    );
    const candidate = await binarySearchQuality(atMin);
    if (candidate && candidate.size <= maxBytes) {
      logExportSize(
        "JPEG",
        candidate.size,
        undefined,
        `${atMin.width}x${atMin.height}`
      );
      return candidate;
    }
  }

  // 4) PNG fallback - may exceed 2MB but provides highest quality
  try {
    const pngBlob = await attemptPNGEncode(canvas);
    logExportSize(
      "PNG",
      pngBlob.size,
      undefined,
      `${canvas.width}x${canvas.height}`
    );
    return pngBlob;
  } catch (error) {
    console.error("PNG fallback failed:", error);
    return null;
  }
}

// Convenience helper that integrates with window.__forgeAnalytics if present
export async function exportAndTrack(
  canvas: HTMLCanvasElement,
  arg1?: number | string
): Promise<Blob | null> {
  try {
    const blob = await exportUnder2MB(canvas, arg1);
    if (blob) {
      if (
        typeof window !== "undefined" &&
        window.__forgeAnalytics?.exportSuccess
      ) {
        window.__forgeAnalytics.exportSuccess({ size: blob.size });
      }
      return blob;
    } else {
      if (
        typeof window !== "undefined" &&
        window.__forgeAnalytics?.exportFail
      ) {
        window.__forgeAnalytics.exportFail({ reason: "size_budget_failed" });
      }
      return null;
    }
  } catch {
    if (typeof window !== "undefined" && window.__forgeAnalytics?.exportFail) {
      window.__forgeAnalytics.exportFail({ reason: "exception" });
    }
    return null;
  }
}

// Stress test function to generate three test exports with different characteristics
export async function generateStressTestExports(): Promise<{
  results: Array<{
    test: string;
    size: number;
    format: string;
    withinBudget: boolean;
  }>;
  allWithinBudget: boolean;
}> {
  const results: Array<{
    test: string;
    size: number;
    format: string;
    withinBudget: boolean;
  }> = [];

  // Test 1: High resolution canvas (4K)
  const canvas4K = document.createElement("canvas");
  canvas4K.width = 3840;
  canvas4K.height = 2160;
  const ctx4K = canvas4K.getContext("2d")!;
  ctx4K.fillStyle = "#ff0000";
  ctx4K.fillRect(0, 0, canvas4K.width, canvas4K.height);
  ctx4K.fillStyle = "#ffffff";
  ctx4K.font = "bold 200px Arial";
  ctx4K.textAlign = "center";
  ctx4K.fillText("STRESS TEST 4K", canvas4K.width / 2, canvas4K.height / 2);

  const blob4K = await exportUnder2MB(canvas4K, 2 * 1024 * 1024, {
    enableLogging: true,
  });
  if (blob4K) {
    results.push({
      test: "4K High Resolution",
      size: blob4K.size,
      format: blob4K.type.includes("png") ? "PNG" : "JPEG",
      withinBudget: blob4K.size <= 2 * 1024 * 1024,
    });
  }

  // Test 2: Complex canvas with gradients and text
  const canvasComplex = document.createElement("canvas");
  canvasComplex.width = 1920;
  canvasComplex.height = 1080;
  const ctxComplex = canvasComplex.getContext("2d")!;

  // Create gradient background
  const gradient = ctxComplex.createLinearGradient(
    0,
    0,
    canvasComplex.width,
    canvasComplex.height
  );
  gradient.addColorStop(0, "#ff6b6b");
  gradient.addColorStop(0.5, "#4ecdc4");
  gradient.addColorStop(1, "#45b7d1");
  ctxComplex.fillStyle = gradient;
  ctxComplex.fillRect(0, 0, canvasComplex.width, canvasComplex.height);

  // Add multiple text elements
  for (let i = 0; i < 20; i++) {
    ctxComplex.fillStyle = `rgba(255, 255, 255, ${0.8 - i * 0.03})`;
    ctxComplex.font = `bold ${120 - i * 5}px Arial`;
    ctxComplex.textAlign = "center";
    ctxComplex.fillText(
      `COMPLEX TEST ${i}`,
      canvasComplex.width / 2,
      100 + i * 50
    );
  }

  const blobComplex = await exportUnder2MB(canvasComplex, 2 * 1024 * 1024, {
    enableLogging: true,
  });
  if (blobComplex) {
    results.push({
      test: "Complex Graphics",
      size: blobComplex.size,
      format: blobComplex.type.includes("png") ? "PNG" : "JPEG",
      withinBudget: blobComplex.size <= 2 * 1024 * 1024,
    });
  }

  // Test 3: Maximum size canvas (8K)
  const canvas8K = document.createElement("canvas");
  canvas8K.width = 7680;
  canvas8K.height = 4320;
  const ctx8K = canvas8K.getContext("2d")!;
  ctx8K.fillStyle = "#000000";
  ctx8K.fillRect(0, 0, canvas8K.width, canvas8K.height);
  ctx8K.fillStyle = "#00ff00";
  ctx8K.font = "bold 400px Arial";
  ctx8K.textAlign = "center";
  ctx8K.fillText("8K MAX", canvas8K.width / 2, canvas8K.height / 2);

  const blob8K = await exportUnder2MB(canvas8K, 2 * 1024 * 1024, {
    enableLogging: true,
  });
  if (blob8K) {
    results.push({
      test: "8K Maximum Resolution",
      size: blob8K.size,
      format: blob8K.type.includes("png") ? "PNG" : "JPEG",
      withinBudget: blob8K.size <= 2 * 1024 * 1024,
    });
  }

  const allWithinBudget = results.every((r) => r.withinBudget);

  return { results, allWithinBudget };
}
