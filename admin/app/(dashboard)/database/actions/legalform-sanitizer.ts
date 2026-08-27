"use server";

import { db } from "@/lib/db";
import {
  normalizeLegalForm,
  normalizeOrganizationType,
} from "@modonty/shared/lib/constants/client-classification";
import { generateClientSEO } from "@/app/(dashboard)/clients/actions/clients-actions/generate-client-seo";
import { assertRegenerated } from "../helpers/assert-regenerated";

/**
 * Classification sanitizer (legalForm + organizationType).
 *
 * Reason: legacy/free-text Arabic values (e.g. "مؤسسة فردية") block ALL form saves
 * on the affected client — admin's Zod enum validates the whole schema. The console
 * now writes canonical values (dropdown + normalize), but old rows still need fixing.
 *
 * Single source of truth: the canonical lists + mapping live in
 * `@modonty/shared/lib/constants/client-classification`. This tool only scans the
 * DB and applies `normalize*()` — no mapping table is duplicated here.
 */

type ClassificationField = "legalForm" | "organizationType";

export interface ClassificationIssue {
  id: string;
  name: string | null;
  before: string;
  after: string | null; // null = no mapping rule matched (manual fix needed)
}

export interface SanitizerStats {
  totalClients: number;
  canonicalOrNull: number;
  mappableCount: number;
  unmappedCount: number;
  mappable: ClassificationIssue[];
  unmapped: ClassificationIssue[];
}

export interface SanitizerResult {
  attempted: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

function normalizerFor(field: ClassificationField) {
  return field === "legalForm" ? normalizeLegalForm : normalizeOrganizationType;
}

async function scan(field: ClassificationField): Promise<SanitizerStats> {
  const clients = await db.client.findMany({
    select: { id: true, name: true, legalForm: true, organizationType: true },
  });
  const normalize = normalizerFor(field);

  const mappable: ClassificationIssue[] = [];
  const unmapped: ClassificationIssue[] = [];
  let canonicalOrNull = 0;

  for (const c of clients) {
    const current = c[field];
    if (!current) {
      canonicalOrNull++;
      continue;
    }
    const mapped = normalize(current);
    if (mapped === current) {
      canonicalOrNull++; // already canonical
      continue;
    }
    const issue: ClassificationIssue = { id: c.id, name: c.name, before: current, after: mapped };
    if (mapped) mappable.push(issue);
    else unmapped.push(issue);
  }

  return {
    totalClients: clients.length,
    canonicalOrNull,
    mappableCount: mappable.length,
    unmappedCount: unmapped.length,
    mappable,
    unmapped,
  };
}

async function sanitize(field: ClassificationField): Promise<SanitizerResult> {
  const stats = await scan(field);
  const result: SanitizerResult = { attempted: stats.mappable.length, successful: 0, failed: 0, errors: [] };

  for (const issue of stats.mappable) {
    if (!issue.after) continue;
    try {
      await db.client.update({
        where: { id: issue.id },
        data: field === "legalForm" ? { legalForm: issue.after } : { organizationType: issue.after },
      });
    } catch (e) {
      result.failed++;
      result.errors.push({ id: issue.id, error: e instanceof Error ? e.message : String(e) });
      continue;
    }

    // Rebuild the partner's stored card so the fix reaches a reader.
    //
    // `organizationType` IS the card's `@type` (generate-organization-jsonld.ts:236) and
    // `legalForm` travels in the same card. modonty serves the STORED card, so a corrected
    // column with an un-rebuilt card leaves the public page on the old type — while this
    // counter says "successful". Same swallow the canonical sanitizer closed one file over,
    // and `generateClientSEO` never throws, so its answer has to be read, not just awaited.
    try {
      await assertRegenerated(generateClientSEO(issue.id), "بطاقة الشريك");
    } catch (e) {
      result.failed++;
      result.errors.push({
        id: issue.id,
        error: `التصنيف انصحّح في القاعدة، لكن بطاقة الشريك ما تجدّدت — الصفحة العامة ما زالت على النوع القديم: ${e instanceof Error ? e.message : String(e)}`,
      });
      continue;
    }
    result.successful++;
  }

  return result;
}

// ─── legalForm (legacy export names preserved for existing UI) ───────────────
export type LegalFormIssue = ClassificationIssue;
export type LegalFormSanitizerStats = SanitizerStats;

export async function getLegalFormSanitizerStats(): Promise<SanitizerStats> {
  return scan("legalForm");
}
export async function sanitizeAllLegalForms(): Promise<SanitizerResult> {
  return sanitize("legalForm");
}

// ─── organizationType ────────────────────────────────────────────────────────
export async function getOrganizationTypeSanitizerStats(): Promise<SanitizerStats> {
  return scan("organizationType");
}
export async function sanitizeAllOrganizationTypes(): Promise<SanitizerResult> {
  return sanitize("organizationType");
}
