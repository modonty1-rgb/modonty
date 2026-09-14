import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { modontyUrl } from "@/lib/modonty-url";

/** ترويسة تركيز: شعارٌ ورابط رجوع واحد. لا قائمة ولا بحث — كل عنصرٍ إضافي هنا مخرجٌ من الدفع. */
export function CheckoutHeader({ backHref }: { backHref: string }) {
  return (
    <header className="border-b border-border/60 bg-card/50 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* الهدفان ٤٤px ارتفاعاً (Apple HIG) لا ٢٨ و٢٤ — بحشوٍ لا بتكبير النصّ، فالشكل
            لا يتغيّر والإصبع تصيب. قيس على ٣٩٠px قبل التعديل: الرجوع ٢٨ والشعار ٢٤×٢٤،
            وهما فوق حدّ WCAG 2.5.8 (٢٤) ودون حدّ اللمس المريح. */}
        <a
          href={backHref}
          className="-mr-2 inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>رجوع للباقات</span>
        </a>
        <a
          href={modontyUrl("/")}
          aria-label="مدونتي — الصفحة الرئيسية"
          className="-ml-2 inline-flex h-11 items-center rounded-md px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <Image src="/modonty-mark.svg" alt="مدونتي" width={72} height={22} className="h-6 w-auto" priority />
        </a>
      </div>
    </header>
  );
}
