"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MediaPickerDialog } from "@/components/shared/media-picker-dialog";

import { saveSectorHero } from "../../actions";
import { HERO_PROMPTS } from "../helpers/hero-prompts";
import { PromptBox } from "./prompt-box";

interface Slot {
  mediaId: string | null;
  url: string;
}

type SlotKey = "desktop" | "mobile";

interface SectorHeroFormProps {
  sector: string;
  sectorLabel: string;
  coreClientId: string;
  initial: { heroTitle: string; heroSubtitle: string; desktop: Slot; mobile: Slot };
}

const SLOTS = [
  { key: "desktop", role: "SECTOR_HERO", label: "صورة الديسكتوب", size: "2048×768", thumb: "h-12 w-32" },
  { key: "mobile", role: "SECTOR_HERO_MOBILE", label: "صورة الجوّال", size: "1080×1080", thumb: "size-12" },
] as const;

/**
 * The top of the sector page — two images and two lines of text, all from here (Khalid, 27 Sep 2026:
 * «ما نشتغل هارد كودد»). One row per image, then the text and one save (Khalid, 28 Sep 2026: the
 * stacked pickers, hints and prompt panels were «تشويش بصري»). The image itself opens the media
 * library, as every picker in the system does; its «Upload» opens the upload window in place, cropped
 * to the slot, and the new file lands in the slot (28 Sep 2026: no leaving for /media/upload).
 * Nothing reaches the page until «حفظ».
 */
export function SectorHeroForm({ sector, sectorLabel, coreClientId, initial }: SectorHeroFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initial.heroTitle);
  const [subtitle, setSubtitle] = useState(initial.heroSubtitle);
  const [slots, setSlots] = useState<Record<SlotKey, Slot>>({ desktop: initial.desktop, mobile: initial.mobile });
  const [picking, setPicking] = useState<SlotKey | null>(null);

  const prompts = HERO_PROMPTS[sector];
  const pickingSlot = SLOTS.find((s) => s.key === picking);
  const setSlot = (key: SlotKey, slot: Slot) => setSlots((s) => ({ ...s, [key]: slot }));

  const save = () =>
    startTransition(async () => {
      const res = await saveSectorHero(sector, {
        heroTitle: title,
        heroSubtitle: subtitle,
        heroMediaId: slots.desktop.mediaId,
        heroMobileMediaId: slots.mobile.mediaId,
      });
      if (res.success) {
        toast({ title: "تم الحفظ" });
        router.refresh();
      } else {
        toast({ title: "لم يُحفظ", description: res.error, variant: "destructive" });
      }
    });

  return (
    <section aria-label="الهيرو" className="space-y-4">
      <p className="text-[12.5px] text-muted-foreground">
        أعلى صفحة {sectorLabel} في الأيام اللي ما فيها مباريات. العنوان والأزرار تنكتب فوق الصورة، فالصورة بدون كتابة.
      </p>

      {/* Images and text side by side — the SEO editor below spans the full width, and a narrower
          hero above it left an empty half (measured 768 of 1266px, 28 Sep 2026). */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-[13px] font-bold">الصور</h2>
          <ul className="divide-y rounded-lg border bg-card">
            {SLOTS.map((slot) => {
              const current = slots[slot.key];
              return (
                <li key={slot.key} className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => setPicking(slot.key)}
                    aria-label={`اختر ${slot.label} من المكتبة`}
                    className={`${slot.thumb} shrink-0 overflow-hidden rounded-md border bg-muted transition hover:ring-2 hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    {current.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a thumbnail from the library's own CDN
                      <img src={current.url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-muted-foreground">
                        <ImageIcon className="size-4" aria-hidden />
                      </span>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{slot.label}</p>
                    <p className="text-[11.5px] text-muted-foreground tabular-nums">
                      {current.url ? null : "ما فيه صورة · "}
                      <bdi dir="ltr">{slot.size}</bdi>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {prompts ? <PromptBox prompt={prompts[slot.key]} /> : null}
                    {current.url ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        aria-label={`إزالة ${slot.label}`}
                        onClick={() => setSlot(slot.key, { mediaId: null, url: "" })}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-[13px] font-bold">النص</h2>
          <div className="space-y-1.5">
            <Label htmlFor="hero-title">العنوان</Label>
            <Input id="hero-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="مسابقة التوقّعات جاية قريباً" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hero-subtitle">السطر تحت العنوان</Label>
            <Input id="hero-subtitle" value={subtitle} maxLength={240} onChange={(e) => setSubtitle(e.target.value)} placeholder="سجّل وكن أول من يعرف…" />
          </div>
        </div>
      </div>

      <Button type="button" onClick={save} disabled={isPending} className="gap-2">
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        حفظ
      </Button>

      <MediaPickerDialog
        open={picking !== null}
        onOpenChange={(open) => !open && setPicking(null)}
        clientId={coreClientId}
        lockClient
        uploadTarget={
          pickingSlot
            ? { clientId: coreClientId, clientName: "مدونتي", role: pickingSlot.role, contextLabel: `${pickingSlot.label} — ${sectorLabel}` }
            : undefined
        }
        onSelect={(m) => {
          if (picking) setSlot(picking, { mediaId: m.mediaId, url: m.bunnyUrl || m.url });
          setPicking(null);
        }}
      />
    </section>
  );
}
