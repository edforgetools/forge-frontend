import React from 'react';

type Props = { data?: any; onGenerate: ()=>void; loading: boolean; };
export default function SummaryCard({ data, onGenerate, loading }: Props){
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Summaries & SEO</h3>
        <button onClick={onGenerate} className="px-3 py-1 rounded bg-black text-white" disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {data && (
        <div className="mt-3 space-y-3">
          <div><div className="text-sm font-medium">Short Summary</div><p className="text-sm">{data.short_summary}</p></div>
          <div><div className="text-sm font-medium">Long Summary</div><p className="text-sm">{data.long_summary}</p></div>
          <div><div className="text-sm font-medium">SEO Titles</div><ul className="list-disc pl-5 text-sm">{(data.seo_titles||[]).map((t:string,i:number)=>(<li key={i}>{t}</li>))}</ul></div>
          <div><div className="text-sm font-medium">YouTube Description</div><pre className="text-xs whitespace-pre-wrap">{data.youtube_description}</pre></div>
        </div>
      )}
    </div>
  );
}
