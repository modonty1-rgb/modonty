import { Metadata } from "next";
import Link from "@/components/link";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getArticles } from "@/app/api/helpers/article-queries";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "أخبار مودونتي",
  description: "اشترك في النشرة الإخبارية واحصل على رؤى وتحديثات أسبوعية من مودونتي في بريدك.",
};

export default async function NewsPage() {
  const { articles } = await getArticles({ limit: 5 });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "أخبار مودونتي" },
        ]}
      />

      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-6">أخبار مودونتي</h1>
        <p className="text-muted-foreground mb-8">
          نقطة التجمع لكل ما هو جديد من مودونتي. اشترك في النشرة لتحصل على أهم الأخبار
          والمقالات في رسالة أسبوعية مختصرة.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              النشرة الإخبارية لأخبار مودونتي
            </CardTitle>
            <CardDescription>
              رسالة أسبوعية واحدة تجمع لك أبرز المقالات، التحديثات، ونصائح فريق مودونتي.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {[
                "ملخص أسبوعي لأبرز الأخبار والمقالات.",
                "روابط مختارة تساعدك على المتابعة دون إضاعة الوقت.",
                "لا بريد مزعج — يمكنك الإلغاء في أي وقت.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="w-full sm:w-auto">
              <Link href="/news/subscribe" className="inline-flex items-center gap-2">
                اشترك في النشرة الآن
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              نحترم خصوصيتك. لن نشارك بريدك مع أي طرف ثالث، ويمكنك إلغاء الاشتراك بضغطة واحدة.
            </p>
          </CardContent>
        </Card>

        {articles.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              من أحدث المقالات على مودونتي
            </h2>
            <ul className="space-y-2">
              {articles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{a.title}</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-primary font-medium hover:underline"
            >
              تصفح كل المقالات ←
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
