"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { YmylCategory, ClientCtaMode } from "@prisma/client";

import { normalizeArabicLabel } from "../lib/normalize-arabic-label";

const PATH = "/settings/reference-data";

/** A preset can only carry a real behaviour — «no button» is not something you pick. */
export type CtaPresetMode = Extract<ClientCtaMode, "FORM" | "LINK">;

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

export interface CtaPresetDTO {
  id: string;
  labelAr: string;
  mode: CtaPresetMode;
  defaultUrl: string | null;
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

/**
 * Where a LINK button may send a visitor. Kept deliberately narrow: anything else
 * either does nothing in a browser or is a typo that would silently ship a dead
 * button onto a paying client's page.
 */
const DESTINATION = /^(https?:\/\/|tel:|mailto:)/i;

const ctaPresetSchema = z
  .object({
    id: z.string().optional(),
    labelAr: z.string().trim().min(1).max(40),
    mode: z.enum(["FORM", "LINK"]),
    defaultUrl: z.string().trim().max(500).optional().nullable(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().optional(),
  })
  // A booking form is internal — a destination on it would never be read, so it is
  // dropped rather than stored as a lie. A LINK with a bad destination is rejected.
  .transform((v) => (v.mode === "FORM" ? { ...v, defaultUrl: null } : v))
  .refine((v) => !v.defaultUrl || DESTINATION.test(v.defaultUrl), {
    message: "Destination must start with https:// , tel: or mailto:",
    path: ["defaultUrl"],
  });

export type CountryInput = z.input<typeof countrySchema>;
export type AuthorityInput = z.input<typeof authoritySchema>;
export type CtaPresetInput = z.input<typeof ctaPresetSchema>;

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

const CTA_PRESET_SELECT = {
  id: true,
  labelAr: true,
  mode: true,
  defaultUrl: true,
  isActive: true,
  sortOrder: true,
} as const;

/** A NONE row can only exist if someone wrote it by hand — never trust it into the UI. */
function toCtaPresetDTO(r: {
  id: string;
  labelAr: string;
  mode: ClientCtaMode;
  defaultUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}): CtaPresetDTO {
  return { ...r, mode: r.mode === "LINK" ? "LINK" : "FORM" };
}

// ── Read ────────────────────────────────────────────────────────────────────
export async function getReferenceData(): Promise<{
  countries: CountryDTO[];
  authorities: AuthorityDTO[];
  ctaPresets: CtaPresetDTO[];
}> {
  const [countries, authorities, ctaPresets] = await Promise.all([
    db.country.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      select: COUNTRY_SELECT,
    }),
    db.licensingAuthority.findMany({
      orderBy: [{ category: "asc" }, { countryCode: "asc" }, { sortOrder: "asc" }, { code: "asc" }],
      select: AUTHORITY_SELECT,
    }),
    db.ctaPreset.findMany({
      orderBy: [{ sortOrder: "asc" }, { labelAr: "asc" }],
      select: CTA_PRESET_SELECT,
    }),
  ]);
  return { countries, authorities, ctaPresets: ctaPresets.map(toCtaPresetDTO) };
}

/** Active presets only, for the CTA picker on the client form. */
export async function getActiveCtaPresets(): Promise<CtaPresetDTO[]> {
  const rows = await db.ctaPreset.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { labelAr: "asc" }],
    select: CTA_PRESET_SELECT,
  });
  return rows.map(toCtaPresetDTO);
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

