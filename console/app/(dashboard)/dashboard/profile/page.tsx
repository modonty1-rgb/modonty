import { ShieldCheck, AlertTriangle } from "lucide-react";
import { YmylCategory } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ar } from "@/lib/ar";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { ProfileForm } from "./components/profile-form";
import { SeoReadinessCard } from "./components/seo-readiness-card";
import { DisclaimerAcceptance } from "./components/disclaimer-acceptance";
import { ProfileCompletenessButton } from "./components/profile-completeness-button";
import { ProfileUrlBar } from "./components/profile-url-bar";
import { YmylSection } from "./components/ymyl-section";

export const dynamic = "force-dynamic";

// Fallback shown before an admin saves a custom disclaimer (provisional wording).
const DEFAULT_DISCLAIMER_TEXT =
  "كل ما أزوّد به مُدوّنتي — من بيانات وصور ووثائق وتراخيص وفيديوهات — صحيح وملكي وأملك حق نشره، وأنا المسؤول الوحيد عنه قانونياً. دور مُدوّنتي هو النشر فقط، وهي غير مسؤولة عن صحّته أو مصدره أو قانونيّته.";

// Profile completeness — the 26 fields the form groups into its sections, with
// Arabic labels + section titles so the header badge's dialog can show exactly
// which fields are still missing. Computed from saved data (refreshes on save).
// Keep in sync with the section key sets in profile-form.tsx.
const COMPLETENESS_SECTIONS: { title: string; fields: { key: string; label: string }[] }[] = [
  {
    title: ar.profile.basicInfo,
    fields: [
      { key: "name", label: ar.profile.name },
      { key: "legalName", label: ar.profile.legalName },
      { key: "alternateName", label: ar.profile.alternateName },
      { key: "foundingDate", label: ar.profile.foundingDate },
      { key: "slogan", label: ar.profile.slogan },
      { key: "description", label: ar.profile.organizationDescription },
      { key: "commercialRegistrationNumber", label: ar.profile.commercialRegistrationNumber },
      { key: "vatID", label: ar.profile.taxNumber },
    ],
  },
  {
    title: ar.profile.address,
    fields: [
      { key: "addressCity", label: ar.profile.addressCity },
      { key: "addressRegion", label: ar.profile.addressRegion },
      { key: "addressNeighborhood", label: ar.profile.addressNeighborhood },
      { key: "addressStreet", label: ar.profile.addressStreet },
      { key: "addressBuildingNumber", label: ar.profile.addressBuildingNumber },
      { key: "addressAdditionalNumber", label: ar.profile.addressAdditionalNumber },
      { key: "addressPostalCode", label: ar.profile.addressPostalCode },
    ],
  },
];

function isFieldFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value != null && String(value).trim().length > 0;
}

