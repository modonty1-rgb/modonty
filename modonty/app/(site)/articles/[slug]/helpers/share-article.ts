/**
 * Share, and say something either way.
 *
 * It used to call the system share sheet and stop — no fallback, no feedback. On a browser
 * without one (most desktops) the tab was simply dead: the reader pressed it and nothing
 * happened at all, which reads as a broken page rather than an unsupported feature. And even
 * where it worked, nothing confirmed the press.
 *
 * Now: the share sheet when the browser has one, the clipboard when it does not, and the icon
 * turns into a tick for two seconds so the press is always answered.
 */
export async function shareArticle(): Promise<"shared" | "copied" | "cancelled"> {
  const url = typeof location !== "undefined" ? location.href : "";
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ url });
      return "shared";
    } catch {
      // The reader dismissed the sheet — not an error, and not something to fall back from.
      return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}
