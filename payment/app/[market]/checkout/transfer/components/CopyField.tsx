"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * رقمٌ يُنسَخ بضغطة — آيبان أو رقم حساب أو رقم طلب.
 *
 * ليش زرّ نسخ لا نصٌّ يُحدَّد باليد: الآيبان المصريّ **٢٩ خانة**، ورقم الحساب ١٦.
 * وتحديدُها بالإصبع على شاشة جوّال يخطئ خانةً أو يلتقط مسافة — فتذهب الحوالة إلى
 * حسابٍ آخر أو تُرفض. وخطأٌ واحد هنا يكلّف المشتري ماله ويكلّفنا ثقته.
 *
 * و`dir="ltr"` على القيمة: أرقام الحساب لاتينية، وداخل صفحةٍ عربية تُقلَب مقاطعها
 * فيُقرأ الآيبان معكوساً — فيُنسَخ صحيحاً ويُقرأ خطأً، وهو أسوأ من الاثنين.
 */
export function CopyField({ value, big = false }: { value: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /**
       * `clipboard` يفشل في سياقٍ غير آمن أو بلا إذن. والاحتياط ليس ترفاً: بدونه
       * يضغط المشتري ولا يحدث شيء، فيظنّ الصفحة معطّلة ويغادر.
       */
      const el = document.createElement("textarea");
      el.value = value;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* لا شيء يمكن فعله — القيمة ظاهرةٌ أمامه ليكتبها. */
      }
      el.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      /* `min-h-11` هدفٌ يُضغط بالإبهام — فوق حدّ WCAG 2.5.8 (٢٤×٢٤) بهامش. */
      className={cn(
        "group inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 transition-colors hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        big && "mt-2 border-2 border-primary/40 px-4 py-2.5",
      )}
      aria-label={copied ? `نُسخ ${value}` : `انسخ ${value}`}
    >
      <span
        dir="ltr"
        className={cn(
          "min-w-0 break-all text-start font-bold tabular-nums text-foreground",
          big ? "text-[20px] tracking-wide sm:text-[24px]" : "text-[13.5px]",
        )}
      >
        {value}
      </span>
      {copied ? (
        <Check className="size-4 shrink-0 text-success-ink" strokeWidth={2.75} aria-hidden />
      ) : (
        <Copy className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={2.25} aria-hidden />
      )}
      {/* إعلانٌ لقارئ الشاشة: تبدّل الأيقونة وحده لا يصل إليه. */}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "نُسخ" : ""}
      </span>
    </button>
  );
}
