import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
import { ClientPhotosPreview } from "../components/client-photos-preview";

interface ClientPhotosPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientPhotosPage({ params }: ClientPhotosPageProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client } = data;

  return (
    <section aria-labelledby="client-photos-heading" className="space-y-4">
      <h2
        id="client-photos-heading"
        className="text-xl font-semibold leading-snug text-foreground"
      >
        الصور
      </h2>
      <ClientPhotosPreview articles={client.articles} showEmptyState />
    </section>
  );
}

