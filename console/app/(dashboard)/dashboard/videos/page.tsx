import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";

import { getClientReels } from "../reels/helpers/reel-queries";
import { VideosManager } from "./components/videos-manager";

export const dynamic = "force-dynamic";

/**
 * Video reels — their own route beside the image reels (ق8, Khalid 2026-08-05:
 * "في الـsidebar يجب أن يكون هناك route للريلز وroute للفيديوهات").
 *
 * Same rows and the same approval queue as /dashboard/reels — the split is about the
 * upload, which for video is a resumable transfer, an encoding wait, a cover and a
 * written description, none of which belongs next to "pick a picture".
 */
export default async function VideosPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const videos = await getClientReels(clientId, "video");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">الفيديوهات</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          مقاطع قصيرة تعرض شغلك — تظهر للزوّار بعد موافقة مُدَوَّنَتِي.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            المقطع يُعرض بشاشة كاملة طولية — أفضل مقاس <b>1080 × 1920</b>، ومدّته لين{" "}
            <b>٩٠ ثانية</b>. اكتب له عنواناً ووصفاً واضحين، لأنهما اللي يطلعان في نتائج البحث.
          </p>
        </div>
      </header>

      <VideosManager initial={videos} />
    </div>
  );
}
