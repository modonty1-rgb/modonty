"use server";

import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { cleanExpiredOtps } from "./orphan-cleaner";
import { cleanExpiredSessions } from "./session-cleaner";
import { cleanStaleVersions } from "./stale-versions";
import { createTTLIndex, getIndexHealth, ensurePerfIndexes } from "./index-health";
import { sanitizeAllLegalForms, sanitizeAllOrganizationTypes } from "./legalform-sanitizer";
import { sanitizeAllCanonicals } from "./canonical-sanitizer";
import { backfillArticleHreflang } from "./hreflang-backfill";
import { backfillArticleWordCount } from "./word-count-backfill";
import { backfillClientSiteFlag } from "./client-site-flag-backfill";
import { backfillMediaReelsFields } from "./media-reels-backfill";
import { backfillBlurPlaceholders } from "./blur-backfill";
import { backfillMediaDimensions } from "./dimensions-backfill";
import { sweepCloudinaryOrphans } from "./cloudinary-orphans";
import { hardDeleteOldSoftDeletedComments } from "./soft-deleted-comments";
import { seedIntakeForm } from "./seed-intake";
import { scanOrphans } from "./orphan-scan";

/** The public cache tags a fix can make stale — same union the revalidate helper accepts. */
type ModontyTag = Parameters<typeof revalidateModontyTag>[0];

export interface MaintenanceStepResult {
  key: string;
  label: string;
  ok: boolean;
  count: number;
  detail?: string;
  /**
   * Which modonty caches this step's fixes touch. Half of the matrix this file owns:
   * "what changed → what gets rebuilt → what gets flushed". Declared per step regardless of
   * outcome; `flushModontyAfterMaintenance` reads `ok` and `count` to decide what actually
   * goes out, so a step that touches a tag and fails can also BLOCK it.
   */
  dirtyTags?: ModontyTag[];
}

function ok(key: string, label: string, count: number, detail?: string): MaintenanceStepResult {
  return { key, label, ok: true, count, detail };
}

function fail(key: string, label: string, e: unknown): MaintenanceStepResult {
  return { key, label, ok: false, count: 0, detail: e instanceof Error ? e.message : String(e) };
}

/** Declare which public caches a step's fixes land in. The outcome is judged at flush time. */
function withTags(result: MaintenanceStepResult, tags: ModontyTag[]): MaintenanceStepResult {
  return { ...result, dirtyTags: tags };
}

export async function runStepOtps(): Promise<MaintenanceStepResult> {
  try {
    const r = await cleanExpiredOtps();
    return ok("otps", "Expired OTPs", r.deleted);
  } catch (e) {
    return fail("otps", "Expired OTPs", e);
  }
}

export async function runStepSessions(): Promise<MaintenanceStepResult> {
  try {
    const r = await cleanExpiredSessions();
    return ok("sessions", "Expired Sessions", r.deleted);
  } catch (e) {
    return fail("sessions", "Expired Sessions", e);
  }
}

export async function runStepVersions(): Promise<MaintenanceStepResult> {
  try {
    const r = await cleanStaleVersions(30);
    return ok("versions", "Stale Versions (30d+)", r.deleted);
  } catch (e) {
    return fail("versions", "Stale Versions (30d+)", e);
  }
}

export async function runStepTtl(): Promise<MaintenanceStepResult> {
  try {
    const indexes = await getIndexHealth();
    const missing = indexes.filter((i) => !i.exists);
    let created = 0;
    for (const idx of missing) {
      const res = await createTTLIndex(idx.collection, idx.field);
      if (res.success) created++;
    }
    return ok("ttl", "TTL Indexes Created", created);
  } catch (e) {
    return fail("ttl", "TTL Indexes Created", e);
  }
}

export async function runStepPerfIndexes(): Promise<MaintenanceStepResult> {
  try {
    const r = await ensurePerfIndexes();
    return ok(
      "perfIndexes",
      "Query Indexes",
      r.created,
      r.details.length ? r.details.join(" · ") : undefined,
    );
  } catch (e) {
    return fail("perfIndexes", "Query Indexes", e);
  }
}

export async function runStepLegalForm(): Promise<MaintenanceStepResult> {
  try {
    const r = await sanitizeAllLegalForms();
    return withTags(
      {
        key: "legalform",
        label: "Legal Forms Sanitized",
        ok: r.failed === 0,
        count: r.successful,
        detail: r.failed > 0 ? `${r.failed} failed` : undefined,
      },
      ["clients"],
    );
  } catch (e) {
    return fail("legalform", "Legal Forms Sanitized", e);
  }
}

