// JSON-LD validity + completeness score for a client (0–100).
//
// Two pillars, per Google + schema.org:
//  1) STRUCTURAL VALIDITY (60) — does the generated JSON-LD actually pass the
//     validators (Adobe + Ajv + custom rules) that we already run and store in
//     `Client.jsonLdValidationReport`? Hard errors = Google won't show rich results.
//     This is the part the old "count fields" scorer ignored.
//  2) RECOMMENDED COMPLETENESS (40) — Organization has NO required props (Google);
//     it's all "recommended", so reward coverage of the high-value recommended
//     fields. For a LocalBusiness type, address becomes required-weight.
//
// Reads the STORED jsonLdStructuredData + jsonLdValidationReport so the number
// matches what's actually published, identical across every surface.

import type { SeoScore, SeoCheck, JsonLdValidationReport } from "./types";
import { countReportErrors, countReportWarnings } from "./types";
import { isLocalFamilyType } from "../organization-schema-types";

// Raw client fields that feed the JSON-LD (presence = the recommended property
// was emitted). We read the client row, not the generated string, for completeness.
export interface ClientJsonLdInput {
  jsonLdStructuredData?: string | null;
  jsonLdValidationReport?: JsonLdValidationReport | null;

  // Identity
  name?: string | null;
  url?: string | null;
  logoMediaId?: string | null;
  heroImageMediaId?: string | null;
  description?: string | null;
  alternateName?: string | null;
  slogan?: string | null;
  // Contact
  phone?: string | null;
  email?: string | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressRegion?: string | null;
  addressPostalCode?: string | null;
  addressCountry?: string | null;
  // Real-world presence
  sameAs?: string[] | null;
  legalName?: string | null;
  foundingDate?: Date | string | null;
  // Identifiers
  vatID?: string | null;
  taxID?: string | null;
  commercialRegistrationNumber?: string | null;
  businessActivityCode?: string | null;
  numberOfEmployees?: string | null;
  // Local SEO
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  openingHoursSpecification?: unknown;
  priceRange?: string | null;
  gbpPlaceId?: string | null;
  // Classification
  organizationType?: string | null;
}

const filled = (v: unknown): boolean => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "number") return !Number.isNaN(v);
  return true;
};

/**
 * The @type the client's card ACTUALLY carries — not the one sitting in the column.
 *
 * They differ by design: the builder resolves a clinic stored as "Corporation" to Dentist.
 * Scoring the column would then ask questions about a business that is not the one Google
 * reads. This reads the served card and falls back to the column only when no card exists.
 */
function cardOrganizationType(jsonLd: string | null | undefined): string | null {
  if (!jsonLd || typeof jsonLd !== "string") return null;
  try {
    const parsed = JSON.parse(jsonLd) as { "@graph"?: Array<Record<string, unknown>> };
    const graph = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [];
    const org = graph.find((n) => String(n["@id"] ?? "").endsWith("#organization"));
    const t = org?.["@type"];
    return typeof t === "string" ? t : Array.isArray(t) ? String(t[0]) : null;
  } catch {
    return null;
  }
}

function hasGraph(jsonLd: string | null | undefined): boolean {
  if (!jsonLd || typeof jsonLd !== "string") return false;
  try {
    const p = JSON.parse(jsonLd) as { "@graph"?: unknown };
    return Array.isArray(p?.["@graph"]) && p["@graph"].length > 0;
  } catch {
    return false;
  }
}

/**
 * Compute the client JSON-LD score.
 * Pillar A — Validity (60): graph exists 20 · zero hard errors 30 · zero warnings 10.
 * Pillar B — Completeness (40): weighted coverage of recommended Organization /
 * LocalBusiness properties.
 */
