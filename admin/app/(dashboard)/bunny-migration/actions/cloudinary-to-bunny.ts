"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { uploadToBunny } from "@modonty/database/lib/bunny";

/**
 * ONE-TIME migration: retire Cloudinary from every stored field.
 *
 * Deliberately NOT part of "Run All Auto-Maintenance" (Khalid 2026-07-30): Run-All is for
 * recurring upkeep, this runs once.
 *
 * ── Why it is split into scopes, driven from the client ──────────────────────────────
 * The first build was one server action that ran everything and returned after ~12 minutes.
 * A server action is atomic from the browser's side: no progress, and no way to stop it.
 * So the work is now exposed as `listScope` + `runScopeBatch`, and the CLIENT loops. That
 * buys three things a single action cannot: a real percentage, a Cancel that takes effect
 * between batches, and the ability to re-run one scope instead of all of them.
 *
 * ── The order still matters and is not negotiable ────────────────────────────────────
 * Proven by reading the generators (`lib/seo/{category,tag,industry}-seo-generator.ts`):
 * they READ `socialImage` and inject it into `nextjsMetadata` / `jsonLdStructuredData`,
 * but never WRITE it. Regenerating before the raw fields are swapped re-bakes the very same
 * Cloudinary URLs, so the button looks broken while doing exactly what it was told.
 *
 *   orphans → raw → (articles | clients | categories | tags | industries) → listings
 *
 * Every scope is idempotent: an item with no Cloudinary left is a no-op, so re-running is safe.
 */

