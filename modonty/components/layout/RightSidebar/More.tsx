import Link from "@/components/link";
import { cn } from "@/lib/utils";
import { Newspaper, MessageSquare, Info, Rss } from "lucide-react";

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
      <Link href="/news" className={linkClass} aria-label="أخبار مودونتي">
        <Rss aria-hidden />
        أخبار مودونتي
      </Link>
      <Link href="/about" className={linkClass}>
        <Info aria-hidden />
        من نحن
      </Link>
      <Link href="/news/subscribe" className={linkClass}>
        <Newspaper aria-hidden />
        اشترك
      </Link>
      <Link href="/help/feedback" className={linkClass}>
        <MessageSquare aria-hidden />
        إرسال ملاحظات
      </Link>
    </nav>
  );
}
