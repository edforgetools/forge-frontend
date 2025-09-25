import { useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
import { clampCropToAspect } from './cropMath'

export function CropTool() {
  const frame = useEditorStore((s) => s.capturedFrame)
  const crop = useEditorStore((s) => s.crop)
  const setCrop = useEditorStore((s) => s.setCrop)

  useEffect(() => {
    if (!frame) return
    const img = new Image()
    img.onload = () => {
      const c = clampCropToAspect(img.width, img.height)
      setCrop(c)
    }
    img.src = frame
  }, [frame, setCrop])

  if (!frame || !crop) return <div className="absolute inset-0" />

  const style = {
    left: `${crop.x}px`,
    top: `${crop.y}px`,
    width: `${crop.w}px`,
    height: `${crop.h}px`,
  } as const

  return (
    <div className="absolute inset-0">
      <div
        className="absolute border-2 border-brand-500/70 bg-brand-500/5"
        style={style}
      />
    </div>
  )
}