const CLOUDINARY = "res.cloudinary.com";
const URL_RE = /https:\/\/res\.cloudinary\.com\/[^"'\\\s)<>]+/g;

// Scope constants live in `./cloudinary-scopes` — a "use server" module may only export
// async functions, so an array exported from here reaches the client as an action proxy.
import type { MigrationScope } from "./cloudinary-scopes";

/** Fields the SEO generators build — never swapped by hand, always regenerated. */
const GENERATED_FIELDS = new Set([
  "nextjsMetadata",
  "jsonLdStructuredData",
  "homeMetaTags",
  "homeJsonLdStructuredData",
  "clientsPageMetaTags",
  "clientsPageJsonLdStructuredData",
  "categoriesPageMetaTags",
  "categoriesPageJsonLdStructuredData",
  "tagsPageMetaTags",
  "tagsPageJsonLdStructuredData",
  "industriesPageMetaTags",
  "industriesPageJsonLdStructuredData",
  "articlesPageMetaTags",
  "articlesPageJsonLdStructuredData",
  "trendingPageMetaTags",
  "trendingPageJsonLdStructuredData",
]);

type Row = Record<string, unknown>;

function serialize(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return JSON.stringify(value);
  return null;
}

function urlsIn(value: unknown): string[] {
  const s = serialize(value);
  if (!s || !s.includes(CLOUDINARY)) return [];
  return [...s.matchAll(URL_RE)].map((m) => m[0]);
}

/** Cloudinary puts transforms between `/upload/` and the version — strip them to compare. */
function normalize(url: string): string {
  return url.replace(/\/upload\/[^/]*\//, "/upload/");
}

function extensionOf(url: string): string {
  const clean = url.split("?")[0];
  const dot = clean.lastIndexOf(".");
  const ext = dot > 0 ? clean.slice(dot + 1).toLowerCase() : "";
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : "jpg";
}

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
};

/**
 * Every model holding a raw image URL string, not a `Media` relation.
 *
 * `modonty` and `staff` were missing until 2026-07-31. Both keep bare `String?` image
 * columns (`heroImage`, `socialImage`, `image`) with no `bunnyUrl` twin, so `mediaSrc`
 * is structurally unable to guard them and the raw pass skipped them entirely — leaving
 * the platform logo on Cloudinary in six page caches and one staff avatar. Any new model
 * with a raw URL column MUST be added here or it silently keeps its Cloudinary links.
 */
async function loadRawModels() {
  const [articles, clients, categories, tags, industries, settings, authors, modontyPages, staff] =
    await Promise.all([
      db.article.findMany(),
      db.client.findMany(),
      db.category.findMany(),
      db.tag.findMany(),
      db.industry.findMany(),
      db.settings.findMany(),
      db.author.findMany(),
      db.modonty.findMany(),
      db.staff.findMany(),
    ]);
  return [
    { name: "article", rows: articles as Row[], update: db.article.update },
    { name: "client", rows: clients as Row[], update: db.client.update },
    { name: "category", rows: categories as Row[], update: db.category.update },
    { name: "tag", rows: tags as Row[], update: db.tag.update },
    { name: "industry", rows: industries as Row[], update: db.industry.update },
    { name: "settings", rows: settings as Row[], update: db.settings.update },
    { name: "author", rows: authors as Row[], update: db.author.update },
    { name: "modonty", rows: modontyPages as Row[], update: db.modonty.update },
    { name: "staff", rows: staff as Row[], update: db.staff.update },
  ];
}

/** Filename without query/transform noise — the one part Bunny keeps from the Cloudinary path. */
function basenameOf(url: string): string {
  const clean = url.split("?")[0].split("#")[0];
  return decodeURIComponent(clean.slice(clean.lastIndexOf("/") + 1)).toLowerCase();
}

async function buildResolver() {
  const media = await db.media.findMany({ select: { url: true, bunnyUrl: true } });
  const exact = new Map<string, string>();
  const loose = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const m of media) {
    if (!m.bunnyUrl || !m.url) continue;
    exact.set(m.url, m.bunnyUrl);
    loose.set(normalize(m.url), m.bunnyUrl);
    byName.set(basenameOf(m.url), m.bunnyUrl);
  }

  // Platform assets (logo, OG image, listing headers) were moved to Bunny by hand — they are
  // NOT Media rows, so the two maps above are blind to them. The raw pass therefore reported
  // "ok" while changing nothing, and the Cloudinary logo survived in `modonty.metaTags` and
  // `staff.image` (2026-07-31). Bunny keeps the original filename, so indexing every Bunny URL
  // already stored in Settings by basename lets those references resolve too.
  const settings = await db.settings.findMany();
  for (const row of settings) {
    for (const value of Object.values(row)) {
      if (typeof value !== "string" || !value.includes("b-cdn.net")) continue;
      const name = basenameOf(value);
      if (name && !byName.has(name)) byName.set(name, value);
    }
  }

  return {
    resolve: (u: string) =>
      exact.get(u) ?? loose.get(normalize(u)) ?? byName.get(basenameOf(u)) ?? null,
    mediaWithoutBunny: media.filter((m) => !m.bunnyUrl).length,
  };
}

// ── stats ────────────────────────────────────────────────────────────────────

export interface FieldCount {
  field: string;
  rows: number;
}

export interface MigrationStats {
  mediaWithoutBunny: number;
  orphanUrls: number;
  orphanSample: string[];
  rawFields: FieldCount[];
  rawRows: number;
  generatedFields: FieldCount[];
  generatedRows: number;
}

export async function getMigrationStats(): Promise<MigrationStats> {
  const gate = await requireAdmin();
  if ("error" in gate) {
    return {
      mediaWithoutBunny: 0,
      orphanUrls: 0,
      orphanSample: [],
      rawFields: [],
      rawRows: 0,
      generatedFields: [],
      generatedRows: 0,
    };
  }

  const { resolve, mediaWithoutBunny } = await buildResolver();
  const models = await loadRawModels();

  const rawMap = new Map<string, number>();
  const genMap = new Map<string, number>();
  const orphans = new Set<string>();

  for (const model of models) {
    for (const row of model.rows) {
      for (const [key, value] of Object.entries(row)) {
        const found = urlsIn(value);
        if (found.length === 0) continue;
        const field = `${model.name}.${key}`;
        if (GENERATED_FIELDS.has(key)) {
          genMap.set(field, (genMap.get(field) ?? 0) + 1);
          continue;
        }
        rawMap.set(field, (rawMap.get(field) ?? 0) + 1);
        for (const u of found) if (!resolve(u)) orphans.add(u);
      }
    }
  }

  const sort = (m: Map<string, number>): FieldCount[] =>
    [...m.entries()].map(([field, rows]) => ({ field, rows })).sort((a, b) => b.rows - a.rows);

  const rawFields = sort(rawMap);
  const generatedFields = sort(genMap);

  return {
    mediaWithoutBunny,
    orphanUrls: orphans.size,
    orphanSample: [...orphans].slice(0, 5),
    rawFields,
    rawRows: rawFields.reduce((s, f) => s + f.rows, 0),
    generatedFields,
    generatedRows: generatedFields.reduce((s, f) => s + f.rows, 0),
  };
}

