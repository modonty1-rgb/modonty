import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";

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

  return (
    <ClientFollowersList clientSlug={client.slug} clientId={client.id} />
  );
}

