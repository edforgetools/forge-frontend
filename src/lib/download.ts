/**
 * Download utilities for Snapthumb
 */

/**
 * Trigger download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  baseName: string = "snapthumb",
  extension: string = "jpg",
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)}`
    : "";

  return `${baseName}${timestamp}.${extension}`;
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return mimeToExt[mimeType] || "jpg";
}

/**
 * Download canvas as image file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename?: string,
  mimeType: string = "image/jpeg",
  quality: number = 0.8
): void {
  canvas.toBlob(
    (blob) => {
      if (blob) {
        const extension = getExtensionFromMimeType(mimeType);
        const finalFilename =
          filename || generateFilename("snapthumb", extension);
        downloadBlob(blob, finalFilename);
      }
    },
    mimeType,
    quality
  );
}

/**
 * Download multiple files as ZIP (future enhancement)
 */
export function downloadMultipleFiles(
  files: Array<{ blob: Blob; filename: string }>
): void {
  // For now, download files individually
  // See GitHub issue #26 for ZIP implementation
  files.forEach(({ blob, filename }) => {
    downloadBlob(blob, filename);
  });
}

/**
 * Copy blob to clipboard (if supported)
 */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && "write" in navigator.clipboard) {
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob,
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    }
    return false;
  } catch (error) {
    console.warn("Failed to copy to clipboard:", error);
    return false;
  }
}
