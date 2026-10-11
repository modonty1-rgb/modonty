import Link from "next/link";
import { Archive, Images } from "lucide-react";

const linkBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * روابط رأس التقويم — المعرض · الأرشيف. بنصّ ظاهر لا أيقونة وحدها:
 * الأيقونات بلا اسم كانت تُخمَّن (مراجعة الواجهة ١٠ أكتوبر ٢٠٢٦).
 * «سير العمل» مخفي من التقويم بقرار خالد (١١ أكتوبر ٢٠٢٦: «ما احتاجه») — الصفحة `social-calendar/flow` باقية.
 */
export function NavIconLinks({ calendarId }: { calendarId: string }) {
  const links = [
    { href: `/social-calendar/${calendarId}/gallery`, label: "المعرض", Icon: Images },
    { href: `/social-calendar/${calendarId}/archive`, label: "الأرشيف", Icon: Archive },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {links.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className={linkBtn}>
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Link>
      ))}
    </div>
  );
}
