import { Overlay } from './overlayTypes'

export function OverlayLayer({ overlay }: { overlay: Overlay }) {
  return (
    <img
      src={overlay.dataUrl}
      alt={overlay.name}
      style={{
        position: 'absolute',
        left: overlay.x,
        top: overlay.y,
        width: overlay.w,
        height: overlay.h,
        opacity: overlay.opacity,
        pointerEvents: 'none',
      }}
    />
  )
}
