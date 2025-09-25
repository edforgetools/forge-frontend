import { VideoImport } from '@/features/upload/VideoImport'
import { useEditorStore } from '@/lib/store'
import { fToDataUrl } from '@/lib/dom'

export function LeftSidebar() {
  return (
    <aside className="w-72 border-r border-neutral-800 p-3 space-y-4 overflow-y-auto">
      <h2 className="text-sm font-semibold">Assets</h2>
      <VideoImport />
      <div className="space-y-2">
        <label className="block text-sm">Logo</label>
        <input
          type="file"
          accept="image/png,image/svg+xml"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            const dataUrl = await fToDataUrl(f)
            const id = crypto.randomUUID()
            const s = useEditorStore.getState()
            s.addOverlay({
              id,
              name: f.name,
              x: 24,
              y: 24,
              w: 180,
              h: 64,
              opacity: 0.85,
              dataUrl,
            })
            s.setSelection(id)
          }}
        />
      </div>
      <div>
        <h3 className="text-xs uppercase text-neutral-400 mb-2">Tools</h3>
        <ul className="space-y-1 text-sm">
          <li>Crop (16:9)</li>
          <li>Overlay (Logo)</li>
        </ul>
      </div>
    </aside>
  )
}
