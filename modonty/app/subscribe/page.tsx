import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { SubscribeForm } from "./components/subscribe-form";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "اشترك في النشرة",
  description: "اشترك في النشرة الإخبارية لمودونتي واحصل على آخر الأخبار والمقالات",
  keywords: ["اشتراك", "نشرة", "إخبارية", "بريد إلكتروني"],
  url: "/subscribe",
  type: "website",
});

export const revalidate = 3600;

export default function SubscribePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "اشترك في النشرة" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">اشترك في النشرة الإخبارية</h1>
      <p className="text-muted-foreground mb-8">
        ابق على اطلاع بآخر الأخبار والمقالات من مودونتي. اشترك الآن واحصل على المحتوى
        الأفضل مباشرة في بريدك الإلكتروني.
      </p>
      <SubscribeForm />
    </div>
  );
}
