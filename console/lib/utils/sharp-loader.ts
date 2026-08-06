import "server-only";

import { createRequire } from "node:module";

import type Sharp from "sharp";

/**
 * The ONE way to get `sharp` in this app. Mirrors `admin/lib/utils/sharp-loader.ts`
 * deliberately — same failure, same fix, and the monorepo already duplicates small
 * server-only utils per app (`db.ts`, `auth.ts`) rather than sharing them.
 *
 * `await import("sharp")` (and even `createRequire` inside a `"use server"` file) goes
 * through Turbopack's `[externals]` wrapper, which intermittently fails to dlopen the
 * native binary on Windows — `ERR_DLOPEN_FAILED` — and can take the whole dev server down.
 * A plain Node require rooted in a dedicated server-only module loads it reliably.
 * Cached after the first call.
 */
const requireCjs = createRequire(import.meta.url);
let sharpMod: typeof Sharp | null = null;

export function loadSharp(): typeof Sharp {
  if (!sharpMod) sharpMod = requireCjs("sharp") as typeof Sharp;
  return sharpMod;
}
