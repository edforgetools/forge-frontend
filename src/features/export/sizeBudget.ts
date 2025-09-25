/**
 * exportUnder2MB — Encode a canvas to JPEG ≤ 2 MiB using binary search on quality
 * and progressive downscaling if quality floor is reached.
 *
 * Backward compatible signature:
 *   exportUnder2MB(canvas, 'image/jpeg') // old style, mime string ignored
 * New preferred signature:
 *   exportUnder2MB(canvas, 2 * 1024 * 1024)
 */
export async function exportUnder2MB(
  canvas: HTMLCanvasElement,
  arg1?: number | string,
  options?: {
    minQuality?: number
    maxQuality?: number
    minWidth?: number
    minHeight?: number
  },
): Promise<Blob | null> {
  const maxBytes: number = typeof arg1 === 'number' ? arg1 : 2 * 1024 * 1024
  const minQ = options?.minQuality ?? 0.5 // quality floor
  const maxQ = options?.maxQuality ?? 0.95 // start high
  const minW = options?.minWidth ?? 960 // do not downscale below 960x540 by default
  const minH = options?.minHeight ?? 540

  const attemptEncode = (c: HTMLCanvasElement, q: number) =>
    new Promise<Blob>((resolve, reject) => {
      if (!c.toBlob) return reject(new Error('Canvas.toBlob not supported'))
      c.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Encode failed'))),
        'image/jpeg',
        q,
      )
    })

  const binarySearchQuality = async (c: HTMLCanvasElement) => {
    let low = minQ,
      high = maxQ
    let best: Blob | null = null
    for (let i = 0; i < 8; i++) {
      const mid = (low + high) / 2
      const blob = await attemptEncode(c, mid)
      const ok = blob.size <= maxBytes
      if (ok) {
        best = blob
        low = mid
      } else {
        high = mid
      }
    }
    if (!best) {
      const blob = await attemptEncode(c, low)
      return blob.size <= maxBytes ? blob : null
    }
    return best
  }

  const downscale = (c: HTMLCanvasElement, factor: number) => {
    const w = Math.max(Math.floor(c.width * factor), minW)
    const h = Math.max(Math.floor(c.height * factor), minH)
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('2D context unavailable')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(c, 0, 0, w, h)
    return off
  }

  // 1) Try quality search at current size
  const result = await binarySearchQuality(canvas)
  if (result && result.size <= maxBytes) return result

  // 2) Progressive downscale if still too large
  let work = canvas
  const factors = [0.9, 0.85, 0.8, 0.75, 0.7]
  for (const f of factors) {
    if (work.width <= minW || work.height <= minH) break
    work = downscale(work, f)
    const candidate = await binarySearchQuality(work)
    if (candidate && candidate.size <= maxBytes) return candidate
  }

  // 3) Last try at min bounds
  if (work.width > minW || work.height > minH) {
    const atMin = downscale(
      work,
      Math.min(minW / work.width, minH / work.height),
    )
    const candidate = await binarySearchQuality(atMin)
    if (candidate && candidate.size <= maxBytes) return candidate
  }

  return null
}

// Convenience helper that integrates with window.__forgeAnalytics if present
export async function exportAndTrack(
  canvas: HTMLCanvasElement,
  arg1?: number | string,
): Promise<Blob | null> {
  try {
    const blob = await exportUnder2MB(canvas, arg1)
    if (blob) {
      if (
        typeof window !== 'undefined' &&
        window.__forgeAnalytics?.exportSuccess
      ) {
        window.__forgeAnalytics.exportSuccess({ size: blob.size })
      }
      return blob
    } else {
      if (
        typeof window !== 'undefined' &&
        window.__forgeAnalytics?.exportFail
      ) {
        window.__forgeAnalytics.exportFail({ reason: 'size_budget_failed' })
      }
      return null
    }
  } catch {
    if (typeof window !== 'undefined' && window.__forgeAnalytics?.exportFail) {
      window.__forgeAnalytics.exportFail({ reason: 'exception' })
    }
    return null
  }
}
