"use server";

/**
 * T2b — "Link core media": one idempotent button that makes every existing platform
 * image a real, Modonty-owned Media row (zero-loss: ADDITIVE ONLY — no text field
 * and no file is ever modified or deleted here).
 *
 * mode "preview" walks everything and returns the exact plan with ZERO writes.
 * mode "apply" executes the same walk; a second apply must report zero changes.
 *
 * Self-contained inside the temporary bunny-migration route (T1 rule).
 */

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { getCoreClientId } from "@modonty/database/lib/core-client";
import { generateBlurDataUrlFromUrl } from "@/app/(dashboard)/media/actions/generate-blur";
import {
  BRAND_LOGO_URL,
  BRAND_CHARACTER_URL,
  BRAND_WORDMARK_URL,
  BRAND_ICON_URL,
} from "@modonty/database/lib/brand-assets";

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

export type PlanAction =
  | "claim-orphan" // media row clientId:null → clientId=core
  | "claim-platform" // scope PLATFORM → clientId=core + scope CLIENT
  | "link-existing" // entity string URL matches a core-owned Media row → fill the relation
  | "create-and-link" // no Media row for the URL → create core-owned row + fill relation
  | "create-row" // URL has no Media row (Settings/story/brand) → create core-owned row
  | "needs-decision" // URL's Media row is owned by ANOTHER client — reported, never touched
  | "done"; // already converted — idempotent skip

export interface PlanItem {
  action: PlanAction;
  label: string;
  url?: string;
}

export interface ScopeReport {
  scope: string;
  items: PlanItem[];
  toDo: number;
  done: number;
  decisions: number;
}

export interface LinkCoreMediaResult {
  ok: boolean;
  mode: "preview" | "apply";
  coreClientId: string | null;
  scopes: ScopeReport[];
  applied?: { claimed: number; linked: number; created: number; skipped: number };
  error?: string;
}

function filenameFromUrl(url: string): string {
  return decodeURIComponent(url.split("/").pop() || "file").split("?")[0];
}

function mimeFromUrl(url: string): string {
  const ext = (url.split(".").pop() || "").toLowerCase().split("?")[0];
  const map: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    svg: "image/svg+xml", gif: "image/gif", avif: "image/avif",
  };
  return map[ext] || "image/jpeg";
}

