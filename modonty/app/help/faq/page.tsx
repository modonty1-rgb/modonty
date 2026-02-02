import { Metadata } from "next";
import { generateMetadataFromSEO, generateFAQPageStructuredData } from "@/lib/seo";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "../components/faq-accordion";
import { FAQSearch } from "../components/faq-search";
import { getActiveFAQs } from "./actions/faq-actions";
import Link from "@/components/link";
import { ArrowRight, Mail, HelpCircle } from "lucide-react";
import { FAQPageContent } from "./components/faq-page-content";

export const metadata: Metadata = generateMetadataFromSEO({
  title: "الأسئلة الشائعة",
  description: "إجابات على الأسئلة الأكثر شيوعاً حول منصة مودونتي",
  keywords: ["أسئلة", "شائعة", "مساعدة", "دعم"],
  url: "/help/faq",
  type: "website",
});

export const revalidate = 3600;

function sanitizeJsonLd(json: object): string {
  return JSON.stringify(json).replace(/</g, '\\u003c');
}

export default async function FAQPage() {
  const faqs = await getActiveFAQs();
  
  // Debug: Log FAQ counts to verify data
  if (process.env.NODE_ENV === "development") {
    console.log("FAQ counts:", faqs.map(f => ({ 
      id: f.id, 
      question: f.question.substring(0, 30), 
      upvoteCount: f.upvoteCount, 
      downvoteCount: f.downvoteCount 
    })));
  }
  
  const structuredData = generateFAQPageStructuredData(faqs);
  const lastUpdated = faqs.length > 0 
    ? faqs.reduce((latest, faq) => {
        const faqDate = faq.lastReviewed || faq.updatedAt;
        return !latest || (faqDate && faqDate > latest) ? faqDate : latest;
      }, faqs[0]?.lastReviewed || faqs[0]?.updatedAt)
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(structuredData) }}
      />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: "مركز المساعدة", href: "/help" },
            { label: "الأسئلة الشائعة" },
          ]}
        />
        
        <div className="mb-6">
          <h1 className="text-3xl font-semibold mb-2">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground">
            ابحث عن إجابات للأسئلة الأكثر شيوعاً حول منصة مودونتي
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/help">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة إلى مركز المساعدة
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/contact">
              <Mail className="h-4 w-4 ml-2" />
              اتصل بنا
            </Link>
          </Button>
        </div>

        {faqs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                لا توجد أسئلة شائعة متاحة
              </h3>
              <p className="text-muted-foreground mb-6">
                يمكنك التواصل معنا للحصول على المساعدة
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="default">
                  <Link href="/contact">اتصل بنا</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/help/feedback">إرسال ملاحظات</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FAQPageContent 
            faqs={faqs} 
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    </>
  );
}
