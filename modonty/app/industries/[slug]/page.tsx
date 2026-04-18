import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildingIcon } from "lucide-react";
import { getIndustryBySlug, getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

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
  if (!industry) return { title: "صناعة غير موجودة - مودونتي" };
  return {
    title: `${industry.name} - الصناعات | مودونتي`,
    description: industry.description ?? `استعرض شركات قطاع ${industry.name} الموثوقة على مودونتي`,
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(decodeURIComponent(slug));
  if (!industry) notFound();

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
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
        <div className="container mx-auto max-w-[1128px] px-4 text-center">
          {industry.socialImage ? (
            <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl border">
              <Image
                src={industry.socialImage}
                alt={industry.socialImageAlt ?? industry.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted">
              <BuildingIcon className="h-8 w-8 text-primary/50" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{industry.name}</h1>
          {industry.description && (
            <p className="text-muted-foreground text-base max-w-xl mx-auto">{industry.description}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            {industry.clients.length} {industry.clients.length === 1 ? "شركة" : "شركة"} موثوقة
          </p>
        </div>
      </section>

      {/* Clients grid */}
      <div className="container mx-auto max-w-[1128px] px-4 py-10">
        {industry.clients.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BuildingIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg">لا توجد شركات في هذا القطاع بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industry.clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-32 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  {client.logoMedia?.url ? (
                    <Image
                      src={client.logoMedia.url}
                      alt={client.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary/20">{client.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-4 gap-1">
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {client.name}
                  </h2>
                  {client.slogan && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{client.slogan}</p>
                  )}
                  {client.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{client.description}</p>
                  )}
                  <p className="mt-auto pt-2 text-xs text-muted-foreground">
                    {client._count.articles} مقال
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
