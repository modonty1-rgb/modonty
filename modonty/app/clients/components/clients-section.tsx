'use client';

import dynamic from 'next/dynamic';

interface FeaturedClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { name: string; slug: string };
  logo?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  isVerified: boolean;
  url?: string;
}

interface ClientData {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { id: string; name: string; slug: string };
  url?: string;
  logo?: string;
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
}

interface IndustryData {
  id: string;
  name: string;
  slug: string;
  clientCount: number;
}

const FeaturedClients = dynamic(
  () => import('./featured-clients').then((m) => ({ default: m.FeaturedClients })),
  { ssr: true }
);

const ClientsContent = dynamic(
  () => import('./clients-content').then((m) => ({ default: m.ClientsContent })),
  { ssr: false }
);

interface ClientsSectionProps {
  featuredClients: FeaturedClient[];
  allClients: ClientData[];
  industries: IndustryData[];
}

export function ClientsSection({ featuredClients, allClients, industries }: ClientsSectionProps) {
  return (
    <>
      {featuredClients.length > 0 && (
        <section aria-labelledby="featured-clients-heading">
          <h2 id="featured-clients-heading" className="sr-only">
            العملاء المميزون
          </h2>
          <FeaturedClients clients={featuredClients} />
        </section>
      )}
      <section aria-labelledby="all-clients-heading">
        <h2 id="all-clients-heading" className="sr-only">
          جميع العملاء
        </h2>
        <ClientsContent initialClients={allClients} industries={industries} />
      </section>
    </>
  );
}
