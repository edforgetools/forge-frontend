/* Lightweight analytics helper compatible with Plausible */
export function track(event, props) {
    try {
        const fn = typeof window !== 'undefined' ? window.plausible : undefined;
        if (typeof fn === 'function') {
            fn(event, props ? { props } : undefined);
        }
    }
    catch {
        /* no-op */
    }
}
export const Analytics = {
    open() {
        track('app_open');
    },
    exportSuccess(details) {
        track('export_success', details);
    },
    exportFail(details) {
        track('export_fail', details);
    },
};
