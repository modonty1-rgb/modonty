"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "../actions/profile-actions";

type ProfileInitial = {
  name: string;
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
  foundingDate?: Date | string | null;
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

type Industry = { id: string; name: string };

interface ProfileFormProps {
  clientId: string;
  initial: ProfileInitial;
  industries: Industry[];
}

function toDateStr(d: Date | string | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  return isNaN(x.getTime()) ? "" : x.toISOString().slice(0, 10);
}

export function ProfileForm({ clientId, initial, industries }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: initial.name ?? "",
    legalName: initial.legalName ?? "",
    alternateName: initial.alternateName ?? "",
    url: initial.url ?? "",
    slogan: initial.slogan ?? "",
    description: initial.description ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    contactType: initial.contactType ?? "",
    addressStreet: initial.addressStreet ?? "",
    addressCity: initial.addressCity ?? "",
    addressCountry: initial.addressCountry ?? "",
    addressPostalCode: initial.addressPostalCode ?? "",
    addressRegion: initial.addressRegion ?? "",
    addressNeighborhood: initial.addressNeighborhood ?? "",
    addressBuildingNumber: initial.addressBuildingNumber ?? "",
    addressAdditionalNumber: initial.addressAdditionalNumber ?? "",
    commercialRegistrationNumber: initial.commercialRegistrationNumber ?? "",
    vatID: initial.vatID ?? "",
    taxID: initial.taxID ?? "",
    legalForm: initial.legalForm ?? "",
    industryId: initial.industryId ?? "",
    targetAudience: initial.targetAudience ?? "",
    organizationType: initial.organizationType ?? "",
    foundingDate: toDateStr(initial.foundingDate),
    businessBrief: initial.businessBrief ?? "",
    sameAs: (initial.sameAs ?? []).join("\n"),
    canonicalUrl: initial.canonicalUrl ?? "",
    linkBuildingPolicy: (initial.linkBuildingPolicy ?? "") as string,
    contentTone: initial.contentTone ?? "",
    googleBusinessProfileUrl: (initial.googleBusinessProfileUrl ?? "") as string,
    forbiddenKeywords: (initial.forbiddenKeywords ?? []).join("\n"),
    forbiddenClaims: (initial.forbiddenClaims ?? []).join("\n"),
    competitiveMentionsAllowed: initial.competitiveMentionsAllowed ?? false,
    technicalPlatform: (initial.technicalProfile as { platform?: string } | null)?.platform ?? "",
    technicalStagingUrl: (initial.technicalProfile as { stagingUrl?: string } | null)?.stagingUrl ?? "",
    seoPrimaryGoal: (initial.seoGoals as { primaryGoal?: string } | null)?.primaryGoal ?? "",
    seoKpis: (initial.seoGoals as { kpis?: string } | null)?.kpis ?? "",
    seoDomainAuthority: String((initial.seoMetrics as { domainAuthority?: number } | null)?.domainAuthority ?? ""),
    seoBacklinkCount: String((initial.seoMetrics as { backlinkCount?: number } | null)?.backlinkCount ?? ""),
    complianceIndustry: (initial.complianceConstraints as { industry?: string } | null)?.industry ?? "",
    complianceRestrictedClaims: (initial.complianceConstraints as { restrictedClaims?: string } | null)?.restrictedClaims ?? "",
  });

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await updateProfile(clientId, {
        name: form.name.trim(),
        legalName: form.legalName || null,
        alternateName: form.alternateName || null,
        url: form.url || null,
        slogan: form.slogan || null,
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        contactType: form.contactType || null,
        addressStreet: form.addressStreet || null,
        addressCity: form.addressCity || null,
        addressCountry: form.addressCountry || null,
        addressPostalCode: form.addressPostalCode || null,
        addressRegion: form.addressRegion || null,
        addressNeighborhood: form.addressNeighborhood || null,
        addressBuildingNumber: form.addressBuildingNumber || null,
        addressAdditionalNumber: form.addressAdditionalNumber || null,
        commercialRegistrationNumber: form.commercialRegistrationNumber || null,
        vatID: form.vatID || null,
        taxID: form.taxID || null,
        legalForm: form.legalForm || null,
        industryId: form.industryId || null,
        targetAudience: form.targetAudience || null,
        organizationType: form.organizationType || null,
        foundingDate: form.foundingDate || null,
        businessBrief: form.businessBrief || null,
        sameAs: form.sameAs
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        canonicalUrl: form.canonicalUrl || null,
        technicalProfile:
          form.technicalPlatform || form.technicalStagingUrl
            ? { platform: form.technicalPlatform || undefined, stagingUrl: form.technicalStagingUrl || undefined }
            : null,
        seoGoals:
          form.seoPrimaryGoal || form.seoKpis
            ? { primaryGoal: form.seoPrimaryGoal || undefined, kpis: form.seoKpis || undefined }
            : null,
        seoMetrics:
          form.seoDomainAuthority || form.seoBacklinkCount
            ? {
                domainAuthority: form.seoDomainAuthority ? Number(form.seoDomainAuthority) : undefined,
                backlinkCount: form.seoBacklinkCount ? Number(form.seoBacklinkCount) : undefined,
              }
            : null,
        linkBuildingPolicy: form.linkBuildingPolicy || null,
        brandGuidelines: form.contentTone ? { tone: form.contentTone } : null,
        contentTone: form.contentTone || null,
        complianceConstraints:
          form.complianceIndustry || form.complianceRestrictedClaims
            ? {
                industry: form.complianceIndustry || undefined,
                restrictedClaims: form.complianceRestrictedClaims || undefined,
              }
            : null,
        googleBusinessProfileUrl: form.googleBusinessProfileUrl || null,
        forbiddenKeywords: form.forbiddenKeywords
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        forbiddenClaims: form.forbiddenClaims
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean),
        competitiveMentionsAllowed: form.competitiveMentionsAllowed,
      });
      if (res.success) router.refresh();
      else setError(res.error ?? ar.settings.updateFailed);
    } catch {
      setError(ar.settings.somethingWrong);
    } finally {
      setLoading(false);
    }
  }

  const field = (k: keyof typeof form, label: string, opts?: { type?: string; placeholder?: string }) => (
    <div key={String(k)} className="space-y-2">
      <Label htmlFor={String(k)}>{label}</Label>
      <Input
        id={String(k)}
        type={opts?.type ?? "text"}
        value={typeof form[k] === "string" || typeof form[k] === "number" ? form[k] : ""}
        onChange={(e) => update(k, e.target.value)}
        placeholder={opts?.placeholder}
        disabled={loading}
      />
    </div>
  );

  const select = (k: "industryId", label: string) => (
    <div key={String(k)} className="space-y-2">
      <Label htmlFor={String(k)}>{label}</Label>
      <select
        id={String(k)}
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        disabled={loading}
        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">—</option>
        {industries.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
    </div>
  );

  const textarea = (
    k:
      | "description"
      | "businessBrief"
      | "targetAudience"
      | "sameAs"
      | "seoKpis"
      | "linkBuildingPolicy"
      | "complianceRestrictedClaims"
      | "forbiddenKeywords"
      | "forbiddenClaims",
    label: string,
    hint?: string
  ) => (
    <div key={String(k)} className="space-y-2">
      <Label htmlFor={String(k)}>{label}</Label>
      <Textarea
        id={String(k)}
        value={form[k]}
        onChange={(e) => update(k, e.target.value)}
        disabled={loading}
        rows={k === "sameAs" ? 3 : 3}
        placeholder={hint}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.basicInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("name", ar.profile.name)}
          {field("legalName", ar.profile.legalName)}
          {field("alternateName", ar.profile.alternateName)}
          {field("url", ar.profile.url, { type: "url", placeholder: "https://" })}
          {field("slogan", ar.profile.slogan)}
          {textarea("description", ar.profile.organizationDescription)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.contactInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("email", ar.settings.email, { type: "email", placeholder: ar.settings.placeholderEmail })}
          {field("phone", ar.settings.phone, { placeholder: ar.settings.placeholderPhone })}
          {field("contactType", ar.profile.contactType)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.address}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("addressStreet", ar.profile.addressStreet)}
          {field("addressCity", ar.profile.addressCity)}
          {field("addressCountry", ar.profile.addressCountry)}
          {field("addressPostalCode", ar.profile.addressPostalCode)}
          {field("addressRegion", ar.profile.addressRegion)}
          {field("addressNeighborhood", ar.profile.addressNeighborhood)}
          {field("addressBuildingNumber", ar.profile.addressBuildingNumber)}
          {field("addressAdditionalNumber", ar.profile.addressAdditionalNumber)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.saudiGulf}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {field("commercialRegistrationNumber", ar.profile.commercialRegistrationNumber)}
          {field("vatID", ar.profile.vatID)}
          {field("taxID", ar.profile.taxID)}
          {field("legalForm", ar.profile.legalForm)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.business}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {select("industryId", ar.profile.industry)}
          {field("organizationType", ar.profile.organizationType)}
          {field("foundingDate", ar.profile.foundingDate, { type: "date" })}
          {textarea("targetAudience", ar.profile.targetAudience)}
          {textarea("businessBrief", ar.profile.businessBrief)}
          {textarea("sameAs", ar.profile.socialProfiles, ar.profile.socialProfilesHint)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.canonicalUrl}</CardTitle>
        </CardHeader>
        <CardContent>
          {field("canonicalUrl", ar.profile.canonicalUrl, { type: "url" })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ar.profile.seoSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("technicalPlatform", ar.profile.platform, { placeholder: "WordPress, Next.js..." })}
            {field("technicalStagingUrl", ar.profile.stagingUrl, { type: "url", placeholder: "https://staging..." })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("seoPrimaryGoal", ar.profile.primaryGoal)}
            {textarea("seoKpis", ar.profile.kpis)}
          </div>
          <p className="text-xs text-muted-foreground">{ar.profile.goalsDisclaimer}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("seoDomainAuthority", ar.profile.domainAuthority, { type: "number", placeholder: "0-100" })}
            {field("seoBacklinkCount", ar.profile.backlinkCount, { type: "number" })}
          </div>
          {textarea("linkBuildingPolicy", ar.profile.linkBuildingPolicy)}
          {field("contentTone", ar.profile.contentTone, { placeholder: "رسمي، ودّي، تقني..." })}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field("complianceIndustry", ar.profile.complianceIndustry, { placeholder: "قطاع الصناعة" })}
            {textarea("complianceRestrictedClaims", ar.profile.restrictedClaims)}
          </div>
          {field("googleBusinessProfileUrl", ar.profile.googleBusinessProfileUrl, { type: "url", placeholder: "https://..." })}
          {textarea("forbiddenKeywords", ar.profile.forbiddenKeywords, "كلمة في كل سطر")}
          {textarea("forbiddenClaims", ar.profile.forbiddenClaims, "ادعاء في كل سطر")}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="competitiveMentionsAllowed"
              checked={form.competitiveMentionsAllowed}
              onChange={(e) => setForm((p) => ({ ...p, competitiveMentionsAllowed: e.target.checked }))}
              disabled={loading}
            />
            <Label htmlFor="competitiveMentionsAllowed">{ar.profile.competitiveMentionsAllowed}</Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? ar.settings.saving : ar.settings.save}
      </Button>
    </form>
  );
}
