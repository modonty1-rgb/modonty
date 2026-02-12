import { Metadata } from "next";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { NewsSubscribeForm } from "./components/news-subscribe-form";

export const metadata: Metadata = {
  title: "اشتراك في أخبار مودونتي",
  description: "اشترك في النشرة الإخبارية لمودونتي واحصل على آخر الأخبار والمقالات في بريدك.",
};

export default function NewsSubscribePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "أخبار مودونتي", href: "/news" },
          { label: "اشترك في النشرة" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">اشتراك في أخبار مودونتي</h1>
      <p className="text-muted-foreground mb-8">
        احصل على آخر الأخبار والمقالات مباشرة في بريدك الإلكتروني.{" "}
        <Link href="/news" className="text-primary underline underline-offset-2">
          عرض الأخبار
        </Link>
      </p>
      <NewsSubscribeForm />
    </div>
  );
}
