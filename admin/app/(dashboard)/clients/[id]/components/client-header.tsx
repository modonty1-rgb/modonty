"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SEOHealthGauge } from "@/components/shared/seo-doctor/seo-health-gauge";
import { organizationSEOConfig } from "../../helpers/client-seo-config";
import { DeleteClientButton } from "./delete-client-button";

interface ClientHeaderProps {
  client: {
    id: string;
    name: string;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    seoTitle: string | null;
    seoDescription: string | null;
    legalName: string | null;
    url: string | null;
    email: string;
    phone: string | null;
    description: string | null;
    sameAs: string[];
    businessBrief: string | null;
    gtmId: string | null;
    foundingDate: Date | null;
    contactType: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterSite: string | null;
    canonicalUrl: string | null;
    ogImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    twitterImageMedia: {
      url: string;
      altText: string | null;
    } | null;
  };
}

export function ClientHeader({ client }: ClientHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-6 border-b">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {client.logoMedia?.url && (
          <img
            src={client.logoMedia.url}
            alt={client.logoMedia.altText || client.name}
            className="h-16 w-16 rounded-lg object-contain flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">{client.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <SEOHealthGauge data={client} config={organizationSEOConfig} size="md" />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/clients">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/clients/${client.id}/edit`}>Edit</Link>
          </Button>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>
    </div>
  );
}
