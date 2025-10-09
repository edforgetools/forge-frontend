/**
 * Frontend telemetry layer for tracking user interactions and events
 */

interface TelemetryEvent {
  event: string;
  meta: Record<string, any>;
  sessionId: string;
  timestamp: number;
}

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  const key = "snapthumb_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Debounce utility
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

// Check if we're in development mode
const isDev = import.meta.env.DEV;

// Create debounced telemetry sender
const createDebouncedSender = () => {
  const pendingEvents: TelemetryEvent[] = [];

  const sendBatch = async () => {
    if (pendingEvents.length === 0) return;

    const events = [...pendingEvents];
    pendingEvents.length = 0; // Clear the array

    try {
      const response = await fetch("/telemetry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(events),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (isDev) {
        console.debug("📊 Telemetry sent successfully:", events);
      }
    } catch (error) {
      // Fail silently as requested
      if (isDev) {
        console.debug("📊 Telemetry failed (silent):", error);
      }
    }
  };

  return debounce(sendBatch, 250);
};

// Create the debounced sender instance
const debouncedSender = createDebouncedSender();

/**
 * Send telemetry event to the server
 * @param event - Event name
 * @param meta - Event metadata
 */
export const sendTelemetry = (
  event: string,
  meta: Record<string, any> = {}
): void => {
  const telemetryEvent: TelemetryEvent = {
    event,
    meta,
    sessionId: getSessionId(),
    timestamp: Date.now(),
  };

  // Add to pending events and trigger debounced send
  const pendingEvents = (debouncedSender as any).__pendingEvents || [];
  pendingEvents.push(telemetryEvent);
  (debouncedSender as any).__pendingEvents = pendingEvents;

  // Trigger the debounced sender
  debouncedSender();

  if (isDev) {
    console.debug("📊 Telemetry queued:", { event, meta });
  }
};

/**
 * Send telemetry event immediately (bypasses debouncing)
 * @param event - Event name
 * @param meta - Event metadata
 */
export const sendTelemetryImmediate = async (
  event: string,
  meta: Record<string, any> = {}
): Promise<void> => {
  const telemetryEvent: TelemetryEvent = {
    event,
    meta,
    sessionId: getSessionId(),
    timestamp: Date.now(),
  };

  try {
    const response = await fetch("/telemetry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([telemetryEvent]),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (isDev) {
      console.debug("📊 Telemetry sent immediately:", { event, meta });
    }
  } catch (error) {
    // Fail silently as requested
    if (isDev) {
      console.debug("📊 Immediate telemetry failed (silent):", error);
    }
  }
};
