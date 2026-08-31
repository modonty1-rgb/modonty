import "server-only";

import { db } from "@/lib/db";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import {
  computeMediaSeoScore,
  servedImageName,
  type MediaSeoCheck,
} from "@modonty/shared/lib/seo/media/seo-score";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { altToFileBase } from "@modonty/shared/lib/seo/media/alt-to-filename";
import { bunnyZoneOfUrl } from "@modonty/shared/lib/bunny";
import {
  resolveImageAttribution,
  type MediaTypeName,
  type ModontyImageDefaults,
} from "@modonty/shared/lib/seo/media/build-image-object";

// Single source for the "SEO Images" grouping. BOTH the clients table (/seo-images) and the
// per-client grid (/seo-images/[clientId]) call this — so a client's summary row and its
// image grid can never diverge. Media can grow large; cap the first cut worst-first.
const LIMIT = 500;
export const MODONTY_KEY = "__modonty__";
export const MODONTY_NAME = "صور مدوّنتي — مقالات وعامة";
// An image is "done" only when its SEO score reaches the green tier (matches SeoScoreBadge).
const DONE_THRESHOLD = 90;

export interface SeoImageRow {
  id: string;
  url: string;
  type: string;
  score: number;
  altText: string | null;
  description: string | null;
  /** Raw stored fields — the actual values behind the score, for a read-only data view. */
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string | null;
  filename: string | null;
  usedIn: string;
  ownerLabel: string;
  autoName: string | null;
  /** Per-criterion breakdown (alt / dimensions / description / filename) — why the score. */
  checks: MediaSeoCheck[];
  /**
   * What a rename would do to this image, decided here so the screen the team already works in
   * doubles as the plan — a second "report" page would be one more thing to keep in step.
   *
   *  ready     → will be renamed; `newBase` is the name it will get
   *  no-alt    → nothing to derive a name from
   *  same      → already carries that exact name
   *  duplicate → another image of the same owner has this alt; a human must split them first
   *  foreign   → not a Bunny object (legacy Cloudinary) — out of scope
   */
  rename: { status: "ready" | "no-alt" | "same" | "duplicate" | "foreign"; newBase: string | null };
}

export interface TypeCount {
  type: string;
  count: number;
}

export interface SeoImageGroup {
  key: string;
  name: string;
  isModonty: boolean;
  images: SeoImageRow[];
  count: number;
  avgScore: number;
  /** Images whose SEO score is below the done threshold (i.e. still need work). */
  problems: number;
  /** How many images of each type (LOGO ×1, GALLERY ×3…), most first. */
  typeCounts: TypeCount[];
}

export const MEDIA_SELECT = {
  id: true,
  url: true,
  bunnyUrl: true, blurDataURL: true,
  type: true,
  altText: true,
  description: true,
  width: true,
  height: true,
  fileSize: true,
  mimeType: true,
  filename: true,
  cloudinaryPublicId: true,
  dateCreated: true,
  createdAt: true,
  clientId: true,
  client: { select: { id: true, name: true } },
  logoClients: { select: { id: true, name: true } },
  heroImageClients: { select: { id: true, name: true } },
  featuredArticles: { select: { title: true }, take: 1 },
  articleGallery: { select: { article: { select: { title: true } } }, take: 1 },
} as const;

type MediaRow = {
  type: MediaTypeName;
  clientId: string | null;
  client: { id: string; name: string } | null;
  logoClients: { id: string; name: string }[];
  heroImageClients: { id: string; name: string }[];
  featuredArticles: { title: string }[];
  articleGallery: { article: { title: string } | null }[];
  altText: string | null;
  dateCreated: Date | null;
  createdAt: Date;
};

/** The full media shape a SeoImageRow is built from (MEDIA_SELECT rows). */
export type SeoImageMediaRow = MediaRow & {
  id: string;
  url: string;
  bunnyUrl: string | null;
  blurDataURL: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  mimeType: string;
  filename: string;
  cloudinaryPublicId: string | null;
};

function usedInLabel(m: MediaRow): string {
  if (m.logoClients.length) return `شعار: ${m.logoClients.map((c) => c.name).join("، ")}`;
  if (m.heroImageClients.length) return `غلاف: ${m.heroImageClients.map((c) => c.name).join("، ")}`;
  if (m.type === "GALLERY" && m.client) return `غاليري: ${m.client.name}`;
  if (m.featuredArticles.length) return `مقال: ${m.featuredArticles[0]!.title}`;
  if (m.articleGallery.length && m.articleGallery[0]?.article) return `غاليري مقال: ${m.articleGallery[0].article.title}`;
  return "غير مستخدمة";
}

function ownerContext(m: MediaRow) {
  if (m.type === "LOGO") return { clientName: m.logoClients[0]?.name ?? m.client?.name ?? null, articleTitle: null };
  if (m.type === "HERO") return { clientName: m.heroImageClients[0]?.name ?? m.client?.name ?? null, articleTitle: null };
  if (m.type === "GALLERY" || m.type === "CLIENT_MINI") return { clientName: m.client?.name ?? null, articleTitle: null };
  if (m.type === "POST") return { clientName: null, articleTitle: m.featuredArticles[0]?.title ?? m.articleGallery[0]?.article?.title ?? null };
  return { clientName: null, articleTitle: null };
}