export async function runStepOrganizationType(): Promise<MaintenanceStepResult> {
  try {
    const r = await sanitizeAllOrganizationTypes();
    return withTags(
      {
        key: "organizationType",
        label: "Organization Types Sanitized",
        ok: r.failed === 0,
        count: r.successful,
        detail: r.failed > 0 ? `${r.failed} failed` : undefined,
      },
      ["clients"],
    );
  } catch (e) {
    return fail("organizationType", "Organization Types Sanitized", e);
  }
}

export async function runStepCanonical(): Promise<MaintenanceStepResult> {
  try {
    const r = await sanitizeAllCanonicals();
    return withTags(
      {
        key: "canonical",
        label: "Canonical URLs Fixed",
        ok: r.failed === 0,
        count: r.successful,
        detail: r.failed > 0 ? `${r.failed} failed` : undefined,
      },
      // The six entity kinds the sanitizer walks (canonical-sanitizer.ts ENTITIES).
      ["clients", "articles", "categories", "tags", "industries", "authors"],
    );
  } catch (e) {
    return fail("canonical", "Canonical URLs Fixed", e);
  }
}

export async function runStepHreflang(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillArticleHreflang();
    return withTags(
      {
        key: "hreflang",
        label: "Article hreflang Backfilled",
        ok: r.failed === 0,
        count: r.successful,
        // The cap is stated, never silent. A partial sweep that reports nothing reads as a
        // complete one, and nobody re-runs a step that looked clean.
        detail: [
          r.failed > 0 ? `${r.failed} failed` : null,
          r.unscanned > 0 ? `${r.unscanned} not scanned (cap) — run again` : null,
        ].filter(Boolean).join(" · ") || undefined,
      },
      ["articles"],
    );
  } catch (e) {
    return fail("hreflang", "Article hreflang Backfilled", e);
  }
}

export async function runStepWordCount(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillArticleWordCount();
    return withTags(
      {
        key: "wordCount",
        label: "Article Word Count / Reading Time Recomputed",
        ok: r.failed === 0,
        count: r.successful,
        // The cap is stated, never silent. A partial sweep that reports nothing reads as a
        // complete one, and nobody re-runs a step that looked clean.
        detail: [
          r.failed > 0 ? `${r.failed} failed` : null,
          r.unscanned > 0 ? `${r.unscanned} not scanned (cap) — run again` : null,
        ].filter(Boolean).join(" · ") || undefined,
      },
      ["articles"],
    );
  } catch (e) {
    return fail("wordCount", "Article Word Count / Reading Time Recomputed", e);
  }
}

/**
 * Rebuilds articles whose stored SEO still carries an entity's OLD name.
 *
 * The merge dialogs run their per-article rebuild as a `for` loop in the BROWSER so the
 * editor watches a progress bar. Close the tab mid-loop and the database move has happened,
 * some articles were rebuilt, and the finalize never ran — leaving articles that quietly
 * publish the pre-merge tag or category name. Nothing else detects it: a merge never touches
 * the Article row, so every timestamp check sees a healthy article.
 *
 * Idempotent and self-scoping — it compares each blob against the entity's current name, so
 * on a healthy library it rebuilds nothing. Measured on modonty_dev before wiring it in:
 * 264 tag links and 128 category articles checked, 0 flagged; and a simulated rename on a
 * real row flipped it to flagged, so the check is not merely silent.
 */
export async function runStepEntityNameDrift(): Promise<MaintenanceStepResult> {
  try {
    const { repairEntityNameDrift } = await import("@/lib/seo/repair-entity-name-drift");
    const r = await repairEntityNameDrift();
    return withTags(
      {
        key: "entityNameDrift",
        label: "Articles Carrying an Old Tag/Category Name",
        ok: r.failed === 0,
        count: r.successful,
        detail: r.failed > 0 ? `${r.failed} failed of ${r.drifted} drifted` : undefined,
      },
      ["articles"],
    );
  } catch (e) {
    return fail("entityNameDrift", "Articles Carrying an Old Tag/Category Name", e);
  }
}

export async function runStepClientSiteFlag(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillClientSiteFlag();
    return withTags(
      ok(
        "clientSiteFlag",
        "Client-Site Flag Backfilled",
        r.filled,
        r.missing > 0 ? `${r.missing} articles had no flag` : undefined,
      ),
      ["articles"],
    );
  } catch (e) {
    return fail("clientSiteFlag", "Client-Site Flag Backfilled", e);
  }
}

