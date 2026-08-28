import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { NewsSubscribeForm } from "./components/news-subscribe-form";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

// اسم القسم من الإعدادات، و`absolute` لأنه يحمل اسم الموقع فلا يُلحقه قالب الجذر ثانيةً.
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getPageSeoDefaults();
  return {
    title: { absolute: siteName ? `اشتراك في أخبار ${siteName}` : "اشتراك في الأخبار" },
    description: "اشترك في النشرة الإخبارية واحصل على آخر الأخبار والمقالات في بريدك.",
    robots: { index: false, follow: false },
  };
}

export default async function NewsSubscribePage() {
  const { siteName } = await getPageSeoDefaults();
  const newsLabel = siteName ? `أخبار ${siteName}` : "الأخبار";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: newsLabel, href: "/news" },
          { label: "اشترك في النشرة" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">{`اشتراك في ${newsLabel}`}</h1>
      <p className="text-muted-foreground mb-8">
        احصل على آخر الأخبار والمقالات مباشرة في بريدك الإلكتروني.{" "}
        <Link
          href="/news"
          className="text-primary underline underline-offset-2 max-md:inline-flex max-md:min-h-11 max-md:items-center"
        >
          عرض الأخبار
        </Link>
      </p>
      <NewsSubscribeForm />
    </div>
  );
}
