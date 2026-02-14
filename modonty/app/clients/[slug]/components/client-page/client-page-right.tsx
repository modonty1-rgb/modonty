import { ClientPhotosPreview } from "../client-photos-preview";
import { ClientReviewsPreview } from "../client-reviews-preview";
import { ClientFollowersPreview } from "../client-followers-preview";
import { ClientLikesPreview } from "../client-likes-preview";
import { RelatedClients } from "../related-clients";
import type { ClientPageClient, ClientPageRelatedClient } from "./types";

interface ClientPageRightProps {
  client: ClientPageClient;
  relatedClients: ClientPageRelatedClient[];
  reviews: Array<{
    id: string;
    content: string;
    author?: { id: string; name: string | null; image: string | null } | null;
    article: { id: string; title: string; slug: string };
  }>;
  followers: Array<{
    id: string;
    userId: string | null;
    name: string;
    image: string | null;
  }>;
  engagement: {
    followersCount: number;
    favoritesCount: number;
    articleLikesCount: number;
  };
}

export function ClientPageRight({ client, relatedClients, reviews, followers, engagement }: ClientPageRightProps) {
  return (
    <div className="w-full min-w-0 order-3 space-y-6 pt-4">
      <ClientPhotosPreview articles={client.articles ?? []} />
      <ClientFollowersPreview
        followers={followers}
        clientSlug={client.slug}
        showEmptyState
      />
      <ClientReviewsPreview
        reviews={reviews}
        clientSlug={client.slug}
        clientName={client.name}
        showEmptyState
      />
      <ClientLikesPreview
        followersCount={engagement.followersCount}
        favoritesCount={engagement.favoritesCount}
        articleLikesCount={engagement.articleLikesCount}
        clientSlug={client.slug}
        clientName={client.name}
        showEmptyState
      />
      <section aria-labelledby="client-related-heading">
        <h2 id="client-related-heading" className="sr-only">
          عملاء مشابهون
        </h2>
        <RelatedClients clients={relatedClients} />
      </section>
    </div>
  );
}
