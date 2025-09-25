import { useEditorStore } from '@/lib/store'

export function RightPanel() {
  const selection = useEditorStore((s) => s.selection)
  const overlays = useEditorStore((s) => s.overlays)
  const setOpacity = useEditorStore((s) => s.setOverlayOpacity)

  const selected = overlays.find((o) => o.id === selection)

  return (
    <aside className="w-80 border-l border-neutral-800 p-3 space-y-4 overflow-y-auto">
      <h2 className="text-sm font-semibold">Properties</h2>
      {selected ? (
        <div className="space-y-2">
          <div className="text-xs text-neutral-400">
            Selected overlay: {selected.name}
          </div>
          <label className="text-sm">Opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selected.opacity}
            onChange={(e) => setOpacity(selected.id, Number(e.target.value))}
          />
        </div>
      ) : (
        <div className="text-neutral-400 text-sm">Nothing selected</div>
      )}
    </aside>
  )
}
