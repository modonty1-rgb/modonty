import "server-only";

/**
 * Bunny Edge Storage client — SHARED (console uploads + admin migration/cleanup).
 * Ported from the proven JBRSEO content app implementation (2026-07-06).
 * The storage passwords are server-only and must NEVER reach the browser;
 * all uploads are proxied through an app server route/action.
 *
 * Three named zones (locked naming, 2026-07-06/07):
 *   reels   → modonty-reels-media  — ALL reels files incl. client-gallery images (unified source)
 *   clients → modonty-clients      — future client profile assets (logo/hero/verification)
 *   assets  → modonty-asset        — Modonty platform assets (OG, tags, industry heroes)
 */

export type BunnyZone = "reels" | "clients" | "assets";

interface ZoneConfig {
  zone: string | undefined;
  key: string | undefined;
  cdn: string | undefined;
}

function zoneConfig(zone: BunnyZone): { zone: string; key: string; cdn: string } {
  const map: Record<BunnyZone, ZoneConfig> = {
    reels: {
      zone: process.env.BUNNY_REELS_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_REELS_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_REELS_PULL_ZONE_HOSTNAME,
    },
    clients: {
      zone: process.env.BUNNY_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_PULL_ZONE_HOSTNAME,
    },
    assets: {
      zone: process.env.BUNNY_ASSETS_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_ASSETS_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_ASSETS_PULL_ZONE_HOSTNAME,
    },
  };
  const cfg = map[zone];
  if (!cfg.zone || !cfg.key || !cfg.cdn) {
    throw new Error(`Bunny env missing for zone "${zone}" — check BUNNY_* keys in .env.shared`);
  }
  return { zone: cfg.zone, key: cfg.key, cdn: cfg.cdn };
}

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+/g, "/");
}

/**
 * Media-library folder per MediaType (locked structure, Khalid 2026-07-28):
 * `/{typeFolder}/{owner}/{filename}` so a whole type reads as one folder.
 * `owner` = client slug, or `_platform` / `_general` for client-less media.
 */
const MEDIA_TYPE_FOLDER: Record<string, string> = {
  LOGO: "logo",
  POST: "post",
  OGIMAGE: "og",
  TWITTER_IMAGE: "twitter",
  HERO: "hero",
  GENERAL: "general",
  GALLERY: "gallery",
  CLIENT_MINI: "client-mini",
};

function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return "";
  return filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "");
}

/**
 * Filename-safe suffixes for Google's 3 article aspect ratios (JSON-LD crops).
 * Bunny is storage-only (no on-the-fly crop like Cloudinary) → the 3 crops are
 * pre-generated at upload and stored next to the base image with these suffixes.
 */
export const BUNNY_ASPECT_SUFFIX = { "1:1": "1x1", "4:3": "4x3", "16:9": "16x9" } as const;

/**
 * Make one path segment safe to live in an object key.
 *
 * Keep Arabic (and every other script) — it is a real SEO signal in the filename and the
 * Arabic owner folder already proves the CDN serves it. Strip ONLY what breaks a URL path:
 * separators, query/fragment delimiters, and whitespace. Cap the length so a long article
 * title cannot push the object key past what the storage API accepts.
 */
export function sanitizeBunnyBase(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/?#%&+:*"'<>|\s]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      // 125 = the alt-text limit, so a name derived from a full alt is never cut here after the
      // deriving function already accepted it. MUST stay equal to MAX_FILE_BASE in
      // seo/media/alt-to-filename.ts: if this one is smaller, the editor is shown a name the
      // file will not actually carry. Bunny's own documented ceiling is 6,000.
      .slice(0, 125) || "media"
  );
}

/**
 * Derive an aspect-crop url/path from a base image: `a/b.jpg` + `16x9` → `a/b__16x9.webp`.
 * Crops are ALWAYS WebP (sharp output) → force the `.webp` extension so the CDN serves the
 * correct `image/webp` content-type regardless of the base image's format. Works on urls or paths.
 */
/**
 * Do the three aspect crops exist for this url?
 *
 * They are generated at upload for ONE media type — `POST`, the article image
 * (`admin/…/media/actions/bunny-mirror-core.ts:55` — `if (input.type === "POST")`), and
 * `buildBunnyMediaPath` files that type under `post/`. So the folder IS the answer.
 *
 * Everything else on the CDN has a base image and nothing beside it, and deriving
 * `__16x9.webp` there is a 404. Measured 2026-08-14:
 *   `modonty-clients.b-cdn.net/post/…/x__16x9.webp`      → 200, WebP 1200×675
 *   `modonty-asset.b-cdn.net/brand/modonty-logo__16x9.webp` → 404
 *
 * If crops are ever generated for another type, widen BOTH sides together — this check
 * and the `input.type` condition in the mirror — or metadata will promise a missing file.
 */
