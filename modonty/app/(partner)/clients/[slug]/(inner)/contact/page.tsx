import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPartnerSite } from "../../helpers/get-partner-site";
import { getClientPageData } from "../../helpers/client-page-data";
import { PageFrame } from "../../components/page-frame";
import { ContactBlock } from "../../components/home/contact-block";
import { BookingCard, BookingCardSkeleton } from "../../components/home/booking-card";
import { ClientContactSection } from "../../components/sections/client-contact-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPartnerSite(decodeURIComponent(slug));
  if (!site) return { title: "غير موجود" };
  return {
    title: `تواصل مع ${site.name}`.slice(0, 51),
    description: `عنوان ${site.name}${site.addressCity ? ` في ${site.addressCity}` : ""}، ساعات العمل، الهاتف والواتساب — واطلب اتصالاً.`,
  };
}

/** «تواصل» — address · hours · phone · map (when he has coordinates) · the request card. */
export default async function ClientContactPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [site, data] = await Promise.all([getPartnerSite(decodedSlug), getClientPageData(slug)]);
  if (!site || !data) notFound();
  const { client } = data;
  const addressLine = [client.addressNeighborhood, client.addressCity].filter(Boolean).join(" · ") || null;

  return (
    <PageFrame siteName={site.name} base={`/clients/${encodeURIComponent(site.slug)}`} eyebrow="تواصل" title={`تواصل مع ${site.name}`}>
      <div className="space-y-12">
        <div className="[&>section]:px-0">
          <ContactBlock site={site} />
        </div>
        {client.addressLatitude != null && client.addressLongitude != null ? (
          <ClientContactSection
            lat={client.addressLatitude}
            lng={client.addressLongitude}
            gbpProfileUrl={client.gbpProfileUrl ?? null}
            gbpPlaceId={client.gbpPlaceId ?? null}
            clientName={client.name}
            addressLine={addressLine}
          />
        ) : null}
        <div className="max-w-md">
          <Suspense fallback={<BookingCardSkeleton />}>
            <BookingCard
              clientId={site.id}
              clientName={site.name}
              phone={site.phone ?? null}
              ctaMode={site.ctaMode}
              ctaLabel={site.ctaLabel ?? null}
              ctaUrl={site.ctaUrl ?? null}
            />
          </Suspense>
        </div>
      </div>
    </PageFrame>
  );
}
