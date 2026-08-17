import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OptimizedImage } from "@modonty/shared/components/optimized-image";
import { getClientPageData } from "../../helpers/client-page-data";
import { PageFrame } from "../../components/page-frame";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DATE_FMT = new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) return { title: "غير موجود" };
  return {
    title: `مقالات ${data.client.name}`.slice(0, 51),
    description: `كل ما كتبه ${data.client.name} على مدونتي — ${data.client._count.articles} مقالاً`,
  };
}

/** «مقالاته» — every published article by this partner, newest first. */
export default async function ClientArticlesPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getClientPageData(slug);
  if (!data) notFound();
  const { client } = data;
  if (client.articles.length === 0) notFound();

  return (
    <PageFrame
      siteName={client.name}
      base={`/clients/${encodeURIComponent(client.slug)}`}
      eyebrow="من قلمه"
      title={`${client._count.articles.toLocaleString("ar-SA")} مقالاً على مدونتي`}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {client.articles.map((a) => (
          <article key={a.id} className="group">
            <Link href={`/articles/${encodeURIComponent(a.slug)}`} className="block">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted">
                {a.featuredImage ? (
                  <OptimizedImage media={a.featuredImage} alt="" fill loading="lazy" sizes="card" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                ) : null}
              </div>
              <p className="mt-4 text-xs text-primary">
                {a.category?.name}
                {a.datePublished ? <span className="text-muted-foreground"> · {DATE_FMT.format(a.datePublished)}</span> : null}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{a.title}</h2>
            </Link>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
