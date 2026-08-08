// منسوخ من jbrseo.com/lib/landing-sections.ts — إدارة محتوى موقع جبر سيو من أدمن مودونتي.
// يحرّر نفس صفوف القاعدة التي يحرّرها أدمن جبر سيو (قاعدة واحدة، نماذج مرآة).
// ⚠️ مرآة: أي تغيير في شكل الحقول يُطبَّق هنا وفي jbrseo.com معاً.

import "server-only";

import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const SECTION_KEYS = [
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
  "seo",
  "ctaLabel",
  "pricingTeaser",
  "socialLinks",
  "featuresComparison",
] as const;

export type LandingSectionKey = (typeof SECTION_KEYS)[number];

const SETTINGS_ONLY_KEYS = ["seo", "ctaLabel", "pricingTeaser", "socialLinks"] as const;
export type StaticSectionKey = Exclude<LandingSectionKey, (typeof SETTINGS_ONLY_KEYS)[number]>;
export const STATIC_ONLY_KEYS: readonly StaticSectionKey[] = SECTION_KEYS.filter(
  (k): k is StaticSectionKey => !SETTINGS_ONLY_KEYS.includes(k as (typeof SETTINGS_ONLY_KEYS)[number]),
);

let landingDbUnavailableLogged = false;

export async function getLandingSectionOverride(
  section: LandingSectionKey,
): Promise<unknown | null> {
  try {
    const row = await db.jbrLandingSection.findUnique({
      where: { section },
    });
    return row ? (row.data as unknown) : null;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    if (!landingDbUnavailableLogged) {
      landingDbUnavailableLogged = true;
      console.error(
        "[landing-sections] Database unreachable — check MongoDB Atlas connection string and network access list.",
        error,
      );
    }
    return null;
  }
}

export async function upsertLandingSection<T extends Prisma.InputJsonValue>(
  section: LandingSectionKey,
  data: T,
): Promise<void> {
  // كلاوديناري أُسقط — بني هو مورّد الوسائط الوحيد في مودونتي، والدالّة
  // الأصلية كانت تمرّر أي نصّ غير-كلاوديناري كما هو، فحذفها بلا أثر.
  const optimized = data as T;
  await db.jbrLandingSection.upsert({
    where: { section },
    create: { section, data: optimized },
    update: { data: optimized },
  });
}

export { SECTION_KEYS };
