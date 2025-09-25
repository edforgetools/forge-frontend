import React, { useState } from 'react';

type Props = { mediaPath: string | null };

export default function ClipsCard({ mediaPath }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function generateClips() {
    if (!mediaPath) return;
    setLoading(true);
    setStatus('Generating clips…');
    try {
      const resp = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedPath: mediaPath, count: 2 }),
      });
      const data = await resp.json();
      setStatus(data?.ok ? 'Clips generated' : 'Clip generation failed');
    } catch (e) {
      setStatus('Error generating clips');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border p-4 shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-2">Clips</h3>
      <button
        disabled={!mediaPath || loading}
        onClick={generateClips}
        className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Working…' : 'Generate 2 Clips'}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