// ── scope listing ────────────────────────────────────────────────────────────

export interface ScopeTargets {
  scope: MigrationScope;
  /** Item ids (or synthetic keys) the client will feed back in batches. */
  ids: string[];
}

export async function listScope(scope: MigrationScope): Promise<ScopeTargets> {
  const gate = await requireAdmin();
  if ("error" in gate) return { scope, ids: [] };

  switch (scope) {
    case "media":
      // Media rows whose file was never copied to Bunny. They are invisible to the orphan
      // scan (they hold no raw URL string — articles reach them through featuredImageId),
      // so they need their own pass or their articles can never regenerate clean.
      return {
        scope,
        ids: (
          await db.media.findMany({
            where: { OR: [{ bunnyUrl: null }, { bunnyUrl: { isSet: false } }] },
            select: { id: true },
          })
        ).map((m) => m.id),
      };

    case "danglingLinks": {
      // Join rows pointing at a parent that no longer exists. MongoDB enforces nothing and
      // Prisma only emulates onDelete for its own deletes, so these survive and then make
      // every query that joins the REQUIRED relation throw — one stale row takes a whole
      // page down. The row itself is meaningless without its parent: delete it.
      const tagIds = new Set((await db.tag.findMany({ select: { id: true } })).map((t) => t.id));
      const links = await db.articleTag.findMany({ select: { id: true, tagId: true } });
      return { scope, ids: links.filter((l) => !tagIds.has(l.tagId)).map((l) => l.id) };
    }

    case "orphans": {
      const { resolve } = await buildResolver();
      const models = await loadRawModels();
      const orphans = new Set<string>();
      for (const model of models) {
        for (const row of model.rows) {
          for (const [key, value] of Object.entries(row)) {
            if (GENERATED_FIELDS.has(key)) continue;
            for (const u of urlsIn(value)) if (!resolve(u)) orphans.add(u);
          }
        }
      }
      return { scope, ids: [...orphans] };
    }
    case "raw": {
      // One "item" per model row that still holds a raw Cloudinary URL.
      const models = await loadRawModels();
      const ids: string[] = [];
      for (const model of models) {
        for (const row of model.rows) {
          const dirty = Object.entries(row).some(
            ([k, v]) => !GENERATED_FIELDS.has(k) && urlsIn(v).length > 0,
          );
          if (dirty) ids.push(`${model.name}:${row.id as string}`);
        }
      }
      return { scope, ids };
    }
    case "articles":
      return { scope, ids: (await db.article.findMany({ select: { id: true } })).map((a) => a.id) };
    case "clients":
      return { scope, ids: (await db.client.findMany({ select: { id: true } })).map((c) => c.id) };
    case "categories":
      return { scope, ids: (await db.category.findMany({ select: { id: true } })).map((c) => c.id) };
    case "tags":
      return { scope, ids: (await db.tag.findMany({ select: { id: true } })).map((t) => t.id) };
    case "industries":
      return { scope, ids: (await db.industry.findMany({ select: { id: true } })).map((i) => i.id) };
    // One platform author, one generator — same single-shot shape as `listings`.
    case "authors":
      return { scope, ids: ["all"] };
    case "modontyPages":
      // Keyed by slug — the generator takes a slug, not an id.
      return { scope, ids: (await db.modonty.findMany({ select: { slug: true } })).map((p) => p.slug) };
    case "listings":
      return { scope, ids: ["all"] };
  }
}

