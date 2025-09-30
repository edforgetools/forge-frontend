export function logEvent(name, meta) {
    const payload = {
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
    }
    catch {
        // Swallow errors as requested
    }
}
