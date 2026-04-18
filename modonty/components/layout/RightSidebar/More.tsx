import Link from "@/components/link";
import { cn } from "@/lib/utils";
import {
  IconFeed, IconInfo, IconNews, IconMessage, IconHelpCircle,
  IconIndustry, IconCategories, IconScale, IconShield,
} from "@/lib/icons";

const linkClass = cn(
  "inline-flex items-center gap-1.5 w-full rounded px-2 py-1 text-xs text-muted-foreground",
  "hover:text-primary hover:bg-muted/50 transition-colors duration-200",
  "[&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0"
);

export function More() {
  return (
    <nav
      role="complementary"
      aria-label="المزيد"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "flex-none min-h-0 overflow-hidden p-1.5 flex flex-col gap-0.5"
      )}
    >
      <h2 className="text-xs font-semibold text-foreground pb-2">المزيد</h2>
      <Link href="/industries" className={linkClass}>
        <IconIndustry aria-hidden />
        الصناعات
      </Link>
      <Link href="/tags" className={linkClass}>
        <IconCategories aria-hidden />
        الوسوم
      </Link>
      <Link href="/news" className={linkClass} aria-label="أخبار مودونتي">
        <IconFeed aria-hidden />
        أخبار مودونتي
      </Link>
      <Link href="/about" className={linkClass}>
        <IconInfo aria-hidden />
        من نحن
      </Link>
      <Link href="/help" className={linkClass}>
        <IconHelpCircle aria-hidden />
        مركز المساعدة
      </Link>
      <Link href="/news/subscribe" className={linkClass}>
        <IconNews aria-hidden />
        اشترك
      </Link>
      <Link href="/help/feedback" className={linkClass}>
        <IconMessage aria-hidden />
        إرسال ملاحظات
      </Link>
      <div className="mt-1 border-t border-border pt-1 flex flex-wrap gap-x-2 gap-y-0.5">
        <Link href="/terms" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">الشروط</Link>
        <Link href="/legal/privacy-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">الخصوصية</Link>
        <Link href="/legal/cookie-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">ملفات الارتباط</Link>
        <Link href="/legal/copyright-policy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors">حقوق النشر</Link>
      </div>
    </nav>
  );
}
