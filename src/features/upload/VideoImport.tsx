import { useRef, useState } from 'react'
import { captureFrame } from '@/features/frame/captureFrame'
import { useEditorStore } from '@/lib/store'

export function VideoImport() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const setCapturedFrame = useEditorStore((s) => s.setCapturedFrame)

  return (
    <div className="space-y-2">
      <label className="block text-sm">Video</label>
      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setVideoUrl(URL.createObjectURL(file))
        }}
      />

      {videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            ref={videoRef}
            className="w-full rounded"
          />
          <button
            className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
            onClick={async () => {
              if (!videoRef.current) return
              const dataUrl = await captureFrame(videoRef.current)
              setCapturedFrame(dataUrl)
            }}
          >
            Capture Frame
          </button>
        </div>
      )}
    </div>
  )
}
