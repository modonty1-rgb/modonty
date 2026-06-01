"use server";

import { revalidatePath } from "next/cache";
import { cleanExpiredOtps } from "./orphan-cleaner";
import { cleanExpiredSessions } from "./session-cleaner";
import { cleanStaleVersions } from "./stale-versions";
import { createTTLIndex, getIndexHealth } from "./index-health";
import { sanitizeAllLegalForms, sanitizeAllOrganizationTypes } from "./legalform-sanitizer";
import { sanitizeAllCanonicals } from "./canonical-sanitizer";
import { sweepCloudinaryOrphans } from "./cloudinary-orphans";
import { hardDeleteOldSoftDeletedComments } from "./soft-deleted-comments";

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

export async function revalidateDatabasePage(): Promise<void> {
  revalidatePath("/database");
}
