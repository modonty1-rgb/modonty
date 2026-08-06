import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";

import { ReelsManager } from "./components/reels-manager";
import { getClientReels } from "./helpers/reel-queries";

export const dynamic = "force-dynamic";

/**
 * Image reels — the client's own section, not a corner of the gallery
 * (Khalid 2026-08-04: "الـ Reels المفروض تكون قسم مستقل بذاته").
 *
 * Video reels live at /dashboard/videos instead (ق8): same rows, same queue, different
 * upload experience — and mixing them on one screen made both worse.
 *
 * Two ways in, one queue out: a gallery image the client ticked, or an image uploaded
 * here on purpose. Neither reaches a visitor before Modonty approves it.
 */
export default async function ReelsPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const reels = await getClientReels(clientId, "image");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">الريلز</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          صور قصيرة تعرض شغلك — تظهر للزوّار بعد موافقة مُدَوَّنَتِي.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            الريلز تُعرض بشاشة كاملة طولية — أفضل مقاس <b>1080 × 1920</b>. تقدر كمان تخلّي
            أي صورة من <b>معرض الصور</b> تظهر هنا بعلامة على الصورة نفسها. والمقاطع المصوّرة
            لها صفحتها في <b>الفيديوهات</b>.
          </p>
        </div>
      </header>

      <ReelsManager initial={reels} />
    </div>
  );
}
