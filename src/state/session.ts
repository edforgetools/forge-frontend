import { useCanvasStore } from "./canvasStore";
import { sessionDB } from "@/lib/db";

export interface SessionRestoreGuard {
  checkAndRestoreViewport: (currentViewport: {
    width: number;
    height: number;
  }) => Promise<boolean>;
  saveViewportState: (viewport: {
    width: number;
    height: number;
  }) => Promise<void>;
}

const VIEWPORT_SIZE_THRESHOLD = 0.25; // 25% difference threshold

/**
 * Session restore guard that automatically adjusts zoom and centers canvas
 * when saved canvas size differs from current viewport by >25%
 */
export function useSessionRestoreGuard(): SessionRestoreGuard {
  const { resetView, zoom } = useCanvasStore();

  /**
   * Check if saved canvas dimensions differ significantly from current viewport
   * and restore viewport if needed
   */
  const checkAndRestoreViewport = async (currentViewport: {
    width: number;
    height: number;
  }): Promise<boolean> => {
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
        resetView();

        // Update the saved viewport state with current dimensions
        await saveViewportState(currentDimensions);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Session restore guard error:", error);
      return false;
    }
  };

  /**
   * Save current viewport state to session storage
   */
  const saveViewportState = async (viewport: {
    width: number;
    height: number;
  }): Promise<void> => {
    try {
      await sessionDB.saveSession({
        canvasDimensions: viewport,
        canvasScale: zoom,
      });
    } catch (error) {
      console.error("Failed to save viewport state:", error);
    }
  };

  return {
    checkAndRestoreViewport,
    saveViewportState,
  };
}

/**
 * Hook to automatically check and restore viewport on component mount
 * and when viewport dimensions change
 */
export function useSessionRestoreGuardEffect() {
  const { checkAndRestoreViewport, saveViewportState } =
    useSessionRestoreGuard();

  /**
   * Check viewport and restore if needed, then save current state
   */
  const checkAndSaveViewport = async (viewport: {
    width: number;
    height: number;
  }) => {
    const wasRestored = await checkAndRestoreViewport(viewport);

    // Always save current viewport state after checking
    await saveViewportState(viewport);

    return wasRestored;
  };

  return {
    checkAndSaveViewport,
  };
}
