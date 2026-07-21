// Single source of truth for building a schema.org ImageObject node — used by EVERY
// surface that emits an image into JSON-LD (client/organization graph, article graph,
// and the admin SEO Doctor preview). Before this existed, three places built the node
// differently: the client generator emitted only `caption`; the article generator
// emitted `name`(=altText) + a WRONG `license` (the raw label, not a URL) + `creator`
// always as Person; the admin preview built a third shape. One builder = one output.
//
// Sources (verified, not from memory):
//  - schema.org/ImageObject: name, caption, description, contentUrl, url, width, height,
//    encodingFormat, thumbnailUrl, creator, creditText, copyrightNotice, copyrightHolder,
//    license, acquireLicensePage, dateCreated are ALL valid on ImageObject (direct or
//    inherited from Thing / MediaObject / CreativeWork).
//  - Google Search Central — Image license metadata (Licensable badge): `license` and
//    `acquireLicensePage` MUST be URLs; eligibility requires `license`; `contentUrl` plus
//    one of creator/creditText/copyrightNotice/license.
//
// This module is PURE: it takes already-resolved values (the owner, the name, the licence
// URLs come from the type-ownership resolver in step 3 and Settings in step 2) and only
// assembles the node, omitting every empty field. No DB, no Prisma, no I/O.

/** A JSON-LD node — a plain object keyed by schema.org property names. */
export type JsonLdNode = Record<string, unknown>;

/** creator / copyrightHolder shape: an Organization or a Person by name (+ optional url). */
export interface SchemaAgent {
  type: "Organization" | "Person";
  name: string;
  url?: string | null;
}

/**
 * The licence block for one image — already resolved by the caller (type-ownership +
 * Settings defaults, steps 2–3). All optional: whatever is present is emitted, the rest
 * is omitted so a node never carries an empty property.
 */
export interface ImageLicensing {
  /** schema.org `creator` — Organization for Modonty-produced images, or the owner. */
  creator?: SchemaAgent | null;
  /** schema.org `creditText` — the attribution string (e.g. "مدوّنتي" or the client name). */
  creditText?: string | null;
  /** schema.org `copyrightNotice` — e.g. "© 2026 مدوّنتي". */
  copyrightNotice?: string | null;
  /** schema.org `copyrightHolder` — Organization/Person that holds the copyright. */
  copyrightHolder?: SchemaAgent | null;
  /** schema.org `license` — a URL to a page describing the licence (NOT a label). */
  license?: string | null;
  /** schema.org `acquireLicensePage` — a URL to a page on how to licence the image. */
  acquireLicensePage?: string | null;
}

export interface BuildImageObjectInput {
  /** Absolute image URL (caller resolves relative → absolute). Required. */
  url: string;
  /** schema.org `name` — resolved by the type-based recipe (step 3). Empty → omitted. */
  name?: string | null;
  /** schema.org `caption` — the visible caption (falls back to alt text at the caller). */
  caption?: string | null;
  /** schema.org `description` — the writer-authored description. Empty → omitted. */
  description?: string | null;
  width?: number | null;
  height?: number | null;
  /** e.g. "image/jpeg". schema.org `encodingFormat`. */
  encodingFormat?: string | null;
  /** ISO date string or Date → schema.org `dateCreated` (date part only). */
  dateCreated?: string | Date | null;
  /** Resolved licence block (creator / creditText / copyrightNotice / license / …). */
  licensing?: ImageLicensing | null;
  /** Optional `@id` (article images anchor variants like `${url}#primary-image`). */
  id?: string | null;
  /** Optional Google Article-image flag. */
  representativeOfPage?: boolean;
  /** Overrides `url` for `contentUrl` when they differ (default: same as `url`). */
  contentUrl?: string | null;
}

function agentNode(a: SchemaAgent | null | undefined): JsonLdNode | undefined {
  if (!a || !a.name?.trim()) return undefined;
  const node: JsonLdNode = { "@type": a.type, name: a.name.trim() };
  if (a.url?.trim()) node.url = a.url.trim();
  return node;
}

