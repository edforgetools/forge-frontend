import type { TelemetryEvent } from "@/types/telemetry";
import { env } from "@/env";

// Mock API endpoint for telemetry
// In a real implementation, this would be replaced with actual API calls
export const sendTelemetryEvent = async (
  event: TelemetryEvent
): Promise<void> => {
  // For now, just log to console in development
  if (import.meta.env.DEV) {
    console.log("[Telemetry]", event);
  }

  // In production, this would make an actual API call
  // For now, we'll simulate a successful response
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, you would:
    // 1. Send to your backend API
    // 2. Store in database
    // 3. Forward to analytics services (Supabase, etc.)

    // Example of what the real implementation might look like:
    /*
    const response = await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error(`Telemetry failed: ${response.status}`);
    }
    */
  } catch (error) {
    console.warn("Failed to send telemetry event:", error);
    throw error;
  }
};

// Batch telemetry events for better performance
export const sendBatchedTelemetryEvents = async (
  events: TelemetryEvent[]
): Promise<void> => {
  if (events.length === 0) return;

  // For now, send each event individually
  // In a real implementation, you might batch them
  const promises = events.map((event) => sendTelemetryEvent(event));
  await Promise.allSettled(promises);
};

// Send UI event to Layer API endpoint
export const sendLayerUIEvent = async (
  event: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  try {
    const layerUrl = env.VITE_FORGE_LAYER_URL;
    if (!layerUrl) {
      // No endpoint exists, queue no-op as requested
      if (import.meta.env.DEV) {
        console.debug("📊 Layer UI event queued (no-op):", { event, metadata });
      }
      return;
    }

    const response = await fetch(`${layerUrl}/forge/telemetry/ui-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event,
        ...metadata,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (import.meta.env.DEV) {
      console.debug("📊 Layer UI event sent:", { event, metadata });
    }
  } catch (error) {
    // Don't block UX if telemetry fails
    if (import.meta.env.DEV) {
      console.debug("📊 Layer UI event failed (silent):", error);
    }
  }
};

// Utility to validate telemetry events
export const validateTelemetryEvent = (event: TelemetryEvent): boolean => {
  if (!event.type || !event.timestamp || !event.sessionId) {
    return false;
  }

  // Validate required fields based on event type
  switch (event.type) {
    case "page_view":
      return typeof event.page === "string";
    case "control_change":
      return Boolean(
        event.metadata &&
          typeof event.metadata.controlType === "string" &&
          typeof event.metadata.controlId === "string"
      );
    case "generate_click":
      return Boolean(
        event.metadata && typeof event.metadata.source === "string"
      );
    case "generate_success":
      return Boolean(
        event.metadata &&
          typeof event.metadata.source === "string" &&
          typeof event.metadata.duration === "number"
      );
    case "generate_error":
      return Boolean(
        event.metadata &&
          typeof event.metadata.source === "string" &&
          typeof event.metadata.error === "string"
      );
    case "download_click":
      return Boolean(
        event.metadata &&
          typeof event.metadata.format === "string" &&
          typeof event.metadata.source === "string"
      );
    case "ui_event":
      return Boolean(
        event.metadata &&
          typeof event.metadata.event === "string" &&
          typeof event.metadata.timestamp === "string"
      );
    default:
      return false;
  }
};
