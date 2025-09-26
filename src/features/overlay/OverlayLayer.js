import { jsx as _jsx } from "react/jsx-runtime";
export function OverlayLayer({ overlay }) {
    return (_jsx("img", { src: overlay.dataUrl, alt: overlay.name, style: {
            position: 'absolute',
            left: overlay.x,
            top: overlay.y,
            width: overlay.w,
            height: overlay.h,
            opacity: overlay.opacity,
            pointerEvents: 'none',
        } }));
}
