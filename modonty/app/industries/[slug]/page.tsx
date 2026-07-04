import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CommentStatus } from "@prisma/client";
import { BuildingIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import { getIndustryBySlug, getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientCard } from "@/components/shared/client-card";

interface IndustryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const industries = await getIndustriesWithCounts();
    if (!industries.length) return [{ slug: "__no_industries__" }];
    return industries.map((i) => ({ slug: i.slug }));
  } catch {
    return [{ slug: "__no_industries__" }];
  }
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustryBySlug(decodeURIComponent(slug));
  if (!industry) return { title: "صناعة غير موجودة - مدونتي" };
  return {
    title: `${industry.name} - الصناعات | مدونتي`,
    description: industry.description ?? `استعرض شركات قطاع ${industry.name} الموثوقة على مدونتي`,
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(decodeURIComponent(slug));
  if (!industry) notFound();

  const clientIds = industry.clients.map((c) => c.id);

  // Batch fetch GA4 stats + ratings in parallel — one query each, not per-client
  const [ga4Stats, ratingsRaw] = await Promise.all([
    getClientsGA4Stats(),
    clientIds.length > 0
      ? db.clientReview.groupBy({
          by: ["clientId"],
          where: { clientId: { in: clientIds }, status: CommentStatus.APPROVED },
          _avg: { rating: true },
        })
      : Promise.resolve([]),
  ]);

  const ratingMap = new Map(ratingsRaw.map((r) => [r.clientId, r._avg.rating ?? 0]));

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الصناعات", href: "/industries" },
          { label: industry.name },
        ]}
      />

      {/* Hero */}
      {industry.socialImage ? (
        <section className="relative border-b overflow-hidden">
          <div className="relative w-full max-w-[1200px] mx-auto aspect-[1200/630]">
            <Image
              src={industry.socialImage}
              alt={industry.socialImageAlt ?? industry.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{industry.name}</h1>
              {industry.description && (
                <p className="text-white/80 text-base max-w-xl mx-auto">{industry.description}</p>
              )}
              <p className="mt-4 text-sm text-white/70">{industry.clients.length} شركة موثوقة</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto max-w-[1128px] px-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
              <BuildingIcon className="h-8 w-8 text-primary/50" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{industry.name}</h1>
            {industry.description && (
              <p className="text-muted-foreground text-base max-w-xl mx-auto">{industry.description}</p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">{industry.clients.length} شركة موثوقة</p>
          </div>
        </section>
      )}

      {/* Clients grid */}
      <div className="container mx-auto max-w-[1128px] px-4 py-10">
        {industry.clients.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BuildingIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg">لا توجد شركات في هذا القطاع بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.clients.map((client, index) => (
              <ClientCard
                key={client.id}
                name={client.name}
                slug={client.slug}
                logoUrl={client.logoMedia?.url}
                heroUrl={client.heroImageMedia?.url}
                slogan={client.slogan}
                addressCity={client.addressCity}
                averageRating={ratingMap.get(client.id) ?? 0}
                articleCount={client._count.articles}
                googleTotal={ga4Stats[client.slug]?.total ?? 0}
                phone={client.phone}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
