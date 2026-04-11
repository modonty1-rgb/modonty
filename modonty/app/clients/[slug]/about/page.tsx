import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";
import { ClientAbout } from "../components/client-about";
import { ClientContact } from "../components/client-contact";
import { ClientOfficialData } from "../components/client-official-data";

interface ClientAboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClientAboutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `معلومات عن ${data.client.name}`.slice(0, 51),
    description: data.client.description || `تفاصيل ومعلومات عن ${data.client.name}`,
  };
}

export default async function ClientAboutPage({ params }: ClientAboutPageProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6 lg:col-span-2">
        <section aria-labelledby="client-about-heading" className="space-y-4">
          <h2
            id="client-about-heading"
            className="text-xl font-semibold leading-snug text-foreground"
          >
            معلومات عن الشركة
          </h2>
          <ClientAbout client={client} />
        </section>
      </div>

      <div className="space-y-6">
        <ClientContact client={client} />
        <ClientOfficialData client={client} />
      </div>
    </div>
  );
}