function dateOnly(d: string | Date | null | undefined): string | undefined {
  if (!d) return undefined;
  const s = typeof d === "string" ? d : d.toISOString();
  const day = s.split("T")[0];
  return day || undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ownership + name recipe (step 3) — turns a media TYPE + context into the
// resolved `name` and `licensing` block that buildImageObject() consumes.
//
// Ownership map (locked): LOGO + GALLERY are attributed to the owning CLIENT
// (they supply the logo / upload the gallery); every other type
// (HERO · POST · OGIMAGE · TWITTER_IMAGE · CLIENT_MINI · GENERAL) is
// Modonty-PRODUCED and attributed to Modonty via Settings defaults.
// license + acquireLicensePage always come from Settings (the copyright-policy
// page) in BOTH cases — a rare CC/stock exception is a manual override at the caller.
//
// Name recipe (locked): LOGO → "شعار "+client · HERO/CLIENT_MINI → client ·
// POST (article image) → article title · GALLERY → client+" — صورة {n}" ·
// no context → altText fallback. `name` is a description, not a unique key —
// duplicates are fine. A caller-supplied manual name always wins.

/** The MediaType enum values (mirrors dataLayer Prisma `enum MediaType`). */
export type MediaTypeName =
  | "LOGO"
  | "POST"
  | "OGIMAGE"
  | "TWITTER_IMAGE"
  | "HERO"
  | "GENERAL"
  | "GALLERY"
  | "CLIENT_MINI";

/** Types attributed to the owning client (they own the asset). Everything else = Modonty. */
const CLIENT_OWNED_TYPES: ReadonlySet<MediaTypeName> = new Set(["LOGO", "GALLERY"]);

/** Modonty's licensing defaults, read from Settings + the org URL (step 2). */
export interface ModontyImageDefaults {
  /** Settings.imageOwnerName — e.g. "مدوّنتي". */
  ownerName?: string | null;
  /** Modonty organization URL (siteUrl) for the creator node. */
  organizationUrl?: string | null;
  /** Settings.imageLicenseUrl — absolute URL to the licence page. */
  licenseUrl?: string | null;
  /** Settings.imageAcquireLicensePageUrl — absolute URL to acquire a licence. */
  acquireLicensePageUrl?: string | null;
}

/** The resolved context for one image — whatever the caller already has on hand. */
export interface ImageAttributionContext {
  mediaType: MediaTypeName;
  /** The owning client's display name + page URL (for LOGO/GALLERY/HERO/CLIENT_MINI). */
  clientName?: string | null;
  clientUrl?: string | null;
  /** Article title (for POST/article images). */
  articleTitle?: string | null;
  /** 1-based position for GALLERY images (from a stable createdAt order). */
  galleryIndex?: number | null;
  /** Fallback name when there is no context. */
  altText?: string | null;
  /** Image creation date → the year in copyrightNotice. Omitted if unknown. */
  dateCreated?: string | Date | null;
  /** A writer-authored name overrides the composed one (optional). */
  manualName?: string | null;
}

function yearOf(d: string | Date | null | undefined): string | undefined {
  const day = dateOnly(d);
  const year = day?.split("-")[0];
  return year && /^\d{4}$/.test(year) ? year : undefined;
}

/** Compose the schema.org `name` from the type + context. Empty → undefined (caller omits). */
function composeImageName(ctx: ImageAttributionContext): string | undefined {
  if (ctx.manualName?.trim()) return ctx.manualName.trim();
  const client = ctx.clientName?.trim();
  const article = ctx.articleTitle?.trim();
  switch (ctx.mediaType) {
    case "LOGO":
      return client ? `شعار ${client}` : ctx.altText?.trim() || undefined;
    case "HERO":
    case "CLIENT_MINI":
      return client || ctx.altText?.trim() || undefined;
    case "POST":
      return article || ctx.altText?.trim() || undefined;
    case "GALLERY":
      if (!client) return ctx.altText?.trim() || undefined;
      return typeof ctx.galleryIndex === "number" && ctx.galleryIndex > 0
        ? `${client} — صورة ${ctx.galleryIndex}`
        : `${client} — صورة`;
    default:
      return ctx.altText?.trim() || undefined;
  }
}

/**
 * Resolve the ownership-based `name` + `licensing` for one image. Pure — the caller
 * passes what it already has (type, client/article context, Settings defaults) and gets
 * back exactly the two fields buildImageObject() needs, ready to spread into its input.
 */
export function resolveImageAttribution(
  ctx: ImageAttributionContext,
  defaults: ModontyImageDefaults
): { name?: string; licensing: ImageLicensing } {
  const clientOwned = CLIENT_OWNED_TYPES.has(ctx.mediaType);
  const ownerName = (clientOwned ? ctx.clientName : defaults.ownerName)?.trim() || undefined;
  const ownerUrl = (clientOwned ? ctx.clientUrl : defaults.organizationUrl)?.trim() || undefined;

  const creator: SchemaAgent | undefined = ownerName
    ? { type: "Organization", name: ownerName, url: ownerUrl }
    : undefined;

  const year = yearOf(ctx.dateCreated);
  const copyrightNotice = year && ownerName ? `© ${year} ${ownerName}` : undefined;

  return {
    name: composeImageName(ctx),
    licensing: {
      creator: creator ?? null,
      creditText: ownerName ?? null,
      copyrightNotice: copyrightNotice ?? null,
      license: defaults.licenseUrl?.trim() || null,
      acquireLicensePage: defaults.acquireLicensePageUrl?.trim() || null,
    },
  };
}

/**
 * Assemble one schema.org ImageObject node from resolved values. Every property that is
 * empty/absent is omitted — a node never carries a blank field.
 */
export function buildImageObject(input: BuildImageObjectInput): JsonLdNode {
  const node: JsonLdNode = {
    "@type": "ImageObject",
    url: input.url,
    contentUrl: (input.contentUrl && input.contentUrl.trim()) || input.url,
  };

  if (input.id?.trim()) node["@id"] = input.id.trim();
  if (input.name?.trim()) node.name = input.name.trim();
  if (input.caption?.trim()) node.caption = input.caption.trim();
  if (input.description?.trim()) node.description = input.description.trim();
  if (typeof input.width === "number" && input.width > 0) node.width = input.width;
  if (typeof input.height === "number" && input.height > 0) node.height = input.height;
  if (input.encodingFormat?.trim()) node.encodingFormat = input.encodingFormat.trim();

  const created = dateOnly(input.dateCreated);
  if (created) node.dateCreated = created;

  const lic = input.licensing;
  if (lic) {
    const creator = agentNode(lic.creator);
    if (creator) node.creator = creator;
    if (lic.creditText?.trim()) node.creditText = lic.creditText.trim();
    if (lic.copyrightNotice?.trim()) node.copyrightNotice = lic.copyrightNotice.trim();
    const holder = agentNode(lic.copyrightHolder);
    if (holder) node.copyrightHolder = holder;
    if (lic.license?.trim()) node.license = lic.license.trim();
    if (lic.acquireLicensePage?.trim()) node.acquireLicensePage = lic.acquireLicensePage.trim();
  }

  if (input.representativeOfPage) node.representativeOfPage = true;

  return node;
}
