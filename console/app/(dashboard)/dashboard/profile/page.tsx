import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ar } from "@/lib/ar";
import { ProfileForm } from "./components/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) return null;

  const [client, industries] = await Promise.all([
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
        targetAudience: true,
        organizationType: true,
        foundingDate: true,
        businessBrief: true,
        sameAs: true,
        canonicalUrl: true,
        technicalProfile: true,
        seoGoals: true,
        seoMetrics: true,
        linkBuildingPolicy: true,
        brandGuidelines: true,
        contentTone: true,
        complianceConstraints: true,
        googleBusinessProfileUrl: true,
        forbiddenKeywords: true,
        forbiddenClaims: true,
        competitiveMentionsAllowed: true,
      },
    }),
    db.industry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!client) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {ar.profile.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {ar.profile.description}
        </p>
      </div>
      <ProfileForm
        clientId={clientId}
        initial={{
          ...client,
          technicalProfile:
            client.technicalProfile != null &&
            typeof client.technicalProfile === "object" &&
            !Array.isArray(client.technicalProfile)
              ? (client.technicalProfile as Record<string, unknown>)
              : null,
          seoGoals:
            client.seoGoals != null &&
            typeof client.seoGoals === "object" &&
            !Array.isArray(client.seoGoals)
              ? (client.seoGoals as Record<string, unknown>)
              : null,
          seoMetrics:
            client.seoMetrics != null &&
            typeof client.seoMetrics === "object" &&
            !Array.isArray(client.seoMetrics)
              ? (client.seoMetrics as Record<string, unknown>)
              : null,
          brandGuidelines:
            client.brandGuidelines != null &&
            typeof client.brandGuidelines === "object" &&
            !Array.isArray(client.brandGuidelines)
              ? (client.brandGuidelines as Record<string, unknown>)
              : null,
          complianceConstraints:
            client.complianceConstraints != null &&
            typeof client.complianceConstraints === "object" &&
            !Array.isArray(client.complianceConstraints)
              ? (client.complianceConstraints as Record<string, unknown>)
              : null,
        }}
        industries={industries}
      />
    </div>
  );
}
