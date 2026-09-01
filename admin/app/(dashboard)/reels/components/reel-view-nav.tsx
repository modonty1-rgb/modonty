import Link from "next/link";

import { REEL_VIEWS, REEL_VIEW_CONFIG, type ReelView } from "../helpers/load-reels";

/**
 * التنقّل بين حالات الريل.
 *
 * روابط `<Link>` لا أزرار: الحالة تعيش في المسار (`/reels/published`)، فتُفتح في تبويب
 * جديد وتُنسخ وتُحفَظ ويرجع لها زرّ الرجوع. القاعدة: «URL reflects state — filters,
 * tabs, pagination» و«Links use <a>/<Link> (Cmd/Ctrl+click, middle-click support)».
 * الشريط المبنيّ على `useState` يفقد الثلاثة.
 *
 * والعدّاد جنب كل حالة يجيب سؤالاً قبل الضغط: هل فيه شيء هناك أصلاً؟ ولذلك يبقى
 * ظاهراً عند الصفر — «منشور ٠» معلومة، وغيابه سؤال.
 */
const TONE: Record<ReelView, string> = {
  pending: "data-[active=true]:bg-amber-500/15 data-[active=true]:text-amber-700 dark:data-[active=true]:text-amber-400",
  published: "data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-700 dark:data-[active=true]:text-emerald-400",
  rejected: "data-[active=true]:bg-red-500/15 data-[active=true]:text-red-700 dark:data-[active=true]:text-red-400",
  archived: "data-[active=true]:bg-slate-500/15 data-[active=true]:text-slate-700 dark:data-[active=true]:text-slate-300",
};

export function ReelViewNav({
  active,
  counts,
}: {
  active: ReelView;
  counts: Record<string, number>;
}) {
  return (
    <nav aria-label="حالات الريلز" className="flex flex-wrap gap-1.5">
      {REEL_VIEWS.map((view) => {
        const cfg = REEL_VIEW_CONFIG[view];
        const isActive = view === active;
        const count = counts[cfg.status] ?? 0;
        return (
          <Link
            key={view}
            href={`/reels/${view}`}
            data-active={isActive}
            // `aria-current="page"` هو ما يقوله قارئ الشاشة؛ اللون وحده لا يصل إليه.
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium",
              "transition-colors duration-150",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "[touch-action:manipulation]",
              TONE[view],
            ].join(" ")}
          >
            {cfg.title}
            <span
              className="rounded-full bg-foreground/10 px-1.5 py-px text-[11px] tabular-nums"
              // العدد زينة للرابط لا معلومة مستقلّة — اسم الحالة قبله يكفي القارئ.
              aria-hidden
            >
              {count.toLocaleString("ar-SA")}
            </span>
            <span className="sr-only">{`— ${count.toLocaleString("ar-SA")} ريل`}</span>
          </Link>
        );
      })}
    </nav>
  );
}