export async function runStepMediaReelsBackfill(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillMediaReelsFields();
    return withTags(
      ok(
        "mediaReelsBackfill",
        "Media Reels Fields Backfilled",
        r.galleryFilled,
        r.countersFilled > 0 ? `${r.countersFilled} counters` : undefined,
      ),
      // `inGallery` is what the partner galleries filter on; the counters belong to the reels.
      ["clients", "reels"],
    );
  } catch (e) {
    return fail("mediaReelsBackfill", "Media Reels Fields Backfilled", e);
  }
}

/**
 * Reports dangling required relations. Deliberately does NOT delete.
 *
 * A found orphan is a page that is already down for whoever owns that row — one
 * dangling ArticleTag took the whole articles page away from جبر سيو. But an orphan can
 * also be a target that simply was not imported yet, and from here the two are
 * indistinguishable. So this raises the flag; a person decides what to remove.
 *
 * `ok: false` when anything is found — this is a fault to act on, not a tidy-up count.
 */
export async function runStepBlurBackfill(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillBlurPlaceholders();
    return withTags(
      {
        key: "blurBackfill",
        label: "Image Blur Placeholders",
        ok: r.failed === 0,
        count: r.filled,
        detail: r.failed > 0 ? `${r.failed} unreadable` : undefined,
      },
      // `blurDataURL` is read live off the Media row at render time — no stored card carries
      // it — so busting the pages that render those images is the whole delivery.
      ["articles", "clients", "pages"],
    );
  } catch (e) {
    return fail("blurBackfill", "Image Blur Placeholders", e);
  }
}

export async function runStepDimensionsBackfill(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillMediaDimensions();
    // Two audiences, and this step only serves one of them on its own. The VISITOR reads
    // width/height live off the Media row, so flushing the tags below delivers the
    // layout-shift fix immediately. GOOGLE reads the partner's stored card, which carries its
    // own copy of the logo/hero/gallery dimensions (generate-organization-jsonld.ts:284, 712,
    // 746, 888) — and this step does not rebuild cards. Say so rather than let the green
    // "29 fixed" imply the structured data moved too.
    const notes = [
      r.failed > 0 ? `${r.failed} unreadable` : undefined,
      r.filled > 0 ? "الأبعاد وصلت الصفحة — بطاقات الشركاء تحتاج «إعادة توليد شاملة» من /seo" : undefined,
    ].filter(Boolean);
    return withTags(
      {
        key: "dimensionsBackfill",
        label: "Image Dimensions (layout-shift guard)",
        ok: r.failed === 0,
        count: r.filled,
        detail: notes.length > 0 ? notes.join(" · ") : undefined,
      },
      ["articles", "clients", "pages"],
    );
  } catch (e) {
    return fail("dimensionsBackfill", "Image Dimensions (layout-shift guard)", e);
  }
}

export async function runStepOrphanRows(): Promise<MaintenanceStepResult> {
  try {
    const r = await scanOrphans();
    const worst = r.findings
      .slice(0, 3)
      .map((f) => `${f.key} (${f.count})`)
      .join(" · ");
    const detail = [
      `${r.relationsScanned} required relations scanned`,
      worst || undefined,
      r.failed.length > 0 ? `${r.failed.length} scans errored` : undefined,
    ]
      .filter(Boolean)
      .join(" — ");

    return {
      key: "orphanRows",
      label: "Orphan Rows (broken required relations)",
      ok: r.totalOrphans === 0 && r.failed.length === 0,
      count: r.totalOrphans,
      detail,
    };
  } catch (e) {
    return fail("orphanRows", "Orphan Rows (broken required relations)", e);
  }
}