// ── batch execution ──────────────────────────────────────────────────────────

export interface BatchResult {
  done: number;
  failed: number;
  /** Human-readable reasons, capped — surfaced so a failure is never silent. */
  errors: string[];
}

/** Fetch a Cloudinary asset and re-upload it to Bunny under `migrated/`. */
async function rehostOrphan(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extensionOf(url);
  const stamp = url.replace(/\W+/g, "").slice(-24);
  const path = `migrated/${stamp}-${buf.length}.${ext}`;
  const { url: bunnyUrl } = await uploadToBunny("assets", buf, path, MIME[ext] ?? "image/jpeg");
  return bunnyUrl;
}

/** Orphan re-hosts are recorded here so the raw pass can resolve them. */
async function orphanMap(): Promise<Map<string, string>> {
  const rows = await db.media.findMany({
    where: { bunnyUrl: { not: null } },
    select: { url: true, bunnyUrl: true },
  });
  const m = new Map<string, string>();
  for (const r of rows) if (r.url && r.bunnyUrl) m.set(r.url, r.bunnyUrl);
  return m;
}

export async function runScopeBatch(
  scope: MigrationScope,
  ids: string[],
): Promise<BatchResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return { done: 0, failed: ids.length, errors: [gate.error] };

  const errors: string[] = [];
  let done = 0;
  let failed = 0;
  const note = (msg: string) => {
    if (errors.length < 5) errors.push(msg);
  };

  switch (scope) {
    case "media": {
      // Reuse the existing media migration — same uploader the Media library button uses.
      const { migrateMediaBatch } = await import("@/app/(dashboard)/media/actions/migrate-media-to-bunny");
      const r = await migrateMediaBatch(ids.length);
      if ("error" in r) {
        failed = ids.length;
        note(r.error);
      } else {
        done = r.migrated;
        failed = r.failed;
        for (const e of r.errors) note(`${e.filename}: ${e.error}`);
      }
      break;
    }

    case "danglingLinks": {
      for (const id of ids) {
        try {
          await db.articleTag.delete({ where: { id } });
          done++;
        } catch (e) {
          failed++;
          note(e instanceof Error ? e.message.split("\n")[0] : String(e));
        }
      }
      break;
    }

    case "orphans": {
      for (const url of ids) {
        try {
          const hosted = await rehostOrphan(url);
          if (!hosted) {
            failed++;
            note(`fetch failed: ${url.slice(0, 60)}…`);
            continue;
          }
          // Park the mapping on a Media row so the raw pass can find it.
          //
          // `updateMany` alone was a no-op BY CONSTRUCTION: an orphan is *defined* as a URL
          // with no Media row, so the where-clause never matched, the freshly uploaded Bunny
          // copy was thrown away, and the raw pass still found nothing to swap while both
          // scopes reported "ok" (traced 2026-07-31 on a staff avatar). When nothing matches,
          // create the row so the mapping actually survives to the raw pass.
          const parked = await db.media.updateMany({ where: { url }, data: { bunnyUrl: hosted } });
          if (parked.count === 0) {
            const filename = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "orphan");
            await db.media.create({
              data: {
                url,
                bunnyUrl: hosted,
                filename,
                mimeType: MIME[extensionOf(url)] ?? "image/jpeg",
                type: "GENERAL",
              },
            });
          }
          done++;
        } catch (e) {
          failed++;
          note(e instanceof Error ? e.message : String(e));
        }
      }
      break;
    }

    case "raw": {
      const { resolve } = await buildResolver();
      const extra = await orphanMap();
      const resolveAny = (u: string) => resolve(u) ?? extra.get(u) ?? null;

      const byModel = new Map<string, string[]>();
      for (const key of ids) {
        const [name, id] = key.split(":");
        byModel.set(name, [...(byModel.get(name) ?? []), id]);
      }

      const models = await loadRawModels();
      for (const model of models) {
        const wanted = byModel.get(model.name);
        if (!wanted?.length) continue;
        const want = new Set(wanted);
        for (const row of model.rows) {
          if (!want.has(row.id as string)) continue;
          try {
            const data: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(row)) {
              if (GENERATED_FIELDS.has(key)) continue;
              const found = urlsIn(value);
              if (found.length === 0) continue;
              if (typeof value === "string") {
                let next = value;
                for (const u of found) {
                  const to = resolveAny(u);
                  if (to) next = next.split(u).join(to);
                }
                if (next !== value) data[key] = next;
              } else {
                let json = JSON.stringify(value);
                const before = json;
                for (const u of found) {
                  const to = resolveAny(u);
                  if (to) json = json.split(u).join(to);
                }
                if (json !== before) data[key] = JSON.parse(json);
              }
            }
            if (Object.keys(data).length > 0) {
              await (model.update as (a: unknown) => Promise<unknown>)({
                where: { id: row.id as string },
                data,
              });
            }
            done++;
          } catch (e) {
            failed++;
            note(`${model.name}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      }
      break;
    }

    case "articles": {
      const [{ regenerateJsonLd }, { regenerateNextjsMetadata }] = await Promise.all([
        import("@/lib/seo/jsonld-storage"),
        import("@/lib/seo/metadata-storage"),
      ]);
      for (const id of ids) {
        try {
          await regenerateJsonLd(id);
          await regenerateNextjsMetadata(id);
          done++;
        } catch (e) {
          failed++;
          note(`article ${id.slice(-6)}: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`);
        }
      }
      break;
    }

    case "clients": {
      const { generateClientSEO } = await import(
        "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo"
      );
      for (const id of ids) {
        try {
          await generateClientSEO(id);
          done++;
        } catch (e) {
          failed++;
          note(`client ${id.slice(-6)}: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`);
        }
      }
      break;
    }

    case "categories":
    case "tags":
    case "industries": {
      const mod =
        scope === "categories"
          ? await import("@/lib/seo/category-seo-generator")
          : scope === "tags"
            ? await import("@/lib/seo/tag-seo-generator")
            : await import("@/lib/seo/industry-seo-generator");
      const fn =
        "generateAndSaveCategorySeo" in mod
          ? mod.generateAndSaveCategorySeo
          : "generateAndSaveTagSeo" in mod
            ? mod.generateAndSaveTagSeo
            : mod.generateAndSaveIndustrySeo;
      for (const id of ids) {
        try {
          const r = await (fn as (i: string) => Promise<{ success: boolean; error?: string }>)(id);
          if (r.success) done++;
          else {
            failed++;
            note(r.error ?? "unknown");
          }
        } catch (e) {
          failed++;
          note(e instanceof Error ? e.message.split("\n")[0] : String(e));
        }
      }
      break;
    }

    case "authors": {
      try {
        const { regenerateModontyAuthorSeo } = await import(
          "@/app/(dashboard)/seo/actions/author-seo-repair"
        );
        const r = await regenerateModontyAuthorSeo();
        if (r.ok) done = 1;
        else {
          failed = 1;
          note(r.detail ?? "author regenerate failed");
        }
      } catch (e) {
        failed = 1;
        note(e instanceof Error ? e.message.split("\n")[0] : String(e));
      }
      break;
    }

    case "modontyPages": {
      const { generateModontyPageSEO } = await import(
        "@/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo"
      );
      for (const slug of ids) {
        try {
          await generateModontyPageSEO(slug);
          done++;
        } catch (e) {
          failed++;
          note(`page ${slug}: ${e instanceof Error ? e.message.split("\n")[0] : String(e)}`);
        }
      }
      break;
    }

    case "listings": {
      try {
        const { regenerateAllListingCaches } = await import("@/lib/seo/listing-page-seo-generator");
        const r = await regenerateAllListingCaches();
        const ok = Object.values(r.results).filter(Boolean).length;
        done = ok;
        failed = Object.keys(r.results).length - ok;
        if (r.error) note(r.error);
      } catch (e) {
        failed = 1;
        note(e instanceof Error ? e.message.split("\n")[0] : String(e));
      }
      break;
    }
  }

  revalidatePath("/bunny-migration");
  return { done, failed, errors };
}
