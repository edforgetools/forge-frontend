import { useEditorStore } from '@/lib/store'
import { CropTool } from '@/features/crop/CropTool'
import { OverlayLayer } from '@/features/overlay/OverlayLayer'

export function EditorCanvas() {
  const frame = useEditorStore((s) => s.capturedFrame)
  const overlays = useEditorStore((s) => s.overlays)
  return (
    <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-video bg-neutral-950">
      {frame ? (
        <img
          src={frame}
          alt="captured"
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <div className="grid place-items-center h-full text-neutral-500">
          Capture a frame to begin
        </div>
      )}
      <CropTool />
      {overlays.map((o) => (
        <OverlayLayer key={o.id} overlay={o} />
      ))}
    </div>
  )
}
