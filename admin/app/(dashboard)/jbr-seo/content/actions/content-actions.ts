// منسوخ من jbrseo.com/app/actions/content-sections.ts — إدارة محتوى موقع جبر سيو من أدمن مودونتي.
// يحرّر نفس صفوف القاعدة التي يحرّرها أدمن جبر سيو (قاعدة واحدة، نماذج مرآة).
// ⚠️ مرآة: أي تغيير في شكل الحقول يُطبَّق هنا وفي jbrseo.com معاً.

"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getLandingSectionOverride, upsertLandingSection } from "@/lib/jbr/landing-sections";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const CONTENT_KEYS = [
  "hero",
  "socialProof",
  "faq",
  "finalCta",
  "header",
  "footer",
  "pricingPage",
  "privacy",
  "terms",
  "about",
  "team",
] as const;

type ContentKey = (typeof CONTENT_KEYS)[number];

function assertSection(section: string): asserts section is ContentKey {
  if (!CONTENT_KEYS.includes(section as ContentKey)) {
    throw new Error("Invalid section");
  }
}

function revalidateLanding() {
  revalidateTag("landing", "default");
  revalidatePath("/");
}

export async function updateSection(formData: FormData) {
  if (!(!!(await auth())?.user)) return;

  const section = (formData.get("section") as string | null)?.trim() ?? "";
  const rawData = (formData.get("data") as string | null) ?? "";
  const redirectTo =
    (formData.get("redirect") as string | null)?.trim() ??
    `/admin/content/${section}`;

  if (!section || !rawData) {
    return redirect(redirectTo);
  }

  try {
    assertSection(section);
  } catch {
    return redirect(redirectTo);
  }

  let parsed: Prisma.InputJsonValue;
  try {
    parsed = JSON.parse(rawData) as Prisma.InputJsonValue;
  } catch {
    // If JSON is invalid, just redirect without saving.
    return redirect(redirectTo);
  }

  await upsertLandingSection(section, parsed);

  revalidateTag("landing", "default");
  revalidatePath("/");
  revalidatePath("/privacy");
  revalidatePath("/terms");

  redirect(redirectTo + (redirectTo.includes("?") ? "&" : "?") + "saved=1");
}

// ─── Content reference editor (/admin/review) ───────────────────────────────
// The reference page edits every content section: scalar fields via a dialog,
// arrays via a manage dialog (add/remove/reorder, incl. image-URL fields). This
// action updates one field (by its path) or replaces a whole array inside the
// section JSON, read-modify-writes the whole section (no field loss), revalidates.
const INLINE_KEYS = ["hero", "faq", "finalCta", "about", "privacy", "terms", "ctaLabel", "socialProof", "team", "seo", "socialLinks", "header", "footer"] as const;
type InlineKey = (typeof INLINE_KEYS)[number];

export type InlineSaveResult = { ok: boolean; error?: string };

/** Immutably set `value` (any JSON) at `path` inside a nested JSON object. */
function setAtPath(
  current: unknown,
  path: (string | number)[],
  value: unknown,
): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(current) ? [...current] : [];
    arr[head] = setAtPath(arr[head], rest, value);
    return arr;
  }
  const obj = current && typeof current === "object" && !Array.isArray(current)
    ? { ...(current as Record<string, unknown>) }
    : {};
  obj[head] = setAtPath(obj[head], rest, value);
  return obj;
}

// ── Plan content lives in the Plan table but is edited from the reference page.
// Content is shared across countries, so a write fans out to BOTH SA + EG rows.
// `section` = "plan:<slug>" routes the write to the Plan table.
const PLAN_CONTENT_FIELDS = new Set([
  "name", "tagline", "articlesLabel", "ctaText", "badge", "featuredBadge", "highlights",
]);
const SITE_SETTINGS_FIELDS = new Set(["whatsappNumber", "gtmId"]);

async function writeSiteSettings(path: (string | number)[], value: unknown): Promise<InlineSaveResult> {
  const field = String(path[0] ?? "");
  if (!SITE_SETTINGS_FIELDS.has(field)) return { ok: false, error: "حقل غير مسموح" };
  const v = String(value ?? "");
  try {
    const existing = await db.jbrSiteSettings.findFirst();
    if (existing) {
      await db.jbrSiteSettings.update({ where: { id: existing.id }, data: { [field]: v } });
    } else {
      await db.jbrSiteSettings.create({ data: { gtmId: "", whatsappNumber: "", [field]: v } });
    }
  } catch {
    return { ok: false, error: "تعذّر الحفظ" };
  }
  revalidateTag("landing", "default");
  revalidatePath("/");
  revalidatePath("/sa");
  revalidatePath("/eg");
  revalidatePath("/admin/review");
  return { ok: true };
}

// ⛔ writePlanContent أُسقطت عمداً — الباقات والأسعار تبقى في أدمن جبر سيو
//    بيد خالد، ولا يحرّرها طارق من أدمن مودونتي (قرار JBR11).

// A field edit sends a string; an array edit sends the whole new array (JSON).
export async function updateSectionField(
  section: string,
  path: (string | number)[],
  value: unknown,
): Promise<InlineSaveResult> {
  if (!(!!(await auth())?.user)) return { ok: false, error: "غير مصرّح" };

  // ⛔ الباقات مرفوضة صراحةً — تُحرَّر من أدمن جبر سيو بيد خالد (قرار JBR11).
  //    الرفض هنا حاجز أخير: الواجهة لا تعرضها أصلاً، فلا تصل هذه النقطة عادةً.
  if (section.startsWith("plan:")) {
    return { ok: false, error: "الباقات والأسعار تُعدَّل من أدمن جبر سيو" };
  }
  // route site config (whatsapp / GTM) to the SiteSettings table
  if (section === "siteSettings") return writeSiteSettings(path, value);

  if (!INLINE_KEYS.includes(section as InlineKey)) {
    return { ok: false, error: "قسم غير صالح" };
  }
  if (!Array.isArray(path) || path.length === 0) {
    return { ok: false, error: "مسار غير صالح" };
  }

  const current = await getLandingSectionOverride(section as InlineKey);
  const next = setAtPath(current ?? {}, path, value) as Prisma.InputJsonValue;

  await upsertLandingSection(section as InlineKey, next);

  revalidateTag("landing", "default");
  revalidateTag("landing-SA", "default");
  revalidateTag("landing-EG", "default");
  for (const p of ["/", "/sa", "/eg", "/about", "/privacy", "/terms", "/team", "/admin/review"]) {
    revalidatePath(p);
  }

  return { ok: true };
}

