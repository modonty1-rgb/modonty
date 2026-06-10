"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { YmylCategory } from "@prisma/client";

const PATH = "/settings/reference-data";

// ── DTOs (serializable shapes returned to the client) ───────────────────────
export interface CountryDTO {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AuthorityDTO {
  id: string;
  countryCode: string;
  category: YmylCategory;
  code: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  sortOrder: number;
}

// ── Validation ──────────────────────────────────────────────────────────────
const codeUpper = z
  .string()
  .trim()
  .min(2)
  .max(2)
  .transform((s) => s.toUpperCase());

const countrySchema = z.object({
  id: z.string().optional(),
  code: codeUpper,
  nameAr: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

const authoritySchema = z.object({
  id: z.string().optional(),
  countryCode: codeUpper,
  category: z.nativeEnum(YmylCategory),
  code: z.string().trim().min(1),
  nameAr: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().optional(),
});

export type CountryInput = z.input<typeof countrySchema>;
export type AuthorityInput = z.input<typeof authoritySchema>;

const COUNTRY_SELECT = {
  id: true,
  code: true,
  nameAr: true,
  nameEn: true,
  isActive: true,
  sortOrder: true,
} as const;

const AUTHORITY_SELECT = {
  id: true,
  countryCode: true,
  category: true,
  code: true,
  nameAr: true,
  nameEn: true,
  isActive: true,
  sortOrder: true,
} as const;

// ── Read ────────────────────────────────────────────────────────────────────
export async function getReferenceData(): Promise<{
  countries: CountryDTO[];
  authorities: AuthorityDTO[];
}> {
  const [countries, authorities] = await Promise.all([
    db.country.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      select: COUNTRY_SELECT,
    }),
    db.licensingAuthority.findMany({
      orderBy: [{ category: "asc" }, { countryCode: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
      select: AUTHORITY_SELECT,
    }),
  ]);
  return { countries, authorities };
}

/** Active countries only, for the client country picker (create/edit forms). */
export async function getActiveCountries(): Promise<CountryDTO[]> {
  return db.country.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    select: COUNTRY_SELECT,
  });
}

// ── Countries ────────────────────────────────────────────────────────────────
export async function saveCountry(
  input: CountryInput,
): Promise<{ success: boolean; error?: string; country?: CountryDTO }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = countrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please fill country code (2 letters) and both names." };

  const { id, ...data } = parsed.data;
  try {
    const country = id
      ? await db.country.update({ where: { id }, data, select: COUNTRY_SELECT })
      : await db.country.create({ data, select: COUNTRY_SELECT });
    revalidatePath(PATH);
    return { success: true, country };
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique")
        ? `A country with code "${data.code}" already exists.`
        : "Could not save the country.";
    return { success: false, error: msg };
  }
}

export async function deleteCountry(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.country.delete({ where: { id } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete the country." };
  }
}

export async function setCountryActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.country.update({ where: { id }, data: { isActive } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the country." };
  }
}

// ── Licensing authorities ────────────────────────────────────────────────────
export async function saveAuthority(
  input: AuthorityInput,
): Promise<{ success: boolean; error?: string; authority?: AuthorityDTO }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = authoritySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please fill country, category, code and both names." };

  const { id, ...data } = parsed.data;
  try {
    const authority = id
      ? await db.licensingAuthority.update({ where: { id }, data, select: AUTHORITY_SELECT })
      : await db.licensingAuthority.create({ data, select: AUTHORITY_SELECT });
    revalidatePath(PATH);
    return { success: true, authority };
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique")
        ? `"${data.code}" already exists for this country + category.`
        : "Could not save the authority.";
    return { success: false, error: msg };
  }
}

