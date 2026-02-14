import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
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
    <ClientFollowersList clientSlug={client.slug} />
  );
}

