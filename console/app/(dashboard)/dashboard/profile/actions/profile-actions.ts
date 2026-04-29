"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { messages } from "@/lib/messages";

function str(v: string | undefined | null) {
  return v === undefined ? undefined : (v?.trim() || null);
}
function arr(v: string[] | undefined) {
  return v === undefined ? undefined : v.filter(Boolean);
}
function dt(v: string | undefined | null) {
  if (v === undefined || !v?.trim()) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

type ProfileUpdate = {
  name?: string;
  legalName?: string | null;
  alternateName?: string | null;
  url?: string | null;
  slogan?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  contactType?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressCountry?: string | null;
  addressPostalCode?: string | null;
  addressRegion?: string | null;
  addressNeighborhood?: string | null;
  addressBuildingNumber?: string | null;
  addressAdditionalNumber?: string | null;
  commercialRegistrationNumber?: string | null;
  vatID?: string | null;
  taxID?: string | null;
  legalForm?: string | null;
  industryId?: string | null;
  targetAudience?: string | null;
  organizationType?: string | null;
  foundingDate?: string | null;
  businessBrief?: string | null;
  sameAs?: string[];
  canonicalUrl?: string | null;
  technicalProfile?: Record<string, unknown> | null;
  seoGoals?: Record<string, unknown> | null;
  seoMetrics?: Record<string, unknown> | null;
  linkBuildingPolicy?: string | null;
  brandGuidelines?: Record<string, unknown> | null;
  contentTone?: string | null;
  complianceConstraints?: Record<string, unknown> | null;
  googleBusinessProfileUrl?: string | null;
  forbiddenKeywords?: string[];
  forbiddenClaims?: string[];
  competitiveMentionsAllowed?: boolean | null;
};

export async function updateProfile(clientId: string, data: ProfileUpdate) {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });
    if (!client) return { success: false, error: messages.error.notFound };

    const u: Record<string, unknown> = {};
    if (data.name !== undefined && data.name.trim()) u.name = data.name.trim();
    if (data.legalName !== undefined) u.legalName = str(data.legalName);
    if (data.alternateName !== undefined) u.alternateName = str(data.alternateName);
    if (data.url !== undefined) u.url = str(data.url);
    if (data.slogan !== undefined) u.slogan = str(data.slogan);
    if (data.description !== undefined) u.description = str(data.description);
    if (data.email !== undefined && data.email !== null) u.email = data.email.trim();
    if (data.phone !== undefined) u.phone = str(data.phone);
    if (data.contactType !== undefined) u.contactType = str(data.contactType);
    if (data.addressStreet !== undefined) u.addressStreet = str(data.addressStreet);
    if (data.addressCity !== undefined) u.addressCity = str(data.addressCity);
    if (data.addressCountry !== undefined) u.addressCountry = str(data.addressCountry);
    if (data.addressPostalCode !== undefined) u.addressPostalCode = str(data.addressPostalCode);
    if (data.addressRegion !== undefined) u.addressRegion = str(data.addressRegion);
    if (data.addressNeighborhood !== undefined) u.addressNeighborhood = str(data.addressNeighborhood);
    if (data.addressBuildingNumber !== undefined) u.addressBuildingNumber = str(data.addressBuildingNumber);
    if (data.addressAdditionalNumber !== undefined) u.addressAdditionalNumber = str(data.addressAdditionalNumber);
    if (data.commercialRegistrationNumber !== undefined) u.commercialRegistrationNumber = str(data.commercialRegistrationNumber);
    if (data.vatID !== undefined) u.vatID = str(data.vatID);
    if (data.taxID !== undefined) u.taxID = str(data.taxID);
    if (data.legalForm !== undefined) u.legalForm = str(data.legalForm);
    if (data.industryId !== undefined) u.industryId = str(data.industryId) || null;
    if (data.targetAudience !== undefined) u.targetAudience = str(data.targetAudience);
    if (data.organizationType !== undefined) u.organizationType = str(data.organizationType);
    if (data.foundingDate !== undefined) u.foundingDate = dt(data.foundingDate) ?? null;
    if (data.businessBrief !== undefined) u.businessBrief = str(data.businessBrief);
    if (data.sameAs !== undefined) u.sameAs = arr(data.sameAs) ?? [];
    if (data.canonicalUrl !== undefined) u.canonicalUrl = str(data.canonicalUrl);

    if (data.technicalProfile !== undefined) u.technicalProfile = data.technicalProfile;
    if (data.seoGoals !== undefined) u.seoGoals = data.seoGoals;
    if (data.seoMetrics !== undefined) u.seoMetrics = data.seoMetrics;
    if (data.linkBuildingPolicy !== undefined) u.linkBuildingPolicy = str(data.linkBuildingPolicy);
    if (data.brandGuidelines !== undefined) u.brandGuidelines = data.brandGuidelines;
    if (data.contentTone !== undefined) u.contentTone = str(data.contentTone);
    if (data.complianceConstraints !== undefined) u.complianceConstraints = data.complianceConstraints;
    if (data.googleBusinessProfileUrl !== undefined) u.googleBusinessProfileUrl = str(data.googleBusinessProfileUrl);
    if (data.forbiddenKeywords !== undefined) u.forbiddenKeywords = arr(data.forbiddenKeywords) ?? [];
    if (data.forbiddenClaims !== undefined) u.forbiddenClaims = arr(data.forbiddenClaims) ?? [];
    if (data.competitiveMentionsAllowed !== undefined) u.competitiveMentionsAllowed = data.competitiveMentionsAllowed;

    // ─── Mirror to intake JSON (single-source-of-truth path) ─────────────────
    // Profile-form historically wrote only to legacy columns. Since Phase 3, the
    // unified `intake` JSON is the canonical home for all strategy data. Mirror
    // any strategy-field change into intake so both writers (profile-form here +
    // intake-v2) keep the JSON consistent. Phase 4 will retire the legacy columns.
    const touchesStrategy =
      data.contentTone !== undefined ||
      data.targetAudience !== undefined ||
      data.businessBrief !== undefined ||
      data.linkBuildingPolicy !== undefined ||
      data.forbiddenKeywords !== undefined ||
      data.forbiddenClaims !== undefined ||
      data.competitiveMentionsAllowed !== undefined ||
      data.brandGuidelines !== undefined ||
      data.seoGoals !== undefined ||
      data.complianceConstraints !== undefined ||
      data.technicalProfile !== undefined;

    if (touchesStrategy) {
      const current = await db.client.findUnique({
        where: { id: clientId },
        select: { intake: true },
      });
      const cur = (current?.intake as Record<string, unknown> | null) ?? {};
      const next: Record<string, unknown> = { ...cur, version: 1 };

      const merge = (key: string, patch: Record<string, unknown>) => {
        const existing = (next[key] as Record<string, unknown> | undefined) ?? {};
        next[key] = { ...existing, ...patch };
      };

      if (data.contentTone !== undefined) merge("voice", { tone: str(data.contentTone) });
      if (data.brandGuidelines !== undefined) {
        const bg = (data.brandGuidelines ?? {}) as Record<string, unknown>;
        if (typeof bg.tone === "string" || bg.tone === null) merge("voice", { tone: bg.tone ?? null });
        if (Array.isArray(bg.traits)) merge("voice", { traits: bg.traits as string[] });
      }
      if (data.targetAudience !== undefined) merge("audience", { description: str(data.targetAudience) });
      if (data.businessBrief !== undefined) merge("business", { brief: str(data.businessBrief) });
      if (data.linkBuildingPolicy !== undefined) merge("policy", { linkBuildingPolicy: str(data.linkBuildingPolicy) });
      if (data.forbiddenKeywords !== undefined) merge("policy", { forbiddenKeywords: arr(data.forbiddenKeywords) ?? [] });
      if (data.forbiddenClaims !== undefined) merge("policy", { forbiddenClaims: arr(data.forbiddenClaims) ?? [] });
      if (data.competitiveMentionsAllowed !== undefined) {
        merge("policy", { competitiveMentionsAllowed: data.competitiveMentionsAllowed });
      }
      if (data.complianceConstraints !== undefined) {
        const cc = (data.complianceConstraints ?? {}) as Record<string, unknown>;
        if (typeof cc.restrictedClaims === "string" || cc.restrictedClaims === null) {
          merge("policy", { restrictedClaims: cc.restrictedClaims ?? null });
        }
      }
      if (data.seoGoals !== undefined) {
        const sg = (data.seoGoals ?? {}) as Record<string, unknown>;
        merge("goals", {
          primary: typeof sg.primaryGoal === "string" ? sg.primaryGoal : null,
          kpis: typeof sg.kpis === "string" ? sg.kpis : null,
        });
      }
      if (data.technicalProfile !== undefined) {
        const tp = (data.technicalProfile ?? {}) as Record<string, unknown>;
        merge("technical", {
          platform: typeof tp.platform === "string" ? tp.platform : null,
          stagingUrl: typeof tp.stagingUrl === "string" ? tp.stagingUrl : null,
        });
      }

      next.updatedAt = new Date().toISOString();
      u.intake = next;
      u.intakeUpdatedAt = new Date();
    }

    await db.client.update({
      where: { id: clientId },
      data: u,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/seo");
    return { success: true };
  } catch (_e) {
    return { success: false, error: messages.error.serverError };
  }
}
