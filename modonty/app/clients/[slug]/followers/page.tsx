import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
import { getClientFollowers } from "../helpers/client-followers";

export const metadata: Metadata = { robots: { index: false, follow: false } };
import { ClientFollowersList } from "../components/client-followers-list";

interface ClientFollowersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientFollowersPage({ params }: ClientFollowersPageProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client } = data;

  // Fetch followers server-side so the list renders in raw HTML (no client fetch flash)
  const followers = await getClientFollowers(client.slug, 6);

  return (
    <ClientFollowersList
      clientId={client.id}
      followers={followers ?? []}
    />
  );
}
