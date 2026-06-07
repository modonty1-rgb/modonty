import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ar } from "@/lib/ar";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { ProfileForm } from "./components/profile-form";
import { SeoReadinessCard } from "./components/seo-readiness-card";
import { DisclaimerAcceptance } from "./components/disclaimer-acceptance";

export const dynamic = "force-dynamic";

// Fallback shown before an admin saves a custom disclaimer (provisional wording).
const DEFAULT_DISCLAIMER_TEXT =
  "كل ما أزوّد به مُدوّنتي — من بيانات وصور ووثائق وتراخيص وفيديوهات — صحيح وملكي وأملك حق نشره، وأنا المسؤول الوحيد عنه قانونياً. دور مُدوّنتي هو النشر فقط، وهي غير مسؤولة عن صحّته أو مصدره أو قانونيّته.";

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.profile.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.profile.description}
        </p>
      </header>
      <DisclaimerAcceptance
        text={settings?.disclaimerText?.trim() || DEFAULT_DISCLAIMER_TEXT}
        currentVersion={settings?.disclaimerVersion ?? 1}
        acceptedVersion={client.disclaimerAcceptedVersion ?? null}
        acceptedAt={client.disclaimerAcceptedAt ?? null}
      />
      <SeoReadinessCard client={client} />
      <ProfileForm
        clientId={clientId}
        initial={client}
        industries={industries}
        countries={countries}
      />
    </div>
  );
}
