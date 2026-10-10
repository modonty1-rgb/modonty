import Link from "next/link";
import { Archive, Images, Sparkles } from "lucide-react";

const linkBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * روابط رأس التقويم — المعرض · الأرشيف · سير العمل. بنصّ ظاهر لا أيقونة وحدها:
 * الأيقونات بلا اسم كانت تُخمَّن (مراجعة الواجهة ١٠ أكتوبر ٢٠٢٦).
 */
export function NavIconLinks({ clientId }: { clientId: string }) {
  const links = [
    { href: `/social-calendar/${clientId}/gallery`, label: "المعرض", Icon: Images },
    { href: `/social-calendar/${clientId}/archive`, label: "الأرشيف", Icon: Archive },
    { href: "/social-calendar/flow", label: "سير العمل", Icon: Sparkles },
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
