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

  // Both keys travel to the client untouched; GalleryManager resolves through `mediaSrc`.
  // Resolving here instead would drop `bunnyUrl`, which `GalleryImage` now requires.
  //
  // One query, and the reel state comes with it: the reel IS this row (2026-08-05). What
  // used to sit under here — a second query hunting the legacy reels by image URL because
  // they predated the link field — has nothing left to hunt.
  const media = await db.media.findMany({
    where: {
      clientId,
      type: "GALLERY",
      // Depends on the backfill step having run (media-reels-backfill.ts). Rows written
      // before the merge have no `inGallery` key at all, and NO filter matches an absent
      // key — `true`, `NOT: { false }` and `{ not: false }` were each measured returning
      // 0 of 16 on modonty_dev. There is no query-level way around it; the field has to
      // be written onto the rows first.
      inGallery: true,
    },
    select: {
      id: true,
      url: true,
      bunnyUrl: true,
      altText: true,
      width: true,
      height: true,
      inReels: true,
      reelStatus: true,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const images = media.map((m) => ({
    id: m.id,
    url: m.url,
    bunnyUrl: m.bunnyUrl,
    altText: m.altText,
    width: m.width,
    height: m.height,
    inReels: m.inReels,
    reelStatus: m.reelStatus,
  }));

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

      <GalleryManager initial={images} />
    </div>
  );
}
