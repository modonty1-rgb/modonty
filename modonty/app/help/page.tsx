import { Metadata } from "next";
import { generateMetadataFromSEO } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, MessageCircleQuestion, Mail } from "lucide-react";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "مركز المساعدة",
  description: "مركز المساعدة والدعم لمنصة مودونتي - ابحث عن إجابات لأسئلتك",
  keywords: ["مساعدة", "دعم", "مركز المساعدة", "أسئلة"],
  url: "/help",
  type: "website",
});

export const revalidate = 3600;

export default function HelpPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "مركز المساعدة" },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6">مركز المساعدة</h1>
      <p className="text-muted-foreground mb-8">
        مرحباً بك في مركز المساعدة. ابحث عن إجابات لأسئلتك أو تواصل معنا للحصول على الدعم.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/help/faq">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-5 w-5" />
                الأسئلة الشائعة
              </CardTitle>
              <CardDescription>
                ابحث عن إجابات للأسئلة الأكثر شيوعاً حول منصة مودونتي
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/help/feedback">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                إرسال ملاحظات
              </CardTitle>
              <CardDescription>
                شاركنا ملاحظاتك واقتراحاتك لمساعدتنا على التحسين
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/contact">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                اتصل بنا
              </CardTitle>
              <CardDescription>
                تواصل مع فريق الدعم للحصول على مساعدة مباشرة
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
