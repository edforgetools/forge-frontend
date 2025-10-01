import { useEffect, useMemo, useState } from "react";
import { apiHealth, apiCaptions, apiTranscribe, apiLog } from "./lib/api";
import { logEvent } from "./lib/logEvent";
import UndoRedoBar from "./components/UndoRedoBar";
import { useUndoRedoWithState } from "./hooks/useUndoRedo";

type Tone = "default" | "hype" | "educational";

const LS_KEY = "forge_v1_state_v2";
type Persist = {
  transcript: string;
  tweet: string;
  instagram: string;
  tone: Tone;
};

type DashboardState = {
  transcript: string;
  tweet: string;
  instagram: string;
  tone: Tone;
};

export default function ForgePlusDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<null | "transcribe" | "captions" | "zip">(
    null
  );
  const [err, setErr] = useState<string | null>(null);

  // Use undo/redo hook for text state management
  const [state, updateState, undoRedo] = useUndoRedoWithState<DashboardState>({
    transcript: "",
    tweet: "",
    instagram: "",
    tone: "default",
  });

  const { transcript, tweet, instagram, tone } = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Persist;
        updateState({
          transcript: s.transcript || "",
          tweet: s.tweet || "",
          instagram: s.instagram || "",
          tone: s.tone || "default",
        });
      }
    } catch {}
  }, [updateState]);

  useEffect(() => {
    const t = setTimeout(() => {
      const s: Persist = { transcript, tweet, instagram, tone };
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    }, 300);
    return () => clearTimeout(t);
  }, [transcript, tweet, instagram, tone]);

  const canTranscribe = useMemo(() => !!file, [file]);
  const canCaption = useMemo(() => transcript.trim().length > 0, [transcript]);
  const canZip = useMemo(
    () => tweet.trim() && instagram.trim(),
    [tweet, instagram]
  );

  function validateFile(f: File) {
    const okType =
      /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
    const okSize = f.size <= 1_000_000_000;
    if (!okType) return "Unsupported file type. Use MP4/MOV/WebM.";
    if (!okSize) return "File too large. Max 1 GB.";
    return null;
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const v = validateFile(f);
    if (v) {
      setFile(null);
      setErr(v);
      return;
    }
    setFile(f);
  }

  async function transcribe() {
    if (!file) return;
    setBusy("transcribe");
    setErr(null);
    try {
      const r = await apiTranscribe(file);
      updateState({
        ...state,
        transcript: r.text || "",
        tweet: "",
        instagram: "",
      });
    } catch (e: any) {
      setErr(e.message || "Transcription error");
      logEvent("error_transcribe", {
        message: e.message,
        fileName: file.name,
        fileSize: file.size,
      });
    } finally {
      setBusy(null);
    }
  }

  async function genCaptions() {
    setBusy("captions");
    setErr(null);
    try {
      const j = await apiCaptions({ transcript, tone });
      updateState({
        ...state,
        tweet: j.tweet || "",
        instagram: j.instagram || "",
      });
      await apiLog("info", "captions_generated", { len: transcript.length });
    } catch (e: any) {
      setErr(e.message || "Captions error");
      logEvent("error_captions", {
        message: e.message,
        transcriptLength: transcript.length,
        tone,
      });
    } finally {
      setBusy(null);
    }
  }

  async function downloadZip() {
    setBusy("zip");
    setErr(null);
    try {
      // Not yet implemented on server. Stub for now:
      alert("ExportZip endpoint not implemented in mock server");
    } catch (e: any) {
      setErr(e.message || "Export error");
      logEvent("error_export", { message: e.message });
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    ``;
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "enter" && transcript.trim()) {
        e.preventDefault();
        genCaptions();
      }
      if (
        meta &&
        e.key.toLowerCase() === "s" &&
        tweet.trim() &&
        instagram.trim()
      ) {
        e.preventDefault();
        downloadZip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transcript, tweet, instagram]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="space-y-2">
        <label htmlFor="video-upload" className="block text-sm text-text-primary">
          Upload video file
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*,.mp4,.mov,.m4v,.webm"
          onChange={onUpload}
          aria-describedby="video-upload-help"
        />
        <div id="video-upload-help" className="text-sm text-text-muted">
          Upload a video file (MP4, MOV, M4V, or WebM) up to 1GB to transcribe
        </div>
        <button
          className="btn"
          disabled={!canTranscribe || !!busy}
          onClick={transcribe}
          aria-describedby="transcribe-help"
        >
          {busy === "transcribe" ? "Transcribing…" : "Transcribe"}
        </button>
        <span id="transcribe-help" className="sr-only">
          Transcribe the uploaded video to generate text
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="tone-select" className="text-sm text-text-primary">Tone</label>
          <select
            id="tone-select"
            value={tone}
            onChange={(e) =>
              updateState({ ...state, tone: e.target.value as Tone })
            }
            className="border rounded px-2 py-1 text-sm bg-bg-secondary text-text-primary"
            aria-describedby="tone-help"
          >
            <option value="default">default</option>
            <option value="hype">hype</option>
            <option value="educational">educational</option>
          </select>
          <span id="tone-help" className="sr-only">
            Select the tone for generated captions
          </span>
        </div>

        {/* Undo/Redo Bar */}
        <div className="flex items-center gap-4">
          <UndoRedoBar
            canUndo={undoRedo.canUndo}
            canRedo={undoRedo.canRedo}
            onUndo={undoRedo.undo}
            onRedo={undoRedo.redo}
            disabled={!!busy}
          />
          <div className="text-xs text-gray-400">
            Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo
          </div>
        </div>
      </div>

      {err && (
        <pre role="alert" className="text-red-500 text-xs whitespace-pre-wrap">
          {err}
        </pre>
      )}

      <div className="space-y-2">
        <label htmlFor="transcript-textarea" className="block text-sm font-medium text-text-primary">Transcript</label>
        <textarea
          id="transcript-textarea"
          className="w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary"
          value={transcript}
          onChange={(e) =>
            updateState({ ...state, transcript: e.target.value })
          }
          placeholder="Transcript will appear here…"
          aria-describedby="transcript-help"
        />
        <div id="transcript-help" className="text-sm text-text-muted">
          Edit the transcript text or paste your own content
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn"
          disabled={!canCaption || !!busy}
          onClick={genCaptions}
        >
          {busy === "captions" ? "Generating…" : "Generate 2 Captions"}
        </button>
        <button
          className="btn"
          disabled={!canZip || !!busy}
          onClick={downloadZip}
        >
          {busy === "zip" ? "Packaging…" : "Download Zip"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tweet-textarea" className="block text-sm font-medium text-text-primary">Tweet</label>
          <textarea
            id="tweet-textarea"
            className="w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary"
            value={tweet}
            onChange={(e) => updateState({ ...state, tweet: e.target.value })}
            aria-describedby="tweet-help"
          />
          <div id="tweet-help" className="text-sm text-text-muted">
            Generated Twitter caption
          </div>
        </div>
        <div>
          <label htmlFor="instagram-textarea" className="block text-sm font-medium text-text-primary">Instagram</label>
          <textarea
            id="instagram-textarea"
            className="w-full border rounded p-2 h-32 bg-bg-secondary text-text-primary"
            value={instagram}
            onChange={(e) =>
              updateState({ ...state, instagram: e.target.value })
            }
            aria-describedby="instagram-help"
          />
          <div id="instagram-help" className="text-sm text-text-muted">
            Generated Instagram caption
          </div>
        </div>
      </div>
    </div>
  );
}
