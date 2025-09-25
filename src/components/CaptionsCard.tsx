import React from 'react';

type Props = { data?: any; onGenerate: ()=>void; loading: boolean; };
export default function CaptionsCard({ data, onGenerate, loading }: Props){
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Social Captions</h3>
        <button onClick={onGenerate} className="px-3 py-1 rounded bg-black text-white" disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {data && (
        <div className="mt-3 space-y-3">
          <div><div className="text-sm font-medium">Tweet</div><p className="text-sm">{data.tweet}</p></div>
          <div><div className="text-sm font-medium">Instagram</div><p className="text-sm">{data.instagram}</p></div>
        </div>
      )}
    </div>
  );
}
