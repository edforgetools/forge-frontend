export async function captureFrame(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement('canvas')
  const w = video.videoWidth
  const h = video.videoHeight
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.95)
}
