"use client";

import Link from "@/components/link";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewsletterSubscribeForm } from "@/components/layout/RightSidebar/NewsletterSubscribeForm";
import {
  IconGift,
  IconShield,
  IconHelpCircle,
  IconMessage,
  IconZap,
  IconArticleList,
  IconVolume2,
  IconRocket,
  IconDiscount,
  IconTicket,
  IconLock,
  IconBell,
  IconTarget,
} from "@/lib/icons";

// Live perks (available now) — lead with the real value.
const PERKS_READY = [
  { Icon: IconZap, title: "تكون أول من يعرف", desc: "أحدث المقالات توصلك قبل الكل." },
  { Icon: IconArticleList, title: "خلاصة جاهزة", desc: "أهم المقالات ملخّصة، توفّر وقتك." },
  { Icon: IconVolume2, title: "النسخة الصوتية توصلك", desc: "اسمع المقال في طريقك بدل ما تقرأ." },
  { Icon: IconRocket, title: "جديد الشركاء أول", desc: "إطلاقات وخدمات الشركاء قبل غيرك." },
] as const;

// Coming-soon perks — grouped under a clear «قريباً» header (commitments; never implied as available).
const PERKS_SOON = [
  { Icon: IconDiscount, title: "عروض وخصومات" },
  { Icon: IconGift, title: "سحوبات وهدايا" },
  { Icon: IconTicket, title: "كوبون ترحيبي" },
  { Icon: IconLock, title: "محتوى حصري" },
  { Icon: IconBell, title: "تنبيه العروض" },
  { Icon: IconTarget, title: "توصيات على ذوقك" },
] as const;

interface MazayaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Shared «المزايا» (newsletter) sheet — controlled. Same instance used by the
// mobile bottom bar and the desktop nav bar.
export function MazayaSheet({ open, onOpenChange }: MazayaSheetProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[88%] sm:max-w-sm p-0 flex flex-col">
        {/* Header — icon inline with title; pt clears the X (close sits top-right) */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-bl from-primary/15 via-accent/10 to-card px-5 pt-10 pb-4 text-start">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30">
              <IconGift className="h-5 w-5" aria-hidden />
            </span>
            <SheetTitle className="text-lg font-extrabold leading-tight tracking-tight">خلّ مدوّنتي تجيك</SheetTitle>
          </div>
          <SheetDescription className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            اشترك ببريدك، وتوصلك المقالات والمزايا أول بأول — بدون إزعاج.
          </SheetDescription>
        </div>

        <ScrollArea className="flex-1 min-h-0" dir="rtl">
          <div className="px-5 pb-4 pt-4">
            {/* متاح الآن — prominent */}
            <div className="mb-3 flex items-center gap-2 px-1 text-xs font-bold text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              متاح الآن
            </div>
            <ul className="space-y-2">
              {PERKS_READY.map((perk) => (
                <li
                  key={perk.title}
                  className="flex items-start gap-3 rounded-2xl border border-transparent bg-foreground/[0.03] p-3 transition-colors hover:border-border hover:bg-foreground/[0.05]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-accent">
                    <perk.Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{perk.title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{perk.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* قريباً — grouped + condensed */}
            <div className="mb-3 mt-6 flex items-center gap-2 px-1 text-xs font-bold text-muted-foreground">
              قريباً للمشتركين
              <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                على الطريق
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {PERKS_SOON.map((perk) => (
                <li
                  key={perk.title}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted p-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground">
                    <perk.Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-foreground/90">{perk.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>

        {/* Sticky CTA + help links */}
        <div className="border-t border-border bg-gradient-to-t from-card to-card/85 px-5 py-4">
          <NewsletterSubscribeForm />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <IconShield className="h-3.5 w-3.5 shrink-0" aria-hidden />
            بريدك بأمان · بدون سبام · تلغي وقت ما تبي
          </p>

          <nav aria-label="روابط مساعدة" className="mt-3 flex items-center justify-center gap-6 border-t border-border pt-3">
            <Link
              href="/help"
              onClick={close}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <IconHelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              مركز المساعدة
            </Link>
            <Link
              href="/help/feedback"
              onClick={close}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <IconMessage className="h-3.5 w-3.5 shrink-0" aria-hidden />
              إرسال ملاحظات
            </Link>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
