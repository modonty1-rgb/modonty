"use server";

import { db } from "@/lib/db";

/**
 * Legal Form Sanitizer
 *
 * Reason: `Client.legalForm` must be one of 7 canonical English enum values
 * (enforced by the form's Zod schema). Legacy/free-text Arabic values (e.g.
 * "شركة شخص واحد") block ALL form saves on the affected client — including
 * unrelated fields like password — because RHF validates the whole schema.
 *
 * This tool: (1) detects non-canonical values, (2) maps Arabic → English via
 * a 10-rule table (longest-match first), (3) sanitizes in bulk on demand.
 */

const VALID_ENUM = new Set([
  "LLC",
  "JSC",
  "Sole Proprietorship",
  "Partnership",
  "Limited Partnership",
  "Simplified Joint Stock Company",
  "One-Person Company",
]);

const MAPPING: Array<{ pattern: RegExp; to: string }> = [
  { pattern: /شركة\s*الشخص\s*الواحد/i, to: "One-Person Company" },
  { pattern: /شركة\s*شخص\s*واحد/i, to: "One-Person Company" },
  { pattern: /شركة\s*مساهمة\s*مبسطة/i, to: "Simplified Joint Stock Company" },
  { pattern: /شركة\s*مساهمة/i, to: "JSC" },
  { pattern: /شركة\s*توصية\s*بسيطة/i, to: "Limited Partnership" },
  { pattern: /شركة\s*تضامن/i, to: "Partnership" },
  { pattern: /مؤسسة\s*فردية/i, to: "Sole Proprietorship" },
  { pattern: /شركة\s*ذات\s*مسؤولية\s*محدودة/i, to: "LLC" },
  { pattern: /ش\.?\s*ذ\.?\s*م\.?\s*م/i, to: "LLC" },
  { pattern: /شركة\s*ذم\.?م/i, to: "LLC" },
];

function mapValue(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (VALID_ENUM.has(v)) return v;
  for (const rule of MAPPING) {
    if (rule.pattern.test(v)) return rule.to;
  }
  return null;
}

export interface LegalFormIssue {
  id: string;
  name: string | null;
  before: string;
  after: string | null; // null = no mapping rule matched (manual fix needed)
}

export interface LegalFormSanitizerStats {
  totalClients: number;
  canonicalOrNull: number;
  mappableCount: number;
  unmappedCount: number;
  mappable: LegalFormIssue[];
  unmapped: LegalFormIssue[];
}

export async function getLegalFormSanitizerStats(): Promise<LegalFormSanitizerStats> {
  const clients = await db.client.findMany({
    select: { id: true, name: true, legalForm: true },
  });

  const mappable: LegalFormIssue[] = [];
  const unmapped: LegalFormIssue[] = [];
  let canonicalOrNull = 0;

  for (const c of clients) {
    if (!c.legalForm || VALID_ENUM.has(c.legalForm)) {
      canonicalOrNull++;
      continue;
    }
    const mapped = mapValue(c.legalForm);
    const issue: LegalFormIssue = { id: c.id, name: c.name, before: c.legalForm, after: mapped };
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

export interface SanitizerResult {
  attempted: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export async function sanitizeAllLegalForms(): Promise<SanitizerResult> {
  const stats = await getLegalFormSanitizerStats();
  const result: SanitizerResult = {
    attempted: stats.mappable.length,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (const issue of stats.mappable) {
    if (!issue.after) continue;
    try {
      await db.client.update({ where: { id: issue.id }, data: { legalForm: issue.after } });
      result.successful++;
    } catch (e) {
      result.failed++;
      result.errors.push({ id: issue.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return result;
}