export async function runStepCloudinaryOrphans(): Promise<MaintenanceStepResult> {
  try {
    const r = await sweepCloudinaryOrphans();
    return {
      key: "cloudinary",
      label: "Cloudinary Orphans Swept",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("cloudinary", "Cloudinary Orphans Swept", e);
  }
}

export async function runStepSoftDeletedComments(): Promise<MaintenanceStepResult> {
  try {
    const r = await hardDeleteOldSoftDeletedComments();
    return ok(
      "softDeletedComments",
      "Soft-Deleted Comments Purged (30d+)",
      r.deleted,
      r.deleted > 0 ? `${r.articleComments} article · ${r.clientComments} client` : undefined,
    );
  } catch (e) {
    return fail("softDeletedComments", "Soft-Deleted Comments Purged (30d+)", e);
  }
}

export async function runStepIntakeSeed(): Promise<MaintenanceStepResult> {
  try {
    const r = await seedIntakeForm();
    const created =
      (r.formCreated ? 1 : 0) + r.sectionsCreated + r.questionsCreated + r.optionsCreated;
    const parts: string[] = [];
    if (r.formCreated) parts.push("form");
    if (r.sectionsCreated) parts.push(`${r.sectionsCreated} sections`);
    if (r.questionsCreated) parts.push(`${r.questionsCreated} questions`);
    if (r.optionsCreated) parts.push(`${r.optionsCreated} options`);
    return ok("intakeSeed", "Intake Questionnaire Seeded", created, parts.join(" · ") || undefined);
  } catch (e) {
    return fail("intakeSeed", "Intake Questionnaire Seeded", e);
  }
}

export async function revalidateDatabasePage(): Promise<void> {
  revalidatePath("/database");
}

export interface MaintenanceFlushReport {
  /** Public cache tags actually busted. */
  flushed: ModontyTag[];
  /** Steps that changed rows but failed partway — their tags are blocked until a clean re-run. */
  held: Array<{ key: string; detail?: string; blockedTags: ModontyTag[] }>;
}

/**
 * Bust modonty's caches for what this pass actually changed.
 *
 * The point of a maintenance pass is the PUBLIC page: dimensions that stop the layout jumping,
 * a canonical on the right host, a word count Google can read. modonty serves cached pages, so
 * until its tags are busted none of that reaches a reader — the panel said "29 fixed" and
 * www.modonty.com kept serving the old page for hours. This file used to call
 * `revalidatePath("/database")` and nothing else: an admin path, refreshing the panel that
 * reported the fix rather than the page carrying it.
 *
 * A step that changed rows and then FAILED partway is the dangerous one: some columns are
 * corrected and their stored cards are not. modonty builds a page from both, so busting that
 * tag serves a half-new page and stamps the stale half as fresh. Such a step BLOCKS its tags —
 * even when another step dirtied the same tag cleanly, because a tag is flushed as a whole and
 * there is no way to bust the good rows without the bad ones. Everything blocked is named in
 * the return value, so the operator sees which fix has not gone out instead of assuming it did.
 */
export async function flushModontyAfterMaintenance(
  results: MaintenanceStepResult[],
): Promise<MaintenanceFlushReport> {
  const changedRows = (r: MaintenanceStepResult) => r.count > 0;

  const held = results
    .filter((r) => !r.ok && changedRows(r))
    .map((r) => ({ key: r.key, detail: r.detail, blockedTags: r.dirtyTags ?? [] }));

  const blocked = new Set(held.flatMap((h) => h.blockedTags));
  const flushed = [
    ...new Set(
      results
        .filter((r) => r.ok && changedRows(r))
        .flatMap((r) => r.dirtyTags ?? [])
        .filter((tag) => !blocked.has(tag)),
    ),
  ];

  // Sequential: each tag is one HTTP round-trip to modonty, and a maintenance pass is a
  // manual button — there is nothing to win by racing them against the same instance.
  for (const tag of flushed) {
    await revalidateModontyTag(tag);
  }

  return { flushed, held };
}

/**
 * One line per Run-All — not per step. A maintenance pass rewrites hundreds of rows
 * across every collection, so "who ran it, when, and what did it change" is worth
 * keeping; eleven rows saying "cleaned" are not.
 *
 * Called by the panel once the whole pass finishes.
 */
export async function logMaintenanceRunAction(
  results: Array<{ key: string; ok: boolean; count: number }>,
): Promise<void> {
  const { logAction } = await import("@/lib/audit/log-action");
  const totalFixed = results.reduce((sum, r) => sum + (r.count || 0), 0);
  const failed = results.filter((r) => !r.ok).map((r) => r.key);

  await logAction("database.maintenance", {
    entity: "Database",
    summary: `صيانة شاملة — ${totalFixed} إصلاحاً عبر ${results.length} خطوة`,
    metadata: {
      totalFixed,
      steps: results.filter((r) => r.count > 0).map((r) => `${r.key}:${r.count}`),
      ...(failed.length > 0 && { failed }),
    },
  });
}
