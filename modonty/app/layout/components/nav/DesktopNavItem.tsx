import type { ComponentType } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DesktopNavItemProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
  tone?: "accent";
}

/**
 * **مثل شريط الجوّال** (خالد ٢٤ سبتمبر ٢٠٢٦ — `components/shared/quick-links/OrbitQuickLinks.tsx`):
 * المكانُ الحاليّ دائرةٌ كبيرةٌ بلون البراند وتوهّجه وعليها اسمُه، والباقي دوائرُ أصغر بأيقونةٍ فقط.
 * بلا دوران: الترتيبُ ثابتٌ على الديسكتوب — تحرّكُ المواضع تحت الفأرة يُضيّع الزائر، والإصبعُ على
 * الجوّال هو ما تناسبه الحلقة. والاسمُ يبقى في `aria-label` وفي تلميح الوقوف — فالأيقونةُ
 * وحدها لا تُفهم دائماً، والفأرةُ تسأل حيث يجرّب الإصبع. الكبيرة ٥٦px = ارتفاعُ الشريط (`h-14`)
 * فلا تخرج من حافته.
 */
export function DesktopNavItem({ icon: Icon, label, href, active = false, tone }: DesktopNavItemProps) {
  return (
    <Link
      href={href}
      // `aria-current="page"` announces "you are here" to a screen reader — the size and colour
      // alone cannot. Same attribute MobileMenu and the orbit bar carry.
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "group relative flex shrink-0 flex-col items-center justify-center rounded-full border transition-[width,height,background-color,box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active
          ? "size-14 border-primary/80 bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.5)]"
          : cn(
              "size-11 border-border/80 bg-card/90 opacity-80 hover:border-primary/65 hover:opacity-100",
              tone === "accent" ? "text-link-accent" : "text-foreground",
            ),
      )}
    >
      <Icon className={active ? "size-6" : "size-[22px]"} />
      {active && <span className="mt-0.5 max-w-full truncate px-1 text-[10px] font-bold leading-none">{label}</span>}
      {!active && (
        <span role="tooltip" className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      )}
    </Link>
  );
}
