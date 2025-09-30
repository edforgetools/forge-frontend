import { logEvent } from "./logEvent";

const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";

type Json = Record<string, unknown>;

async function j<T>(path: string, init?: RequestInit): Promise<T> {
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
  return (await res.json()) as T;
}

export async function apiHealth() {
  return j<{ ok: boolean; mock: boolean; serverTime: string }>("/api/health");
}

export async function apiCaptions(payload: {
  transcript: string;
  tone?: string;
  maxLen?: number;
}) {
  return j<{ tweet: string; instagram: string; youtube: string }>(
    "/api/captions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function apiLog(
  level: "info" | "warn" | "error",
  message: string,
  meta: Json = {}
) {
  try {
    await j<{ ok: boolean }>("/api/log", {
      method: "POST",
      body: JSON.stringify({ level, message, meta }),
    });
  } catch {
    // silent
  }
}

export async function apiTranscribe(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const url = `${BASE}/api/transcribe`;
  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const error = new Error(
      `HTTP ${res.status} ${res.statusText} @ /api/transcribe`
    );
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
  return res.json() as Promise<{
    ok: boolean;
    mock: boolean;
    language: string;
    text: string;
  }>;
}

export async function apiExportZip(payload: {
  platforms: string[];
  captions: Record<string, string>;
}) {
  return j<{ downloadUrl: string }>("/api/exportZip", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
