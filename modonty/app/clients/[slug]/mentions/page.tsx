import { notFound } from "next/navigation";
import { getClientPageData } from "../helpers/client-page-data";

interface ClientMentionsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientMentionsPage({ params }: ClientMentionsPageProps) {
  const { slug } = await params;

  const data = await getClientPageData(slug);

  if (!data) {
    notFound();
  }

  const { client } = data;

  return (
    <section aria-labelledby="client-mentions-heading" className="space-y-2">
      <h2
        id="client-mentions-heading"
        className="text-xl font-semibold leading-snug text-foreground"
      >
        الإشارات
      </h2>
      <p className="text-sm text-muted-foreground">
        قسم الإشارات مخصص مستقبلاً لعرض محتوى يذكر هذا العميل عبر المنصة.
      </p>
    </section>
  );
}

