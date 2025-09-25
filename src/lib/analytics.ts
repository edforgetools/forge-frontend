/* Lightweight analytics helper compatible with Plausible */

type PlausibleFn = (
  name: string,
  opts?: { props?: Record<string, unknown> },
) => void

declare global {
  interface Window {
    plausible?: PlausibleFn
    __forgeAnalytics?: {
      exportSuccess?: (details?: Record<string, unknown>) => void
      exportFail?: (details?: Record<string, unknown>) => void
    }
  }
}

export type ForgeEvent = 'app_open' | 'export_success' | 'export_fail'

export function track(event: ForgeEvent, props?: Record<string, unknown>) {
  try {
    const fn: PlausibleFn | undefined =
      typeof window !== 'undefined' ? window.plausible : undefined
    if (typeof fn === 'function') {
      fn(event, props ? { props } : undefined)
    }
  } catch {
    /* no-op */
  }
}

export const Analytics = {
  open() {
    track('app_open')
  },
  exportSuccess(details?: Record<string, unknown>) {
    track('export_success', details)
  },
  exportFail(details?: Record<string, unknown>) {
    track('export_fail', details)
  },
}
