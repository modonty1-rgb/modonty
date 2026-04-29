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
        organizationType: true,
        foundingDate: true,
        sameAs: true,
        canonicalUrl: true,
      },
    }),
    db.industry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
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
      <ProfileForm
        clientId={clientId}
        initial={client}
        industries={industries}
      />
    </div>
  );
}