export default async function ProfilePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [client, industries, settings, countries] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        name: true,
        legalName: true,
        alternateName: true,
        url: true,
        slogan: true,
        description: true,
        email: true,
        phone: true,
        contactType: true,
        addressStreet: true,
        addressCity: true,
        addressCountry: true,
        addressPostalCode: true,
        addressRegion: true,
        addressNeighborhood: true,
        addressBuildingNumber: true,
        addressAdditionalNumber: true,
        commercialRegistrationNumber: true,
        vatID: true,
        taxID: true,
        legalForm: true,
        industryId: true,
        organizationType: true,
        foundingDate: true,
        sameAs: true,
        canonicalUrl: true,
        slug: true,
        openingHoursSpecification: true,
        // Local SEO + identity fields the SEO scorer reads
        logoMediaId: true,
        heroImageMediaId: true,
        addressLatitude: true,
        addressLongitude: true,
        priceRange: true,
        gbpPlaceId: true,
        businessActivityCode: true,
        numberOfEmployees: true,
        // Cached SEO + validation report (for the readiness card)
        nextjsMetadata: true,
        jsonLdStructuredData: true,
        jsonLdValidationReport: true,
        // Disclaimer acceptance state
        disclaimerAcceptedAt: true,
        disclaimerAcceptedVersion: true,
        // YMYL professional verification (rendered inline only when isYmyl)
        isYmyl: true,
        ymylCategory: true,
        ymylData: true,
      },
    }),
    db.industry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.settings.findUnique({
      where: SETTINGS_SINGLETON_WHERE,
      select: { disclaimerText: true, disclaimerVersion: true },
    }),
    db.country.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      select: { code: true, nameAr: true, nameEn: true },
    }),
  ]);
  if (!client) return null;

  // YMYL licensing authorities for this client's country + category (admin Reference Data).
  // Only fetched for YMYL clients; drives the verification section rendered below.
  const authorities =
    client.isYmyl && client.addressCountry && client.ymylCategory
      ? await db.licensingAuthority.findMany({
          where: {
            isActive: true,
            countryCode: client.addressCountry,
            category: client.ymylCategory as YmylCategory,
          },
          orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
          select: { code: true, nameAr: true },
        })
      : [];

  // Client's live page URL on modonty.com — canonicalUrl wins, else derive from slug.
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  const pageUrl =
    client.canonicalUrl || (client.slug ? `${SITE_URL}/clients/${client.slug}` : null);

  const clientRecord = client as Record<string, unknown>;
  // The national-address "additional number" is Saudi-only — don't count it for others.
  const isSaudiClient = client.addressCountry === "SA";
  const completenessSections = COMPLETENESS_SECTIONS.map((s) => ({
    title: s.title,
    fields: s.fields
      .filter((f) => f.key !== "addressAdditionalNumber" || isSaudiClient)
      .map((f) => ({
        key: f.key,
        label: f.label,
        filled: isFieldFilled(clientRecord[f.key]),
      })),
  }));
  const completenessTotal = completenessSections.reduce((n, s) => n + s.fields.length, 0);
  const completenessFilled = completenessSections.reduce(
    (n, s) => n + s.fields.filter((f) => f.filled).length,
    0
  );
  const completenessPct = completenessTotal
    ? Math.round((completenessFilled / completenessTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-foreground">
              {ar.profile.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {ar.profile.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {client.isYmyl && (
              <span
                className="relative inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive"
                title="مجال حسّاس (YMYL) — يتطلب توثيقاً مهنياً"
              >
                {/* pulsing dot — blinks on/off */}
                <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
                </span>
                YMYL
              </span>
            )}
            <ProfileCompletenessButton
              score={completenessPct}
              filled={completenessFilled}
              total={completenessTotal}
              sections={completenessSections}
            />
            <SeoReadinessCard client={client} />
            <DisclaimerAcceptance
              text={settings?.disclaimerText?.trim() || DEFAULT_DISCLAIMER_TEXT}
              currentVersion={settings?.disclaimerVersion ?? 1}
              acceptedVersion={client.disclaimerAcceptedVersion ?? null}
              acceptedAt={client.disclaimerAcceptedAt ?? null}
            />
          </div>
        </div>
        <ProfileUrlBar url={pageUrl} />
      </header>

      {/* Professional verification — only for YMYL clients (gate before publishing). */}
      {client.isYmyl && (
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-900">
                  هذا التوثيق مطلوب قبل نشر مقالاتك الطبية / القانونية / المالية
                </h2>
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              </div>
              <p className="text-sm leading-relaxed text-amber-800">
                مجالك يتطلب إثبات مصداقيتك المهنية لمحركات البحث قبل أن ننشر محتواك. أكمل
                الحقول بالأسفل الآن — كلما كانت بياناتك أوضح، زادت ثقة محركات البحث في
                مقالاتك وارتفع ترتيبها.
              </p>
            </div>
          </div>
          <YmylSection
            isYmyl={client.isYmyl}
            ymylCategory={client.ymylCategory}
            ymylData={(client.ymylData ?? null) as Record<string, unknown> | null}
            country={client.addressCountry}
            authorities={authorities}
          />
        </div>
      )}

      <ProfileForm
        clientId={clientId}
        initial={client}
        industries={industries}
        countries={countries}
      />
    </div>
  );
}