export function hasBunnyAspectCrops(url: string): boolean {
  if (!url.includes(".b-cdn.net")) return false;
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    path = url;
  }
  return normalizePath(path).split("/")[0] === MEDIA_TYPE_FOLDER.POST;
}

export function bunnyAspectUrl(baseUrlOrPath: string, suffix: string): string {
  const q = baseUrlOrPath.indexOf("?");
  const main = q === -1 ? baseUrlOrPath : baseUrlOrPath.slice(0, q);
  const query = q === -1 ? "" : baseUrlOrPath.slice(q);
  const slash = main.lastIndexOf("/");
  const dot = main.lastIndexOf(".");
  const stem = dot > slash ? main.slice(0, dot) : main;
  return `${stem}__${suffix}.webp${query}`;
}

/**
 * Build the Bunny remote path for a media file — used by dual-write, migration, and move.
 *
 * ── Why `uniqueKey` is REQUIRED (data-loss fix, 2026-08-07) ─────────────────────────────
 * This used to sanitise the basename with `[^A-Za-z0-9._-]` and fall back to the literal
 * string `"file"` when nothing survived. An Arabic filename survives that filter as
 * NOTHING — so every Arabic-named image for one client+type landed on ONE key
 * (`post/<client>/file.webp`) and silently OVERWROTE the previous one, together with its
 * three `__1x1/__4x3/__16x9` crops that the Article JSON-LD points at.
 *
 * Measured on production the same day: 7 shared keys · 25 rows · 18 of them serving an
 * image that is not theirs · 2 serving 404. It reached readers, not just the admin UI.
 *
 * Two independent defects lived in that one line:
 *   1. Arabic was stripped needlessly. The OWNER folder already carries the Arabic client
 *      slug and serves fine — `post/دكتور-أحمد-شيخ-العرب/webp-hyk9knwda.webp` → HTTP 200 —
 *      so Bunny was never the constraint; our filter was.
 *   2. The name was not guaranteed unique. Two files called `banner.jpg` under the same
 *      client collide identically; Arabic only made the collision certain every time
 *      rather than occasional.
 *
 * Requiring `uniqueKey` turns "did you make this unique?" into a compile error at the call
 * site — the only place that knows. Pass something STABLE per image (a content hash on
 * upload, the existing suffix on a move). Never a random token: the migration is expected
 * to be re-runnable, and randomness would write a fresh object on every pass instead of
 * overwriting its own.
 */
export function buildBunnyMediaPath(opts: {
  type?: string | null;
  scope?: string | null;
  clientSlug?: string | null;
  filename: string;
  publicId?: string | null;
  /** REQUIRED. Stable per image — see the note above. Empty is rejected, not defaulted. */
  uniqueKey: string;
}): string {
  const typeFolder = MEDIA_TYPE_FOLDER[opts.type ?? "GENERAL"] ?? "general";
  const owner = opts.clientSlug
    ? opts.clientSlug.trim().replace(/\/+/g, "-")
    : opts.scope === "PLATFORM"
      ? "_platform"
      : "_general";
  const ext = fileExtension(opts.filename);
  // Cloudinary public_id is globally unique → its last segment is already a good basename.
  const rawBase = opts.publicId
    ? opts.publicId.split("/").pop() || opts.publicId
    : opts.filename.replace(/\.[^.]+$/, "");

  const base = sanitizeBunnyBase(rawBase);

  const key = opts.uniqueKey.trim().replace(/[^A-Za-z0-9]/g, "");
  if (!key) throw new Error("buildBunnyMediaPath: uniqueKey is required and must not be empty");

  return normalizePath(`${typeFolder}/${owner}/${base}-${key}${ext}`);
}

/**
 * Read back the unique suffix `buildBunnyMediaPath` wrote into an object key.
 *
 * A RENAME (SEO filename) and a MOVE (type/client folder) both rewrite the path of a file
 * that is still the SAME image — so both must reuse the key the object already carries
 * instead of minting a new one. Minting a fresh key on a rename would leave the old object
 * orphaned under a key nothing points at, and re-running the operation would pile up copies;
 * reusing it keeps the operation idempotent, which is the whole point of the 2026-08-07 fix.
 *
 * Returns `null` for objects written BEFORE that fix (no suffix at all) — the caller must
 * then supply its own stable key (the media id is the obvious one). Deliberately not
 * defaulted here: only the call site knows what is stable for its row.
 */
