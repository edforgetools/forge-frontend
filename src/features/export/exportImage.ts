import { Overlay } from '@/features/overlay/overlayTypes'
import { exportUnder2MB } from './sizeBudget'

export async function composeAndExport(
  baseDataUrl: string,
  crop: { x: number; y: number; w: number; h: number },
  overlays: Overlay[],
  mime: 'image/jpeg' | 'image/png' = 'image/jpeg',
) {
  const img = await load(baseDataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = crop.w
  canvas.height = crop.h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
  for (const o of overlays) {
    const oi = await load(o.dataUrl)
    ctx.globalAlpha = o.opacity
    ctx.drawImage(oi, o.x - crop.x, o.y - crop.y, o.w, o.h)
  }
  return exportUnder2MB(canvas, mime)
}

function load(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = src
  })
}
