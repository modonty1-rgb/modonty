import Link from "next/link";
import { Archive, BookOpen, Images, Sparkles } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * أيقونات التنقّل في رأس التقويم — المعرض · الأرشيف · سير العمل كالقديم (`NavIconLinks.tsx`)،
 * و«بريف العميل» من صفحة Content Briefs القائمة (PRD §٦) بدل تكرار بياناته هنا.
 */
export function NavIconLinks({ clientId }: { clientId: string }) {
  const links = [
    { href: `/social-calendar/${clientId}/gallery`, label: "معرض الإبداع", Icon: Images },
    { href: `/social-calendar/${clientId}/archive`, label: "الأرشيف", Icon: Archive },
    { href: `/briefs/${clientId}`, label: "بريف العميل", Icon: BookOpen },
    { href: "/social-calendar/flow", label: "سير العمل", Icon: Sparkles },
  ];
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5">
        {links.map(({ href, label, Icon }) => (
          <Tooltip key={href}>
            <TooltipTrigger asChild>
              <Link href={href} className={iconBtn} aria-label={label}>
                <Icon className="h-3.5 w-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
