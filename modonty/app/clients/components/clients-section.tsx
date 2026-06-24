'use client';

import dynamic from 'next/dynamic';

import type { FeaturedPartner } from './featured-partners-slider';

interface ClientData {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { id: string; name: string; slug: string };
  url?: string;
  logo?: string;
  ogImage?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  createdAt: Date;
  isVerified: boolean;
  isFeatured?: boolean;
  ctaMode?: "NONE" | "FORM" | "LINK" | null;
  ctaLabel?: string;
  ctaUrl?: string;
}

interface IndustryData {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
}

// Hero slider — server-rendered (ssr) for LCP, then hydrated for the interactive slider.
const FeaturedPartnersSlider = dynamic(
  () => import('./featured-partners-slider').then((m) => ({ default: m.FeaturedPartnersSlider })),
  { ssr: true }
);

// Directory — interactive (filters/search), client-only.
const ClientsContent = dynamic(
  () => import('./clients-content').then((m) => ({ default: m.ClientsContent })),
  { ssr: false }
);

interface ClientsSectionProps {
  featuredClients: FeaturedPartner[];
  allClients: ClientData[];
  industries: IndustryData[];
}

export function ClientsSection({ featuredClients, allClients, industries }: ClientsSectionProps) {
  return (
    <>
      {/* HERO = featured-only full-bleed slider (branded invite band when none featured) */}
      <FeaturedPartnersSlider partners={featuredClients} />

      <section aria-labelledby="all-clients-heading">
        <h2 id="all-clients-heading" className="sr-only">
          جميع الشركاء
        </h2>
        <ClientsContent initialClients={allClients} industries={industries} />
      </section>
    </>
  );
}
