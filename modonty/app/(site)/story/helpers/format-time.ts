/** `m:ss` of a playhead position — the story player's clock. */
export function formatTime(t: number): string {
  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