/**
 * Does this trailing token look like a generated key rather than a real word?
 *
 * "6+ alphanumerics" alone is not enough: it swallows ordinary descriptive endings —
 * `blur-test-upload` reads as base `blur-test` + key `upload`, which then displays and scores
 * a name the file does not have (caught in live testing 2026-08-13). Every key this codebase
 * generates mixes digits with letters (a content hash, a Mongo id, the console's base-36
 * suffix), so require that mix — with an escape hatch for an all-numeric hex hash.
 */
function looksLikeUniqueKey(token: string): boolean {
  if (token.length < 6) return false;
  const hasDigit = /\d/.test(token);
  const hasLetter = /[A-Za-z]/.test(token);
  return (hasDigit && hasLetter) || /^[0-9a-f]{10,}$/i.test(token);
}

export function extractBunnyUniqueKey(urlOrPath: string): string | null {
  const main = urlOrPath.split("?")[0] ?? "";
  const last = main.split("/").pop() ?? "";
  // Arabic basenames travel the wire percent-encoded; compare on the decoded form.
  let stem: string;
  try {
    stem = decodeURIComponent(last);
  } catch {
    stem = last; // malformed escape — fall back to the raw segment rather than throwing
  }
  stem = stem.replace(/\.[^.]+$/, "");
  const token = stem.match(/-([A-Za-z0-9]{6,})$/)?.[1];
  return token && looksLikeUniqueKey(token) ? token : null;
}

/**
 * Which zone actually serves this url.
 *
 * A media row is NOT always on the `clients` zone: admin uploads land there, but a client
 * gallery image uploaded from the console lives on the `reels` zone under a different folder
 * scheme (`clients/<clientId>/gallery/…`). Code that hardcodes one zone silently no-ops on
 * the other — `extractBunnyPath` returns null and the operation is skipped without an error.
 * Resolve the zone from the url instead of assuming it.
 *
 * Returns null for a url this deployment does not serve. A zone whose env is missing is
 * skipped rather than throwing, so one unconfigured zone cannot break the lookup.
 */
export function bunnyZoneOfUrl(url: string | null | undefined): BunnyZone | null {
  if (!url) return null;
  for (const zone of ["clients", "reels", "assets"] as const) {
    try {
      if (isBunnyUrl(zone, url)) return zone;
    } catch {
      // zone not configured in this environment — not a match, keep looking
    }
  }
  return null;
}

/**
 * A TRUE rename: same folder, same unique suffix, same extension — only the descriptive part
 * of the file name changes.
 *
 * Deliberately NOT `buildBunnyMediaPath`: that one imposes the admin library's
 * `{type}/{owner}/` convention, so using it to rename a console-uploaded gallery image would
 * silently RELOCATE the file instead of renaming it. A rename must not move anything.
 *
 * `fallbackKey` is used only when the object predates the unique-suffix rule (2026-08-07) and
 * carries none — pass something stable per row, never a random token.
 */
export function bunnyRenamedPath(currentPath: string, newBase: string, fallbackKey: string): string {
  const main = currentPath.split("?")[0] ?? "";
  const slash = main.lastIndexOf("/");
  const dir = slash >= 0 ? main.slice(0, slash + 1) : "";
  let file = main.slice(slash + 1);
  try {
    file = decodeURIComponent(file); // Arabic names travel percent-encoded
  } catch {
    // malformed escape — rename the raw segment rather than throwing
  }
  const dot = file.lastIndexOf(".");
  const ext = dot > 0 ? file.slice(dot).toLowerCase() : "";
  const stem = dot > 0 ? file.slice(0, dot) : file;

  const token = stem.match(/-([A-Za-z0-9]{6,})$/)?.[1];
  const key =
    token && looksLikeUniqueKey(token)
      ? token
      : fallbackKey.trim().replace(/[^A-Za-z0-9]/g, "");
  if (!key) throw new Error("bunnyRenamedPath: no unique key on the object and no fallback given");

  return normalizePath(`${dir}${sanitizeBunnyBase(newBase)}-${key}${ext}`);
}

/**
 * ── Production-media guard ─────────────────────────────────────────────────────────────────
 *
 * Development, preview and production all read the SAME Bunny zones — branch isolation
 * isolates code, never data. So a rename run on the dev database physically moved a file the
 * live site serves, and deleted the original. Nothing about that was visible until an image
 * broke in production.
 *
 * The guard has two halves:
 *   • Writes outside production land under `_dev/` — one folder, deletable in a single click.
 *   • Deletes and moves outside production are allowed ONLY inside `_dev/`. A path belonging
 *     to production is refused with an error, not skipped silently.
 *
 * In production it is a no-op by construction: `devPrefix()` returns the path unchanged and
 * `assertWritable()` returns immediately. Live behaviour is byte-for-byte what it was.
 *
 * Production is recognised ONLY by `VERCEL_ENV === "production"`. Absence of that variable —
 * a laptop, a script, a CI job — counts as NOT production. The default has to fail toward
 * safety: guessing "this is probably prod" is how a local run reaches live files.
 */
