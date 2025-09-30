export interface LogEventPayload {
  name: string;
  meta?: Record<string, unknown>;
}

export function logEvent(name: string, meta?: Record<string, unknown>): void {
  const payload: LogEventPayload = {
    name,
    meta,
  };

  try {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Swallow errors as requested
    });
  } catch {
    // Swallow errors as requested
  }
}
