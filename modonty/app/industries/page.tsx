import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getIndustriesWithCounts } from "@/app/api/helpers/industry-queries";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { BuildingIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "الصناعات",
  description: "استعرض جميع القطاعات والصناعات على مودونتي — اكتشف الشركات والخبراء في كل مجال من التقنية والرعاية الصحية والتجارة الإلكترونية وغيرها.",
};

export default async function IndustriesPage() {
  const industries = await getIndustriesWithCounts();

  const totalClients = industries.reduce((sum, i) => sum + i.clientCount, 0);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الصناعات" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
        <div className="container mx-auto max-w-[1128px] px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            الصناعات والقطاعات
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            اكتشف الشركات والخبراء الموثوقين في كل قطاع
          </p>
          <div className="flex items-center justify-center gap-10 mt-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{industries.length}</p>
              <p className="text-sm text-muted-foreground mt-1">صناعة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalClients}</p>
              <p className="text-sm text-muted-foreground mt-1">شركة موثوقة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="container mx-auto max-w-[1128px] px-4 py-10 flex-1">
        {industries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BuildingIcon className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg">لا توجد صناعات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.id}
                href={`/industries/${industry.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image or gradient placeholder */}
                <div className="relative h-40 w-full bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                  {industry.socialImage ? (
                    <Image
                      src={industry.socialImage}
                      alt={industry.socialImageAlt ?? industry.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BuildingIcon className="h-14 w-14 text-primary/30" />
                    </div>
                  )}
                  {/* Client count badge */}
                  <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
                    {industry.clientCount} {industry.clientCount === 1 ? "شركة" : "شركات"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 gap-2">
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {industry.name}
                  </h2>
                  {industry.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {industry.description}
                    </p>
                  )}
                  <span className="mt-auto pt-2 text-xs font-medium text-primary group-hover:underline">
                    استعرض الشركات ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
