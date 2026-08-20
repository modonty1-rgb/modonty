"use client";

import dynamic from "next/dynamic";

/**
 * The dialog costs the page nothing until a signed-out reader taps an action.
 *
 * `ssr: false` keeps it out of the server render, and `dynamic` keeps its code in a chunk the
 * browser only fetches on that first tap — so a reader who never signs in, and every crawler,
 * download exactly zero bytes of it. Performance is the reason this file exists at all; without
 * it the dialog would ship with every article view for the few who use it.
 */
// `mod.AuthPrompt`, not `{ default: mod.AuthPrompt }` — the shape the installed Next 16 docs
// give for a named export (`node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:170`).
// Wrapping it in `{ default }` rendered an empty dialog: the overlay and the scroll lock were
// there, the content was not.
export const AuthPromptLazy = dynamic(() => import("./AuthPrompt").then((mod) => mod.AuthPrompt), {
  ssr: false,
});

/**
 * Fetch the chunk the moment a signed-out reader reaches for the tabs, so the tap itself opens
 * the dialog instead of starting a download.
 *
 * Measured on the like tab: the click fetched the chunk and the dialog appeared 2,349ms later —
 * that whole time the tap looked like it had done nothing. Hovering or pressing happens before
 * the click, which is enough to cover the fetch, and a reader who never approaches the tabs
 * still downloads nothing. Plain ES `import()` of the same literal path: the bundler serves the
 * one chunk and the module cache makes the second call free.
 */
export function warmAuthPrompt() {
  void import("./AuthPrompt");
}
