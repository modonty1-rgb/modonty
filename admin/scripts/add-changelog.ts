/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "0.61.0 (admin + modonty + console)",
    title: "admin v0.61.0 — YMYL system: medical/legal/financial verification + JSON-LD pipeline + SEO publish UX hotfix",
    items: [
      { type: "feature" as const, text: "YMYL (Your Money Your Life) verification system end-to-end: per-client admin checkbox + medical/legal/financial radio + dynamic console form. Client.ymylData Json holds category-specific fields (license + authority + specialty + image) — shape varies by category. 4 new schema fields total (Client.isYmyl + ymylCategory + ymylData + Article.reviewedById). Single source of truth: lib/seo/ymyl-config.ts (mirrored to console/lib/seo/) with 3 categories · 10 medical specialties (Dentist/Hospital/Pharmacy/Optician/Dietitian/PhysicalTherapy/DiagnosticLab/MedicalClinic) · 9 legal · 7 financial. Country-keyed authority dropdowns (SA: MOH/SCFHS/SFDA · EG: MOHP/EMS · AE: DHA/DoH/MoHAP · CMA/SAMA/ZATCA · FRA/CBE · SCA/CBUAE). Verified end-to-end: 33 JSON-LD assertions + 81 config/validation/gate checks across all 3 categories pass." },
      { type: "feature" as const, text: "JSON-LD generator emits Medical/Legal/Financial schema.org @types dynamically: MedicalClinic→Dentist (specialty→sub-type resolution), LegalService→Attorney, FinancialService→Person reviewer node. MedicalWebPage wrapper with reviewedBy + lastReviewed (medical only — per schema.org these properties live on WebPage not Article). Reviewer node Physician/Attorney/Person with structured hasCredential array. identifier (license + authority) + areaServed + medicalSpecialty all propagated. Pipeline proven end-to-end: schema → save → JSON-LD generator → DB cache → modonty SSR → browser HTML. Browser-verified on modonty.com/articles/[slug] — 8 nodes in @graph for medical YMYL article, 7 nodes for legal." },
      { type: "feature" as const, text: "Publish gate (admin/lib/seo/ymyl-helpers.ts checkYmylPublishGate): when client.isYmyl=true, blocks DRAFT → AWAITING_APPROVAL transition unless reviewedById is set, ymylData is complete (all required fields filled), and content has no forbidden claims for the category. Per-category default forbidden lists (medical: 'نضمن الشفاء', financial: 'عائد مضمون', legal: 'نضمن الفوز بالقضية', etc.). Per-client override via Client.forbiddenKeywords[] still works. Wired into gated-transition.ts after the 28-check validator passes." },
      { type: "feature" as const, text: "Admin UI — Client edit form: new YMYL Verification accordion (between Company Profile and SEO Details) with checkbox + radio + read-only Client Completion Status badge (amber 'Awaiting client (X/N)' or emerald 'Client completed' with progress count). Verification fields owned by client via console — NOT editable in admin. Article edit form: conditional YMYL Reviewer dropdown appears in Basic section when selected client.isYmyl=true, with Arabic helper text explaining E-E-A-T + Physician/Attorney role. Required at publish-time." },
      { type: "feature" as const, text: "Console UI — Profile page: new YMYL Verification section appears ONLY when client.isYmyl=true (admin-controlled gate). Renders dynamic field grid (text/dropdown/specialty/image renderers) from YMYL_CATEGORIES config — same source of truth as admin. Country-aware authority dropdowns. Progress badge (X/N required fields filled). Sonner toast on save. updateYmylData() server action auth-checked + clientId from session (cross-tenant safe) + silently rejects if client isn't flagged YMYL." },
      { type: "fix" as const, text: "SEO publish UX hotfix: opaque 'String must contain at most 50 character(s)' errors now surface field name. create-article.ts + update-article.ts Zod safeParse maps ALL failed fields to 'بيانات غير صحيحة — fieldName: message · fieldName2: message'. publishArticle validateArticleData rewritten — every message Arabic-first with field name + current character count (e.g. 'وصف SEO مطلوب ولا يقل عن 50 حرفاً — حالياً 32 حرف'). Errors aggregated as bullet list (\\n•) — admin sees ALL blockers at once. SEO score < 60 shows weak categories breakdown ('الأقسام الضعيفة: images 0% · social 40%'). Toast description gets whitespace-pre-line for multi-line render." },
      { type: "fix" as const, text: "Cleanup deprecated columns: dropped Client.licenseNumber + Client.licenseAuthority + Client.ga4PropertyId + Client.ga4MeasurementId from Prisma schema (4 fields removed). License data lives in Client.ymylData JSON via YMYL system. GA4 removal per OBS-226 architectural decision: one Container globally + filter by clientId in GA4 — no per-tenant tracking IDs. Cleaned 11 backend files + 4 UI display blocks + 1 modonty client-official-data row. Removed validateLicenseInfo validator (unused). TSC admin 0 · modonty 0 · console 0 source errors." },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

// Hardcoded PROD DB URL (user decision 2026-04-29) — to avoid env juggling.
// ⚠️ Trade-off: URL credentials are in git history. Rotate Atlas password = update all 3 changelog scripts.
const PRODUCTION_DATABASE_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const localDb = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const prodDb = new PrismaClient({ datasources: { db: { url: PRODUCTION_DATABASE_URL } } });

async function run() {
  if (!process.env.DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }

  for (const entry of entries) {
    const [local, prod] = await Promise.all([
      localDb.changelog.create({ data: entry }),
      prodDb.changelog.create({ data: entry }),
    ]);
    console.log(`✅ v${entry.version} — LOCAL: ${local.id}  PROD: ${prod.id}`);
  }

  console.log(`\nDone. ${entries.length} entries added to both databases.`);
  await Promise.all([localDb.$disconnect(), prodDb.$disconnect()]);
}

run().catch((e) => { console.error(e); process.exit(1); });
