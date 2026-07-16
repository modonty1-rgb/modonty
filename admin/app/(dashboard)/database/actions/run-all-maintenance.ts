"use server";

import { revalidatePath } from "next/cache";
import { cleanExpiredOtps } from "./orphan-cleaner";
import { cleanExpiredSessions } from "./session-cleaner";
import { cleanStaleVersions } from "./stale-versions";
import { createTTLIndex, getIndexHealth, ensurePerfIndexes } from "./index-health";
import { sanitizeAllLegalForms, sanitizeAllOrganizationTypes } from "./legalform-sanitizer";
import { sanitizeAllCanonicals } from "./canonical-sanitizer";
import { backfillArticleHreflang } from "./hreflang-backfill";
import { sweepCloudinaryOrphans } from "./cloudinary-orphans";
import { hardDeleteOldSoftDeletedComments } from "./soft-deleted-comments";
import { seedIntakeForm } from "./seed-intake";

export interface MaintenanceStepResult {
  key: string;
  label: string;
  ok: boolean;
  count: number;
  detail?: string;
}

function ok(key: string, label: string, count: number, detail?: string): MaintenanceStepResult {
  return { key, label, ok: true, count, detail };
}

function fail(key: string, label: string, e: unknown): MaintenanceStepResult {
  return { key, label, ok: false, count: 0, detail: e instanceof Error ? e.message : String(e) };
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
    return {
      key: "legalform",
      label: "Legal Forms Sanitized",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("legalform", "Legal Forms Sanitized", e);
  }
}

export async function runStepOrganizationType(): Promise<MaintenanceStepResult> {
  try {
    const r = await sanitizeAllOrganizationTypes();
    return {
      key: "organizationType",
      label: "Organization Types Sanitized",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("organizationType", "Organization Types Sanitized", e);
  }
}

export async function runStepCanonical(): Promise<MaintenanceStepResult> {
  try {
    const r = await sanitizeAllCanonicals();
    return {
      key: "canonical",
      label: "Canonical URLs Fixed",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("canonical", "Canonical URLs Fixed", e);
  }
}

export async function runStepHreflang(): Promise<MaintenanceStepResult> {
  try {
    const r = await backfillArticleHreflang();
    return {
      key: "hreflang",
      label: "Article hreflang Backfilled",
      ok: r.failed === 0,
      count: r.successful,
      detail: r.failed > 0 ? `${r.failed} failed` : undefined,
    };
  } catch (e) {
    return fail("hreflang", "Article hreflang Backfilled", e);
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
