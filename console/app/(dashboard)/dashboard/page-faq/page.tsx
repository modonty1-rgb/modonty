import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { getClientPageFaqs } from "./helpers/page-faq-queries";
import { PageFaqManager } from "./components/page-faq-manager";

export const dynamic = "force-dynamic";

export default async function PageFaqPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const faqs = await getClientPageFaqs(clientId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">أسئلة صفحتك</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          الأسئلة والأجوبة اللي تظهر في صفحتك على مودونتي — وأسئلة الزوار اللي تنتظر ردّك.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            هذي غير «الأسئلة الشائعة» تحت المقالات. هنا أسئلة صفحة نشاطك نفسها. أي
            سؤال له إجابة يُنشر تلقائياً ويظهر في بحث Google.
          </p>
        </div>
      </header>

      <PageFaqManager initial={faqs} />
    </div>
  );
}
