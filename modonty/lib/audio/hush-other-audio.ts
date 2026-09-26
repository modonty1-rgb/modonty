/**
 * Silence every other player on the page.
 *
 * As tabs the two sections could never both exist, so only one `<audio>` was ever mounted. Side by
 * side they are both mounted at once — measured `audioElementsOnPage: 2` — and starting an article
 * while a verse is being recited would leave a recitation playing under a marketing article. That
 * is unacceptable here for a reason that is not technical.
 *
 * Deliberately reaching across the DOM rather than lifting state into a shared context: the two
 * sections have nothing else in common, and a context binding them would be a structure invented
 * to solve one line's problem. Whoever pressed play last is the one that plays.
 */
export function hushOtherAudio(current: HTMLAudioElement | null) {
  if (typeof document === "undefined") return;
  document.querySelectorAll("audio").forEach((el) => {
    if (el !== current && !el.paused) el.pause();
  });
}