/** List every file (recursively) under a path in the assets zone. */
async function listAssetsFiles(path: string): Promise<string[]> {
  const name = process.env.BUNNY_ASSETS_STORAGE_ZONE_NAME;
  const key = process.env.BUNNY_ASSETS_STORAGE_PASSWORD;
  if (!name || !key) return [];
  const clean = path.replace(/^\/+|\/+$/g, "");
  const res = await fetch(`https://${STORAGE_HOST}/${name}/${clean}/`, {
    headers: { AccessKey: key, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const entries = (await res.json()) as { ObjectName: string; IsDirectory: boolean }[];
  const files: string[] = [];
  for (const e of entries) {
    if (e.IsDirectory) files.push(...(await listAssetsFiles(`${clean}/${e.ObjectName}`)));
    else files.push(`${clean}/${e.ObjectName}`);
  }
  return files;
}

const ASSETS_CDN = "https://modonty-asset.b-cdn.net";

/** Find the Media row a URL lives in (url or bunnyUrl match). */
async function findRowByUrl(url: string) {
  return db.media.findFirst({
    where: { OR: [{ url }, { bunnyUrl: url }] },
    select: { id: true, clientId: true, scope: true },
  });
}

/** Ensure a core-owned Media row exists for a URL. Returns the row id. */
async function ensureCoreRow(url: string, coreId: string, apply: boolean): Promise<{ id: string | null; item: PlanItem }> {
  const row = await findRowByUrl(url);
  if (row) {
    if (row.clientId === coreId) return { id: row.id, item: { action: "done", label: filenameFromUrl(url), url } };
    if (row.clientId === null && row.scope !== "PLATFORM") {
      if (apply) await db.media.update({ where: { id: row.id }, data: { clientId: coreId } });
      return { id: row.id, item: { action: "claim-orphan", label: filenameFromUrl(url), url } };
    }
    if (row.scope === "PLATFORM") {
      if (apply) await db.media.update({ where: { id: row.id }, data: { clientId: coreId, scope: "CLIENT" } });
      return { id: row.id, item: { action: "claim-platform", label: filenameFromUrl(url), url } };
    }
    // Owned by another client — never touched; surfaced for Khalid's decision.
    return { id: null, item: { action: "needs-decision", label: filenameFromUrl(url), url } };
  }
  let id: string | null = null;
  if (apply) {
    const created = await db.media.create({
      data: {
        filename: filenameFromUrl(url),
        url,
        bunnyUrl: url.includes(".b-cdn.net/") ? url : null,
        // Row created from a bare url (no buffer in hand) — fetch once to build the blur.
        blurDataURL: await generateBlurDataUrlFromUrl(url),
        contentUrl: url,
        mimeType: mimeFromUrl(url),
        scope: "CLIENT",
        type: "GENERAL",
        clientId: coreId,
      },
      select: { id: true },
    });
    id = created.id;
  }
  return { id, item: { action: "create-row", label: filenameFromUrl(url), url } };
}

function summarize(scope: string, items: PlanItem[]): ScopeReport {
  return {
    scope,
    items,
    toDo: items.filter((i) => i.action !== "done" && i.action !== "needs-decision").length,
    done: items.filter((i) => i.action === "done").length,
    decisions: items.filter((i) => i.action === "needs-decision").length,
  };
}

export async function linkCoreMedia(mode: "preview" | "apply"): Promise<LinkCoreMediaResult> {
  try {
    await requireAdmin();
    const apply = mode === "apply";
    const coreId = await getCoreClientId();
    if (!coreId) return { ok: false, mode, coreClientId: null, scopes: [], error: "coreClientId غير مضبوط في الإعدادات" };

    const applied = { claimed: 0, linked: 0, created: 0, skipped: 0 };
    const track = (item: PlanItem) => {
      if (item.action === "done" || item.action === "needs-decision") applied.skipped++;
      else if (item.action === "create-row" || item.action === "create-and-link") applied.created++;
      else if (item.action === "link-existing") applied.linked++;
      else applied.claimed++;
    };

    // ① Orphan Media rows (clientId null, not PLATFORM) → claim for core.
    const orphans = await db.media.findMany({
      where: { clientId: null, scope: { not: "PLATFORM" } },
      select: { id: true, filename: true, url: true, bunnyUrl: true },
    });
    const orphanItems: PlanItem[] = [];
    for (const o of orphans) {
      if (apply) await db.media.update({ where: { id: o.id }, data: { clientId: coreId } });
      const item: PlanItem = { action: "claim-orphan", label: o.filename, url: o.bunnyUrl ?? o.url };
      orphanItems.push(item);
      track(item);
    }

    // ② Legacy PLATFORM-scope rows → real core ownership.
    const platformRows = await db.media.findMany({
      where: { scope: "PLATFORM" },
      select: { id: true, filename: true, url: true, bunnyUrl: true },
    });
    const platformItems: PlanItem[] = [];
    for (const r of platformRows) {
      if (apply) await db.media.update({ where: { id: r.id }, data: { clientId: coreId, scope: "CLIENT" } });
      const item: PlanItem = { action: "claim-platform", label: r.filename, url: r.bunnyUrl ?? r.url };
      platformItems.push(item);
      track(item);
    }

    // ③ Entity links — filled socialImage strings get a core-owned row + the relation.
    const entityItems: PlanItem[] = [];
    const entityDefs = [
      { name: "Tag", rows: await db.tag.findMany({ where: { socialImage: { not: null } }, select: { id: true, name: true, socialImage: true, socialImageMediaId: true } }) },
      { name: "Category", rows: await db.category.findMany({ where: { socialImage: { not: null } }, select: { id: true, name: true, socialImage: true, socialImageMediaId: true } }) },
      { name: "Industry", rows: await db.industry.findMany({ where: { socialImage: { not: null } }, select: { id: true, name: true, socialImage: true, socialImageMediaId: true } }) },
    ] as const;
    for (const def of entityDefs) {
      for (const row of def.rows) {
        const label = `${def.name}: ${row.name}`;
        if (!row.socialImage?.trim()) continue;
        if (row.socialImageMediaId) {
          const item: PlanItem = { action: "done", label, url: row.socialImage };
          entityItems.push(item); track(item);
          continue;
        }
        const ensured = await ensureCoreRow(row.socialImage, coreId, apply);
        if (ensured.item.action === "needs-decision") {
          entityItems.push({ ...ensured.item, label }); track(ensured.item);
          continue;
        }
        const action: PlanAction = ensured.item.action === "create-row" ? "create-and-link" : "link-existing";
        if (apply && ensured.id) {
          const data = { socialImageMediaId: ensured.id };
          if (def.name === "Tag") await db.tag.update({ where: { id: row.id }, data });
          else if (def.name === "Category") await db.category.update({ where: { id: row.id }, data });
          else await db.industry.update({ where: { id: row.id }, data });
        }
        const item: PlanItem = { action, label, url: row.socialImage };
        entityItems.push(item); track(item);
      }
    }

    // Modonty pages (hero + social relations already exist — fill where string set, relation empty).
    const pages = await db.modonty.findMany({
      select: { slug: true, heroImage: true, heroImageMediaId: true, socialImage: true, socialImageMediaId: true },
    });
    for (const pg of pages) {
      for (const [field, url, relId] of [
        ["hero", pg.heroImage, pg.heroImageMediaId],
        ["social", pg.socialImage, pg.socialImageMediaId],
      ] as const) {
        if (!url?.trim()) continue;
        const label = `Page ${pg.slug} (${field})`;
        if (relId) { const item: PlanItem = { action: "done", label, url }; entityItems.push(item); track(item); continue; }
        const ensured = await ensureCoreRow(url, coreId, apply);
        if (ensured.item.action === "needs-decision") { entityItems.push({ ...ensured.item, label }); track(ensured.item); continue; }
        const action: PlanAction = ensured.item.action === "create-row" ? "create-and-link" : "link-existing";
        if (apply && ensured.id) {
          await db.modonty.update({
            where: { slug: pg.slug },
            data: field === "hero" ? { heroImageMediaId: ensured.id } : { socialImageMediaId: ensured.id },
          });
        }
        const item: PlanItem = { action, label, url }; entityItems.push(item); track(item);
      }
    }

    // ④ Settings image URLs → core-owned rows (no relation columns; ownership only).
    const settings = await db.settings.findFirst({
      select: {
        logoUrl: true, logoIconUrl: true, ogImageUrl: true, certificateImageUrl: true,
        categoriesPageImage: true, tagsPageImage: true, industriesPageImage: true,
      },
    });
    const settingsItems: PlanItem[] = [];
    if (settings) {
      for (const [field, url] of Object.entries(settings)) {
        if (!url?.trim()) continue;
        const ensured = await ensureCoreRow(url, coreId, apply);
        settingsItems.push({ ...ensured.item, label: `Settings.${field}` });
        track(ensured.item);
      }
    }

    // ⑤ Brand identity constants (dataLayer/lib/brand-assets.ts) → core-owned rows.
    const brandItems: PlanItem[] = [];
    for (const url of [BRAND_LOGO_URL, BRAND_CHARACTER_URL, BRAND_WORDMARK_URL, BRAND_ICON_URL]) {
      const ensured = await ensureCoreRow(url, coreId, apply);
      brandItems.push(ensured.item);
      track(ensured.item);
    }

    // ⑥ Story page files (assets zone brand/story/**) → core-owned rows.
    const storyFiles = await listAssetsFiles("brand/story");
    const storyItems: PlanItem[] = [];
    for (const path of storyFiles) {
      const url = `${ASSETS_CDN}/${path}`;
      const ensured = await ensureCoreRow(url, coreId, apply);
      storyItems.push(ensured.item);
      track(ensured.item);
    }

    return {
      ok: true,
      mode,
      coreClientId: coreId,
      scopes: [
        summarize("① اليتيمة (clientId=null)", orphanItems),
        summarize("② صفوف PLATFORM القديمة", platformItems),
        summarize("③ علاقات الكيانات (وسم/تصنيف/صناعة/صفحات)", entityItems),
        summarize("④ روابط الإعدادات", settingsItems),
        summarize("⑤ ثوابت الهوية brand-assets", brandItems),
        summarize("⑥ صور صفحة القصّة", storyItems),
      ],
      ...(apply ? { applied } : {}),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "linkCoreMedia failed";
    return { ok: false, mode, coreClientId: null, scopes: [], error: message };
  }
}
