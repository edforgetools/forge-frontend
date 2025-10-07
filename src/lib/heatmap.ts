/**
 * Lightweight heatmap tracking for user interactions
 * Collects pointer movement and click coordinates with 1Hz throttling
 */

interface HeatmapPoint {
  x: number;
  y: number;
  type: "move" | "click";
  timestamp: number;
  canvasWidth: number;
  canvasHeight: number;
}

interface HeatmapData {
  event: "heatmap";
  points: HeatmapPoint[];
  sessionId: string;
  timestamp: number;
}

class HeatmapTracker {
  private points: HeatmapPoint[] = [];
  private lastMoveTime = 0;
  private moveThrottle = 1000; // 1Hz throttling (1000ms)
  private canvasElement: HTMLCanvasElement | null = null;
  private sessionId: string;
  private isTracking = false;

  constructor() {
    this.sessionId = this.getSessionId();
    this.setupEventListeners();
  }

  private getSessionId(): string {
    const key = "snapthumb_session_id";
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
  }

  private setupEventListeners(): void {
    // Track page unload
    window.addEventListener("beforeunload", () => {
      this.sendHeatmapData();
    });

    // Track page visibility change (mobile/tablet)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.sendHeatmapData();
      }
    });
  }

  public startTracking(canvasElement: HTMLCanvasElement): void {
    this.canvasElement = canvasElement;
    this.isTracking = true;

    // Add event listeners to canvas
    canvasElement.addEventListener(
      "mousemove",
      this.handlePointerMove.bind(this)
    );
    canvasElement.addEventListener("click", this.handleClick.bind(this));
    canvasElement.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    canvasElement.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  public stopTracking(): void {
    if (!this.canvasElement) return;

    this.isTracking = false;
    this.canvasElement.removeEventListener(
      "mousemove",
      this.handlePointerMove.bind(this)
    );
    this.canvasElement.removeEventListener(
      "click",
      this.handleClick.bind(this)
    );
    this.canvasElement.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this)
    );
    this.canvasElement.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this)
    );
  }

  private handlePointerMove(event: MouseEvent): void {
    if (!this.isTracking) return;

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveThrottle) {
      return; // Throttle to 1Hz
    }

    this.lastMoveTime = now;
    this.addPoint(event, "move");
  }

  private handleClick(event: MouseEvent): void {
    if (!this.isTracking) return;
    this.addPoint(event, "click");
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isTracking) return;

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveThrottle) {
      return; // Throttle to 1Hz
    }

    this.lastMoveTime = now;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.addPointFromTouch(touch, "move");
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isTracking) return;

    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      this.addPointFromTouch(touch, "click");
    }
  }

  private addPoint(event: MouseEvent, type: "move" | "click"): void {
    if (!this.canvasElement) return;

    const rect = this.canvasElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Normalize coordinates to canvas dimensions
    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const normalizedX = (x / rect.width) * canvasWidth;
    const normalizedY = (y / rect.height) * canvasHeight;

    this.points.push({
      x: normalizedX,
      y: normalizedY,
      type,
      timestamp: Date.now(),
      canvasWidth,
      canvasHeight,
    });
  }

  private addPointFromTouch(touch: Touch, type: "move" | "click"): void {
    if (!this.canvasElement) return;

    const rect = this.canvasElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Normalize coordinates to canvas dimensions
    const canvasWidth = this.canvasElement.width;
    const canvasHeight = this.canvasElement.height;

    const normalizedX = (x / rect.width) * canvasWidth;
    const normalizedY = (y / rect.height) * canvasHeight;

    this.points.push({
      x: normalizedX,
      y: normalizedY,
      type,
      timestamp: Date.now(),
      canvasWidth,
      canvasHeight,
    });
  }

  public async sendHeatmapData(): Promise<void> {
    if (this.points.length === 0) return;

    const heatmapData: HeatmapData = {
      event: "heatmap",
      points: [...this.points],
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch("/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([heatmapData]),
      });

      if (response.ok) {
        // Clear points after successful send
        this.points = [];
        console.debug("📊 Heatmap data sent successfully");
      } else {
        console.debug("📊 Heatmap data send failed:", response.status);
      }
    } catch (error) {
      console.debug("📊 Heatmap data send error:", error);
    }
  }

  public getPointCount(): number {
    return this.points.length;
  }

  public clearPoints(): void {
    this.points = [];
  }
}

// Create singleton instance
export const heatmapTracker = new HeatmapTracker();

// Export functions for easy use
export const startHeatmapTracking = (canvasElement: HTMLCanvasElement) => {
  heatmapTracker.startTracking(canvasElement);
};

export const stopHeatmapTracking = () => {
  heatmapTracker.stopTracking();
};

export const sendHeatmapData = () => {
  return heatmapTracker.sendHeatmapData();
};

export const getHeatmapPointCount = () => {
  return heatmapTracker.getPointCount();
};
