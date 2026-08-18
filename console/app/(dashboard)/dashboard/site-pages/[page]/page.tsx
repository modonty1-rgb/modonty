import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { findSitePage } from "@/app/(dashboard)/components/site-pages";
import { getHomeData } from "@modonty/shared/lib/partner-site";
import { db } from "@/lib/db";
import { PageBlocksEditor } from "../components/page-blocks-editor";
import { isBlocksPage } from "../helpers/blocks-pages";

export const dynamic = "force-dynamic";

interface SitePageSettingsProps {
  params: Promise<{ page: string }>;
}

const INTRO: Record<string, string> = {
  home: "أقسام صفحتك الرئيسية بالترتيب. أطفئ اللي ما تبغاه، والباقي يظهر كما تراه هنا.",
  about: "قصّتك وفريقك وما يثبت جدارتك — بالترتيب اللي يبني الثقة. أطفئ اللي ما تبغاه.",
  services: "خدماتك بالتفصيل، ثم ما يقنع الزائر يتواصل: ثقة · أرقام · آراء · أسئلة.",
  photos: "كل صورك في صفوف مرصوصة بمقاسها الحقيقي، ثم الفيديو والآراء.",
  faq: "كل أسئلتك المنشورة، ثم طريقة التواصل لمن ما لقى سؤاله.",
  contact: "طرق التواصل، الخريطة، ونموذج «اترك رقمك» — الصفحة اللي تنزل عليها كل نداءات «راسلنا».",
  articles: "أحدث مقال كبيراً ثم الباقي في شبكة، ثم النشرة.",
  book: "نموذج الحجز اللي حدّده لك فريق مدونتي — يظهر هنا وفي الرئيسية بعد الخدمات.",
  reviews: "متوسّط التقييم ثم كل الآراء المعتمَدة. الآراء يكتبها زوّار مدونتي وتعتمدها أنت من «تقييمات نشاطك».",
};

/**
 * Settings screen for ONE page of the partner's site: the page's blocks with a switch each,
 * previewed with his own data. Pages without a block list yet show a plain placeholder.
 */
export default async function SitePageSettings({ params }: SitePageSettingsProps) {
  const { page } = await params;
  const def = findSitePage(page);
  if (!def) notFound();

  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const result = isBlocksPage(page) ? await getHomeData(db, { id: clientId }) : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">{def.label}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{INTRO[page] ?? `إعدادات صفحة «${def.label}» في موقعك.`}</p>
      </header>
      {isBlocksPage(page) && result ? (
        <PageBlocksEditor page={page} data={result.data} initialHidden={result.hiddenSections} />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">هنا تنزل إعدادات هذه الصفحة.</div>
      )}
    </div>
  );
}