export async function deleteAuthority(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.licensingAuthority.delete({ where: { id } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete the authority." };
  }
}

export async function setAuthorityActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.licensingAuthority.update({ where: { id }, data: { isActive } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the authority." };
  }
}

// ── One-time defaults (seed via admin UI — no standalone scripts) ────────────
const DEFAULT_COUNTRIES: Omit<CountryDTO, "id">[] = [
  { code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", isActive: true, sortOrder: 1 },
  { code: "EG", nameAr: "مصر", nameEn: "Egypt", isActive: true, sortOrder: 2 },
  { code: "AE", nameAr: "الإمارات", nameEn: "United Arab Emirates", isActive: true, sortOrder: 3 },
];

const DEFAULT_AUTHORITIES: Omit<AuthorityDTO, "id">[] = [
  { countryCode: "SA", category: "medical", code: "MOH", nameAr: "وزارة الصحة", nameEn: "Ministry of Health", isActive: true, sortOrder: 1 },
  { countryCode: "SA", category: "medical", code: "SCFHS", nameAr: "الهيئة السعودية للتخصصات الصحية", nameEn: "Saudi Commission for Health Specialties", isActive: true, sortOrder: 2 },
  { countryCode: "SA", category: "medical", code: "SFDA", nameAr: "الهيئة العامة للغذاء والدواء", nameEn: "Saudi Food & Drug Authority", isActive: true, sortOrder: 3 },
  { countryCode: "EG", category: "medical", code: "MOHP", nameAr: "وزارة الصحة والسكان", nameEn: "Ministry of Health and Population", isActive: true, sortOrder: 1 },
  { countryCode: "EG", category: "medical", code: "EMS", nameAr: "نقابة الأطباء المصرية", nameEn: "Egyptian Medical Syndicate", isActive: true, sortOrder: 2 },
  { countryCode: "AE", category: "medical", code: "DHA", nameAr: "هيئة الصحة بدبي", nameEn: "Dubai Health Authority", isActive: true, sortOrder: 1 },
  { countryCode: "AE", category: "medical", code: "DoH", nameAr: "دائرة الصحة - أبوظبي", nameEn: "Department of Health – Abu Dhabi", isActive: true, sortOrder: 2 },
  { countryCode: "AE", category: "medical", code: "MoHAP", nameAr: "وزارة الصحة ووقاية المجتمع", nameEn: "Ministry of Health and Prevention", isActive: true, sortOrder: 3 },
  { countryCode: "SA", category: "legal", code: "SBA", nameAr: "الهيئة السعودية للمحامين", nameEn: "Saudi Bar Association", isActive: true, sortOrder: 1 },
  { countryCode: "SA", category: "legal", code: "MOJ", nameAr: "وزارة العدل", nameEn: "Ministry of Justice", isActive: true, sortOrder: 2 },
  { countryCode: "EG", category: "legal", code: "EBA", nameAr: "نقابة المحامين المصرية", nameEn: "Egyptian Bar Association", isActive: true, sortOrder: 1 },
  { countryCode: "AE", category: "legal", code: "MOJ-AE", nameAr: "وزارة العدل الإماراتية", nameEn: "UAE Ministry of Justice", isActive: true, sortOrder: 1 },
  { countryCode: "SA", category: "financial", code: "CMA", nameAr: "هيئة السوق المالية", nameEn: "Capital Market Authority", isActive: true, sortOrder: 1 },
  { countryCode: "SA", category: "financial", code: "SAMA", nameAr: "البنك المركزي السعودي", nameEn: "Saudi Central Bank", isActive: true, sortOrder: 2 },
  { countryCode: "SA", category: "financial", code: "ZATCA", nameAr: "هيئة الزكاة والضريبة والجمارك", nameEn: "Zakat, Tax and Customs Authority", isActive: true, sortOrder: 3 },
  { countryCode: "EG", category: "financial", code: "FRA", nameAr: "الهيئة العامة للرقابة المالية", nameEn: "Financial Regulatory Authority", isActive: true, sortOrder: 1 },
  { countryCode: "EG", category: "financial", code: "CBE", nameAr: "البنك المركزي المصري", nameEn: "Central Bank of Egypt", isActive: true, sortOrder: 2 },
  { countryCode: "AE", category: "financial", code: "SCA", nameAr: "هيئة الأوراق المالية والسلع", nameEn: "Securities and Commodities Authority", isActive: true, sortOrder: 1 },
  { countryCode: "AE", category: "financial", code: "CBUAE", nameAr: "مصرف الإمارات المركزي", nameEn: "Central Bank of the UAE", isActive: true, sortOrder: 2 },
];

/** Insert the standard countries + authorities. Skips rows that already exist
 *  (idempotent), so it's safe to click more than once. Admin-triggered only. */
export async function seedReferenceDefaults(): Promise<{ success: boolean; error?: string; added?: number }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    const [existingCountries, existingAuthorities] = await Promise.all([
      db.country.findMany({ select: { code: true } }),
      db.licensingAuthority.findMany({ select: { countryCode: true, category: true, code: true } }),
    ]);
    const haveCountry = new Set(existingCountries.map((c) => c.code));
    const haveAuthority = new Set(
      existingAuthorities.map((a) => `${a.countryCode}|${a.category}|${a.code}`),
    );

    const countriesToAdd = DEFAULT_COUNTRIES.filter((c) => !haveCountry.has(c.code));
    const authoritiesToAdd = DEFAULT_AUTHORITIES.filter(
      (a) => !haveAuthority.has(`${a.countryCode}|${a.category}|${a.code}`),
    );

    if (countriesToAdd.length) await db.country.createMany({ data: countriesToAdd });
    if (authoritiesToAdd.length) await db.licensingAuthority.createMany({ data: authoritiesToAdd });

    revalidatePath(PATH);
    return { success: true, added: countriesToAdd.length + authoritiesToAdd.length };
  } catch {
    return { success: false, error: "Could not load the default data." };
  }
}
