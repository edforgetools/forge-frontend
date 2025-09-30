export function logEvent(event, data) {
    const payload = {
        event,
        data,
        ts: Date.now(),
        ua: navigator.userAgent,
        url: location.href,
    };
    try {
        fetch("/api/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(() => {
            // Swallow errors as requested
        });
    }
    catch {
        // Swallow errors as requested
    }
}
// Keep the existing logClientError for backward compatibility
export function logClientError(e, extra) {
    const payload = {
        t: Date.now(),
        ua: navigator.userAgent,
        msg: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
        ...extra,
    };
    try {
        // best-effort send (do not block UI)
        fetch("/api/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(() => { });
    }
    catch { }
    // always echo to console for local dev
    // eslint-disable-next-line no-console
    console.error("[forge]", payload);
}
