/**
 * Simple timestamp helper used for legacy JSON-LD timing.
 * Kept minimal and browser-safe; no Node-only dependencies.
 */
export function getPerformanceNow(): number {
  if (typeof window !== "undefined" && window.performance?.now) {
    return window.performance.now();
  }
  return Date.now();
}
