export function clampCropToAspect(srcW, srcH, aspect = 16 / 9) {
    // Fit a 16:9 rectangle inside the source
    const srcAspect = srcW / srcH;
    if (srcAspect > aspect) {
        const h = srcH;
        const w = h * aspect;
        const x = (srcW - w) / 2;
        return { x, y: 0, w, h };
    }
    else {
        const w = srcW;
        const h = w / aspect;
        const y = (srcH - h) / 2;
        return { x: 0, y, w, h };
    }
}
