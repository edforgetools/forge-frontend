import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { exportUnder2MB } from './sizeBudget'

const ctxStub: Partial<CanvasRenderingContext2D> = {
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  // @ts-expect-error runtime property not typed strictly
  imageSmoothingQuality: 'high',
}

let getContextSpy: ReturnType<typeof vi.spyOn>
let toBlobSpy: ReturnType<typeof vi.spyOn>

beforeAll(() => {
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => ctxStub as CanvasRenderingContext2D)

  toBlobSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'toBlob')
    .mockImplementation(function (
      callback: BlobCallback,
      type?: string,
      quality?: number,
    ): void {
      const q = typeof quality === 'number' ? quality : 0.9
      const size = q > 0.75 ? 2_400_000 : 1_500_000
      const blob = new Blob([new Uint8Array(size)], {
        type: type || 'image/jpeg',
      })
      callback(blob)
    })
})

afterAll(() => {
  getContextSpy.mockRestore()
  toBlobSpy.mockRestore()
})

describe('exportUnder2MB', () => {
  it('exports something (smoke)', async () => {
    const c = document.createElement('canvas')
    c.width = 1920
    c.height = 1080
    const ctx = c.getContext('2d')!
    // @ts-expect-error fillStyle is fine at runtime
    ctx.fillStyle = '#123456'
    ctx.fillRect(0, 0, c.width, c.height)

    const blob = await exportUnder2MB(c, 'image/jpeg')
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.size).toBeLessThanOrEqual(2_000_000)
  })
})
