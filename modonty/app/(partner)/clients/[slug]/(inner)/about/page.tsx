import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientPageData } from "../../helpers/client-page-data";
import { PageFrame } from "../../components/page-frame";
import { ClientAboutSection } from "../../components/sections/client-about-section";
import { ClientTeamSection } from "../../components/sections/client-team-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `من هو ${data.client.name}`.slice(0, 51),
    description: data.client.seoDescription || `تعرّف على ${data.client.name}: قصّته، فريقه، واعتماداته`,
  };
}

/** «من هو» — the full story: description + video, credentials, legal facts, and the team. */
export default async function ClientAboutPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) notFound();
  const { client } = data;

  return (
    <PageFrame siteName={client.name} base={`/clients/${encodeURIComponent(client.slug)}`} eyebrow="من هو" title={client.name} intro={client.slogan ?? undefined}>
      <div className="space-y-6">
        <ClientAboutSection
          videoUrl={client.introVideoMedia?.mp4Url ?? client.introVideoUrl}
          videoPoster={client.introVideoMedia?.thumbnailUrl ?? null}
          aboutText={client.description || client.seoDescription}
          credentials={client.credentials.map((c) => ({ name: c.name, authority: c.authority ?? null, year: c.year ?? null, url: c.url ?? null }))}
          legal={{
            legalName: client.legalName,
            commercialRegistrationNumber: client.commercialRegistrationNumber,
            legalForm: client.legalForm,
            vatID: client.vatID,
            numberOfEmployees: client.numberOfEmployees,
            foundingDate: client.foundingDate,
            knowsLanguage: client.knowsLanguage,
          }}
        />
        <ClientTeamSection teamMembers={client.teamMembers} />
      </div>
    </PageFrame>
  );
}
