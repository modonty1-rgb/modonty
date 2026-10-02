/**
 * Microsoft Clarity client API — custom events and custom tags.
 * Docs: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api
 *   window.clarity("event", <name>)          — shows with Smart events in Filters/Recordings
 *   window.clarity("set", <key>, <value>)    — a session tag; «There is no limit to the number of custom tags»
 *
 * Clarity loads late, from GTM (plan item ج٤). A call made before it arrives is not lost: this
 * defines the same queue stub as Clarity's own install code — `clarity.q.push(arguments)` —
 * and the Clarity tag, once loaded, runs its «start» and then the queued calls in order
 * (measured in the tag script: `a[c]("start",i),a[c].q.unshift(a[c].q.pop())`).
 */

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

function clarity(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { clarity?: ClarityFn };
    if (!w.clarity) {
      const stub: ClarityFn = function (...queued: unknown[]) {
        (stub.q = stub.q || []).push(queued);
      };
      w.clarity = stub;
    }
    w.clarity(...args);
  } catch {
    // Analytics must never break the page.
  }
}

/** A custom event — snake_case, named for what the visitor did. */
export function clarityEvent(name: string): void {
  clarity("event", name);
}

/** A session tag to filter recordings by (client, author, page type). */
export function claritySet(key: string, value: string | string[]): void {
  if (!value || (Array.isArray(value) && value.length === 0)) return;
  clarity("set", key, value);
}
