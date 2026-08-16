import { getClientsByService } from "@/lib/queries/get-clients-by-service";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { ClientCard } from "@/components/client/client-card";
import { SITE_URL } from "@/constants";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "تسوّق الآن — متاجر شركاء مدونتي | مدونتي" },
  description: "تسوّق من متاجر شركاء مدونتي — علامات تجارية موثوقة بمنتجات وعروض في السعودية ومصر والخليج.",
  alternates: { canonical: `${SITE_URL}/shop` },
};

export default async function ShopPage() {
  const clients = await getClientsByService("shop");

  return (
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "تسوّق الآن" },
        ]}
      />

      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold leading-tight text-foreground">تسوّق الآن</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            متاجر شركاء مدونتي. افتح صفحة الشريك وانتقل لمتجره مباشرة.
          </p>
        </header>

        {clients.length === 0 ? (
          <p className="rounded-lg bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-border">
            ما فيه متاجر معروضة حالياً. تابعنا، الخدمة تفتح قريباً.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client, index) => (
              <ClientCard
                key={client.id}
                id={client.id}
                name={client.name}
                slug={client.slug}
                logoUrl={client.logoUrl}
                heroUrl={client.heroUrl}
                slogan={client.slogan}
                addressCity={client.addressCity}
                articleCount={client.articleCount}
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
