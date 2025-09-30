import React, { useState } from "react";

type Props = {
  text: string;
  setMediaPath: (p: string) => void;
  setText: (t: string) => void;
};

export default function TranscriptCard({ text, setMediaPath, setText }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setStatus("Uploading…");
    try {
      const form = new FormData();
      form.append("file", file);
      const resp = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      let data: any;
      try {
        data = await resp.json();
      } catch {
        data = { ok: false, error: "bad_json" };
      }

      if (data?.savedPath) {
        setMediaPath(data.savedPath);
      }
      if (data?.transcript) {
        setText(data.transcript);
        setStatus("Transcribed");
      } else {
        setText("");
        setStatus("Transcription failed. Using uploaded file for clips.");
      }
    } catch (e) {
      setStatus("Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Transcript</h3>
      <label htmlFor="transcript-upload" className="block mb-2 text-sm">
        Upload audio/video to transcribe
      </label>
      <input
        id="transcript-upload"
        type="file"
        accept="audio/*,video/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUpload(f);
        }}
      />
      {loading && <div className="mt-2 text-sm">Transcribing…</div>}
      {status && <div className="mt-1 text-xs text-neutral-600">{status}</div>}
      <label htmlFor="transcript-text" className="sr-only">
        Transcript text
      </label>
      <textarea
        id="transcript-text"
        className="mt-3 w-full h-48 border rounded p-2 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="text-xs text-neutral-500 mt-1">
        Export coming soon (.txt / .srt)
      </div>
    </div>
  );
}
