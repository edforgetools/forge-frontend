import { useCanvasStore } from "./canvasStore";
import { sessionDB } from "@/lib/db";

const VIEWPORT_SIZE_THRESHOLD = 0.25; // 25% difference threshold

/**
 * Simplified session restore functionality
 */
export async function checkAndRestoreViewport(currentViewport: {
  width: number;
  height: number;
}): Promise<boolean> {
  try {
    const sessionData = await sessionDB.loadSession();
    if (!sessionData?.canvasDimensions) {
      return false;
    }

    const savedDimensions = sessionData.canvasDimensions;
    const currentDimensions = currentViewport;

    // Calculate the size difference percentage
    const widthDiff =
      Math.abs(savedDimensions.width - currentDimensions.width) /
      savedDimensions.width;
    const heightDiff =
      Math.abs(savedDimensions.height - currentDimensions.height) /
      savedDimensions.height;

    // Use the maximum difference between width and height
    const maxDiff = Math.max(widthDiff, heightDiff);

    // If difference is greater than 25%, restore viewport
    if (maxDiff > VIEWPORT_SIZE_THRESHOLD) {
      // Reset zoom to 100% and center the canvas
      useCanvasStore.getState().resetView();

      // Update the saved viewport state with current dimensions
      await sessionDB.saveSession({
        canvasDimensions: currentDimensions,
        canvasScale: useCanvasStore.getState().zoom,
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error("Session restore guard error:", error);
    return false;
  }
}

/**
 * Save current viewport state to session storage
 */
export async function saveViewportState(viewport: {
  width: number;
  height: number;
}): Promise<void> {
  try {
    await sessionDB.saveSession({
      canvasDimensions: viewport,
      canvasScale: useCanvasStore.getState().zoom,
    });
  } catch (error) {
    console.error("Failed to save viewport state:", error);
  }
}
