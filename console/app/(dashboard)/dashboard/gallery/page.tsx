import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Info } from "lucide-react";
import { GalleryManager } from "./components/gallery-manager";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId;
  if (!clientId) redirect("/");

  const media = await db.media.findMany({
    where: { clientId, type: "GALLERY" },
    select: { id: true, url: true, altText: true, width: true, height: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">معرض الصور</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          صور أعمالك ومنتجاتك — تظهر في معرض صفحتك على مودونتي.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p className="text-xs leading-relaxed text-foreground">
            اكتب وصفاً مختصراً لكل صورة — يساعد في ظهورك على بحث Google للصور. الرفع
            والحذف فوري.
          </p>
        </div>
      </header>

      <GalleryManager initial={media} />
    </div>
  );
}