// ── CTA presets ──────────────────────────────────────────────────────────────
export async function saveCtaPreset(
  input: CtaPresetInput,
): Promise<{ success: boolean; error?: string; preset?: CtaPresetDTO }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = ctaPresetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the fields." };
  }

  const { id, ...data } = parsed.data;
  const labelKey = normalizeArabicLabel(data.labelAr);

  // Enforced here as well as by the index: the index only exists once the schema is
  // pushed, and a duplicate must never depend on a constraint that may not be in place
  // on this database yet. The clashing label is read back so the message can NAME it —
  // being told «تسوّق الآن» already exists is the only way to understand why «تسوق الآن»
  // was refused when the two look the same on screen.
  const clash = await db.ctaPreset.findFirst({
    where: { labelKey, ...(id ? { NOT: { id } } : {}) },
    select: { labelAr: true },
  });
  if (clash) {
    return { success: false, error: `A button with this text already exists: «${clash.labelAr}»` };
  }

  try {
    const preset = id
      ? await db.ctaPreset.update({ where: { id }, data: { ...data, labelKey }, select: CTA_PRESET_SELECT })
      : await db.ctaPreset.create({ data: { ...data, labelKey }, select: CTA_PRESET_SELECT });
    revalidatePath(PATH);
    return { success: true, preset: toCtaPresetDTO(preset) };
  } catch {
    return { success: false, error: "Could not save the button." };
  }
}

export async function deleteCtaPreset(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.ctaPreset.delete({ where: { id } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete the button." };
  }
}

export async function setCtaPresetActive(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    await db.ctaPreset.update({ where: { id }, data: { isActive } });
    revalidatePath(PATH);
    return { success: true };
  } catch {
    return { success: false, error: "Could not update the button." };
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

/**
 * The buttons every client library starts with. FORM is the only internal one —
 * everything else is a LINK whose destination the admin fills per client, which is
 * why the WhatsApp and phone entries ship without a default: a shared number would
 * quietly send one client's visitors to another client.
 */
const DEFAULT_CTA_PRESETS: Omit<CtaPresetDTO, "id">[] = [
  { labelAr: "احجز الآن", mode: "FORM", defaultUrl: null, isActive: true, sortOrder: 1 },
  { labelAr: "تسوّق الآن", mode: "LINK", defaultUrl: null, isActive: true, sortOrder: 2 },
  { labelAr: "راسلنا واتساب", mode: "LINK", defaultUrl: null, isActive: true, sortOrder: 3 },
  { labelAr: "اتصل الآن", mode: "LINK", defaultUrl: null, isActive: true, sortOrder: 4 },
  { labelAr: "تصفّح", mode: "LINK", defaultUrl: null, isActive: true, sortOrder: 5 },
];

/** Insert the standard countries + authorities + CTA buttons. Skips rows that already
 *  exist (idempotent), so it's safe to click more than once. Admin-triggered only. */
export async function seedReferenceDefaults(): Promise<{ success: boolean; error?: string; added?: number }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  try {
    const [existingCountries, existingAuthorities, existingPresets] = await Promise.all([
      db.country.findMany({ select: { code: true } }),
      db.licensingAuthority.findMany({ select: { countryCode: true, category: true, code: true } }),
      db.ctaPreset.findMany({ select: { labelKey: true } }),
    ]);
    const haveCountry = new Set(existingCountries.map((c) => c.code));
    const haveAuthority = new Set(
      existingAuthorities.map((a) => `${a.countryCode}|${a.category}|${a.code}`),
    );
    const havePreset = new Set(existingPresets.map((p) => p.labelKey));

    const countriesToAdd = DEFAULT_COUNTRIES.filter((c) => !haveCountry.has(c.code));
    const authoritiesToAdd = DEFAULT_AUTHORITIES.filter(
      (a) => !haveAuthority.has(`${a.countryCode}|${a.category}|${a.code}`),
    );
    const presetsToAdd = DEFAULT_CTA_PRESETS.map((p) => ({
      ...p,
      labelKey: normalizeArabicLabel(p.labelAr),
    })).filter((p) => !havePreset.has(p.labelKey));

    if (countriesToAdd.length) await db.country.createMany({ data: countriesToAdd });
    if (authoritiesToAdd.length) await db.licensingAuthority.createMany({ data: authoritiesToAdd });
    if (presetsToAdd.length) await db.ctaPreset.createMany({ data: presetsToAdd });

    revalidatePath(PATH);
    return {
      success: true,
      added: countriesToAdd.length + authoritiesToAdd.length + presetsToAdd.length,
    };
  } catch {
    return { success: false, error: "Could not load the default data." };
  }
}