// Which client "owns" the image. Client-owned types (logo/hero/gallery/mini) group under
// their client; everything else (article POST, general, unused) → مدوّنتي bucket.
function groupOf(m: MediaRow): { key: string; name: string; isModonty: boolean } {
  if (m.type === "LOGO" && m.logoClients[0]) return { key: m.logoClients[0].id, name: m.logoClients[0].name, isModonty: false };
  if (m.type === "HERO" && m.heroImageClients[0]) return { key: m.heroImageClients[0].id, name: m.heroImageClients[0].name, isModonty: false };
  if ((m.type === "GALLERY" || m.type === "CLIENT_MINI") && m.client) return { key: m.client.id, name: m.client.name, isModonty: false };
  return { key: MODONTY_KEY, name: MODONTY_NAME, isModonty: true };
}

/** Load the Modonty image-attribution defaults (owner name, license, org URL) once. Shared by
 *  the groups loader and the single-image loader so both build identical rows. */
export async function loadImageDefaults(): Promise<ModontyImageDefaults> {
  const [siteUrl, settings] = await Promise.all([loadSiteUrl(), getAllSettings()]);
  return {
    ownerName: settings?.imageOwnerName ?? null,
    organizationUrl: siteUrl,
    licenseUrl: settings?.imageLicenseUrl ?? null,
    acquireLicensePageUrl: settings?.imageAcquireLicensePageUrl ?? null,
  };
}

/** Build ONE SeoImageRow (score + checks + auto-name + labels) from a media row. The single
 *  source of truth for the row shape — reused by /seo-images and the per-image dialog anywhere. */
export function buildSeoImageRow(m: SeoImageMediaRow, defaults: ModontyImageDefaults): SeoImageRow {
  const { score, checks } = computeMediaSeoScore({
    filename: m.filename,
    servedUrl: mediaSrc(m) ?? m.url,
    altText: m.altText,
    description: m.description,
    width: m.width,
    height: m.height,
    type: m.type,
  });
  const ctx = ownerContext(m);
  const attr = resolveImageAttribution(
    { mediaType: m.type, clientName: ctx.clientName, articleTitle: ctx.articleTitle, altText: m.altText, dateCreated: m.dateCreated },
    defaults,
  );
  const clientOwned = m.type === "LOGO" || m.type === "GALLERY";
  const servedUrl = mediaSrc(m) ?? m.url;
  const isBunnyServed = (u: string | null) => !!u && bunnyZoneOfUrl(u) !== null;
  const currentBase = servedImageName({ servedUrl, filename: m.filename });
  const newBase = altToFileBase(m.altText);
  // `duplicate` is filled in by the caller, which is the only place that sees all the images
  // of one owner at once.
  const rename: SeoImageRow["rename"] = !isBunnyServed(servedUrl)
    ? { status: "foreign", newBase: null }
    : !newBase
      ? { status: "no-alt", newBase: null }
      : newBase === currentBase
        ? { status: "same", newBase }
        : { status: "ready", newBase };

  return {
    id: m.id,
    url: mediaSrc(m) ?? m.url,
    type: m.type,
    score,
    altText: m.altText,
    description: m.description,
    width: m.width,
    height: m.height,
    fileSize: m.fileSize,
    mimeType: m.mimeType,
    // Display the EFFECTIVE name — the one in the SERVED (Bunny) url, produced by the very
    // function the scorer grades with, so the panel can never show one name while scoring
    // another. The stored `filename` can be a stale upload hash.
    filename: servedImageName({ servedUrl: mediaSrc(m) ?? m.url, filename: m.filename }),
    usedIn: usedInLabel(m),
    ownerLabel: clientOwned ? (ctx.clientName ?? "العميل") : (defaults.ownerName ?? "مدوّنتي"),
    autoName: attr.name ?? null,
    rename,
    checks,
  };
}

export async function loadSeoImageGroups(): Promise<SeoImageGroup[]> {
  const [media, defaults] = await Promise.all([
    db.media.findMany({ select: MEDIA_SELECT, take: LIMIT, orderBy: { createdAt: "desc" } }),
    loadImageDefaults(),
  ]);

  type PartialGroup = { key: string; name: string; isModonty: boolean; images: SeoImageRow[] };
  const groupMap = new Map<string, PartialGroup>();

  for (const raw of media) {
    const m = raw as unknown as SeoImageMediaRow;
    const row = buildSeoImageRow(m, defaults);

    const g = groupOf(m);
    const existing = groupMap.get(g.key);
    if (existing) existing.images.push(row);
    else groupMap.set(g.key, { key: g.key, name: g.name, isModonty: g.isModonty, images: [row] });
  }

  // Duplicate alts can only be seen with the whole owner in hand. Marked on EVERY image that
  // shares a name — not just the later ones — because a human has to look at both and decide
  // which description belongs to which picture.
  for (const g of groupMap.values()) {
    const seen = new Map<string, number>();
    for (const i of g.images) {
      if (i.rename.status !== "ready" || !i.rename.newBase) continue;
      seen.set(i.rename.newBase, (seen.get(i.rename.newBase) ?? 0) + 1);
    }
    for (const i of g.images) {
      if (i.rename.status === "ready" && i.rename.newBase && (seen.get(i.rename.newBase) ?? 0) > 1) {
        i.rename = { status: "duplicate", newBase: i.rename.newBase };
      }
    }
  }

  return [...groupMap.values()].map((g) => {
    const count = g.images.length;
    const avgScore = Math.round(g.images.reduce((s, i) => s + i.score, 0) / count);
    const problems = g.images.filter((i) => i.score < DONE_THRESHOLD).length;
    const byType = new Map<string, number>();
    for (const i of g.images) byType.set(i.type, (byType.get(i.type) ?? 0) + 1);
    const typeCounts: TypeCount[] = [...byType.entries()]
      .map(([type, c]) => ({ type, count: c }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
    return { ...g, count, avgScore, problems, typeCounts };
  });
}
