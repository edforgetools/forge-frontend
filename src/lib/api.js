import { logEvent } from "./logEvent";
const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";
async function j(path, init) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });
    if (!res.ok) {
        const error = new Error(`HTTP ${res.status} ${res.statusText} @ ${path}`);
        logEvent("error_api", {
            message: error.message,
            status: res.status,
            statusText: res.statusText,
            path,
        });
        throw error;
    }
    return (await res.json());
}
export async function apiHealth() {
    return j("/api/health");
}
export async function apiCaptions(payload) {
    return j("/api/captions", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
export async function apiLog(level, message, meta = {}) {
    try {
        await j("/api/log", {
            method: "POST",
            body: JSON.stringify({ level, message, meta }),
        });
    }
    catch {
        // silent
    }
}
export async function apiTranscribe(file) {
    const fd = new FormData();
    fd.append("file", file);
    const url = `${BASE}/api/transcribe`;
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) {
        const error = new Error(`HTTP ${res.status} ${res.statusText} @ /api/transcribe`);
        logEvent("error_api", {
            message: error.message,
            status: res.status,
            statusText: res.statusText,
            path: "/api/transcribe",
            fileName: file.name,
            fileSize: file.size,
        });
        throw error;
    }
    return res.json();
}
export async function apiExportZip(payload) {
    return j("/api/exportZip", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