const DEV_PREFIX = "_dev/";

function isProductionMedia(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/** Where a write may go. Unchanged in production; forced under `_dev/` everywhere else. */
function devPrefix(path: string): string {
  const clean = normalizePath(path);
  if (isProductionMedia() || clean.startsWith(DEV_PREFIX)) return clean;
  return `${DEV_PREFIX}${clean}`;
}

/** Throws when a destructive op outside production targets anything but the dev sandbox. */
function assertWritable(operation: string, path: string): void {
  if (isProductionMedia()) return;
  const clean = normalizePath(path);
  if (clean.startsWith(DEV_PREFIX)) return;
  throw new Error(
    `${operation} refused: "${clean}" is a production object and this is not production. ` +
      `Outside production only paths under ${DEV_PREFIX} may be deleted or moved.`,
  );
}

export function getBunnyPublicUrl(zone: BunnyZone, path: string): string {
  const { cdn } = zoneConfig(zone);
  return `https://${cdn}/${normalizePath(path)}`;
}

export function extractBunnyPath(zone: BunnyZone, url: string): string | null {
  if (!url) return null;
  const { cdn } = zoneConfig(zone);
  const prefix = `https://${cdn}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length).split("?")[0] ?? null;
}

export function isBunnyUrl(zone: BunnyZone, url: string | null | undefined): boolean {
  if (!url) return false;
  const { cdn } = zoneConfig(zone);
  return url.startsWith(`https://${cdn}/`);
}

export async function uploadToBunny(
  zone: BunnyZone,
  body: Buffer | Uint8Array | ArrayBuffer | Blob,
  remotePath: string,
  contentType?: string,
): Promise<{ url: string; path: string }> {
  const cfg = zoneConfig(zone);
  // Outside production every upload lands in the dev sandbox. The returned url is built from
  // this same path, so the database always records where the object actually is.
  const path = devPrefix(remotePath);
  const storageUrl = `https://${STORAGE_HOST}/${cfg.zone}/${path}`;

  const res = await fetch(storageUrl, {
    method: "PUT",
    headers: {
      AccessKey: cfg.key,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: body as BodyInit,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed (${res.status}): ${txt || res.statusText}`);
  }

  return { url: getBunnyPublicUrl(zone, path), path };
}

export async function deleteFromBunny(zone: BunnyZone, remotePath: string): Promise<void> {
  const cfg = zoneConfig(zone);
  const path = normalizePath(remotePath);
  assertWritable("deleteFromBunny", path);
  const storageUrl = `https://${STORAGE_HOST}/${cfg.zone}/${path}`;

  const res = await fetch(storageUrl, {
    method: "DELETE",
    headers: { AccessKey: cfg.key },
  });

  if (!res.ok && res.status !== 404) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Bunny delete failed (${res.status}): ${txt || res.statusText}`);
  }
}

export async function deleteBunnyUrl(zone: BunnyZone, url: string): Promise<boolean> {
  const path = extractBunnyPath(zone, url);
  if (!path) return false;
  await deleteFromBunny(zone, path);
  return true;
}

/**
 * Physically move a stored file to a new remote path (Bunny has no native move):
 * download the source → upload at the new path → delete the old one.
 * `from` accepts a public CDN url or a raw storage path. Returns the new public url.
 * Throws on failure — callers that must not break should wrap in try/catch.
 */
export async function moveBunnyMedia(
  zone: BunnyZone,
  from: string,
  toPath: string,
): Promise<{ url: string; path: string }> {
  const fromPath = from.startsWith("http") ? extractBunnyPath(zone, from) : normalizePath(from);
  if (!fromPath) throw new Error(`moveBunnyMedia: cannot resolve source path from "${from}"`);
  // Checked on the SOURCE, before anything is copied: a move ends in a delete, and refusing
  // only at that last step would leave a stray duplicate behind every failed attempt.
  assertWritable("moveBunnyMedia", fromPath);
  const to = normalizePath(toPath);
  if (fromPath === to) return { url: getBunnyPublicUrl(zone, to), path: to }; // no-op

  const res = await fetch(getBunnyPublicUrl(zone, fromPath));
  if (!res.ok) throw new Error(`moveBunnyMedia: source fetch failed (${res.status})`);
  const contentType = res.headers.get("content-type") ?? undefined;
  const buffer = Buffer.from(await res.arrayBuffer());

  const uploaded = await uploadToBunny(zone, buffer, to, contentType);
  await deleteFromBunny(zone, fromPath); // remove old copy only after the new one is up
  return uploaded;
}