export function computeClientJsonLdScore(input: ClientJsonLdInput): SeoScore {
  const checks: SeoCheck[] = [];
  // One list, shared with the generator (organization-schema-types). The copy that used to
  // live here held 9 of the types and no Optician, Hospital or Pharmacy — so a hospital was
  // scored as if an address did not matter to it.
  const isLocal = isLocalFamilyType(
    cardOrganizationType(input.jsonLdStructuredData) ?? input.organizationType,
  );

  // ── Pillar A: structural validity (from the stored validation report) ──
  const graphOk = hasGraph(input.jsonLdStructuredData);
  checks.push({
    key: "jsonld.graph", label: "بيانات مهيكلة مُولّدة",
    status: graphOk ? "good" : "error",
    hint: graphOk ? undefined : "لم تُولّد البيانات المهيكلة بعد — احفظ لتوليدها",
    earned: graphOk ? 20 : 0, max: 20,
  });

  const errors = countReportErrors(input.jsonLdValidationReport);
  const warnings = countReportWarnings(input.jsonLdValidationReport);
  // Only meaningful when a graph + report exist.
  const hasReport = Boolean(input.jsonLdValidationReport) && graphOk;
  checks.push({
    key: "jsonld.valid", label: "صحّة البنية (بلا أخطاء)",
    status: !graphOk ? "error" : errors === 0 ? "good" : "error",
    hint: !graphOk ? "بانتظار التوليد" : errors === 0 ? undefined : `${errors} خطأ بنيوي يمنع Rich Results`,
    earned: hasReport && errors === 0 ? 30 : 0, max: 30,
  });
  checks.push({
    key: "jsonld.warnings", label: "بلا تحذيرات",
    status: !graphOk ? "warning" : warnings === 0 ? "good" : "warning",
    hint: warnings === 0 ? undefined : `${warnings} تحذير — يُفضّل معالجته`,
    earned: hasReport && warnings === 0 ? 10 : 0, max: 10,
  });

  // ── Logo (10) — STANDALONE + required. Google: a logo is required for the
  // Organization to be eligible for logo/knowledge-panel rich results, so it gets
  // its own heavy check (not buried in "identity"). Missing logo = the real cause
  // of most "Logo missing" validator errors. ImageObject is built by the generator.
  {
    const ok = filled(input.logoMediaId);
    checks.push({
      key: "jsonld.logo", label: "الشعار (مطلوب لـ Rich Results)",
      status: ok ? "good" : "error",
      hint: ok ? undefined : "أضف شعار العميل — مطلوب لظهور المنظمة في Google",
      earned: ok ? 10 : 0, max: 10,
    });
  }

  // ── Share/Hero image (4) — feeds OG + Twitter + JSON-LD primaryImageOfPage.
  // One hero image drives all three social/structured-data outputs.
  {
    const ok = filled(input.heroImageMediaId);
    checks.push({
      key: "jsonld.heroImage", label: "صورة الغلاف (مشاركة/بنية)",
      status: ok ? "good" : "warning",
      hint: ok ? undefined : "أضف صورة غلاف (تُستخدم للمشاركة وداخل البيانات المهيكلة)",
      earned: ok ? 4 : 0, max: 4,
    });
  }

  // ── Pillar B remainder: recommended completeness (26), weighted ──
  // Each group contributes proportionally; contact/address is heavier for local types.
  const groups: Array<{ key: string; label: string; max: number; done: number; total: number; hint: string }> = [
    {
      key: "identity", label: "الهوية (وصف/اسم بديل/رابط)", max: 6, hint: "أضف وصفاً واسماً بديلاً ورابط الموقع",
      total: 3,
      done: [filled(input.description), filled(input.alternateName), filled(input.url)].filter(Boolean).length,
    },
    {
      key: "contact", label: "التواصل (هاتف/إيميل/تواصل/عنوان)", max: isLocal ? 8 : 6, hint: "أضف الهاتف والإيميل ونوع التواصل والعنوان",
      total: 4,
      done: [
        filled(input.phone),
        filled(input.email),
        filled(input.contactType),
        filled(input.addressCity) && filled(input.addressCountry),
      ].filter(Boolean).length,
    },
    {
      key: "presence", label: "حضور واقعي (sameAs/قانوني/تأسيس)", max: isLocal ? 4 : 6, hint: "أضف روابط التواصل والاسم القانوني وتاريخ التأسيس",
      total: 3,
      done: [filled(input.sameAs), filled(input.legalName), filled(input.foundingDate)].filter(Boolean).length,
    },
    {
      key: "identifiers", label: "معرّفات الأعمال (ضريبي/سجل)", max: 4, hint: "أضف الرقم الضريبي/السجل التجاري",
      total: 2,
      done: [filled(input.vatID) || filled(input.taxID), filled(input.commercialRegistrationNumber)].filter(Boolean).length,
    },
    {
      key: "local", label: "Local SEO (إحداثيات/ساعات/سعر)", max: isLocal ? 4 : 4, hint: "أضف الإحداثيات وساعات العمل ونطاق السعر وPlace ID",
      total: 4,
      done: [
        filled(input.addressLatitude) && filled(input.addressLongitude),
        filled(input.openingHoursSpecification),
        filled(input.priceRange),
        filled(input.gbpPlaceId),
      ].filter(Boolean).length,
    },
  ];

  for (const g of groups) {
    const earned = g.total > 0 ? Math.round((g.done / g.total) * g.max) : 0;
    const status: SeoCheck["status"] = g.done === g.total ? "good" : g.done === 0 ? "error" : "warning";
    checks.push({
      key: `jsonld.${g.key}`, label: g.label, status,
      hint: g.done === g.total ? undefined : g.hint,
      earned, max: g.max,
    });
  }

  const earned = checks.reduce((s, c) => s + c.earned, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((earned / max) * 100) : 0;
  return { score, checks };
}
