import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { captureFrame } from "@/features/frame/captureFrame";
import { useEditorStore } from "@/lib/store";
export function VideoImport() {
    const [videoUrl, setVideoUrl] = useState(null);
    const videoRef = useRef(null);
    const setCapturedFrame = useEditorStore((s) => s.setCapturedFrame);
    return (_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "video-import", className: "block text-sm", children: "Video" }), _jsx("input", { id: "video-import", type: "file", accept: "video/mp4,video/webm,video/quicktime", onChange: (e) => {
                    const file = e.target.files?.[0];
                    if (!file)
                        return;
                    setVideoUrl(URL.createObjectURL(file));
                } }), videoUrl && (_jsxs("div", { className: "space-y-2", children: [_jsx("video", { src: videoUrl, controls: true, ref: videoRef, className: "w-full rounded" }), _jsx("button", { className: "px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700", onClick: async () => {
                            if (!videoRef.current)
                                return;
                            const dataUrl = await captureFrame(videoRef.current);
                            setCapturedFrame(dataUrl);
                        }, children: "Capture Frame" })] }))] }));
}
