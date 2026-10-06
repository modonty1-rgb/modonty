"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";

import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";
import { IconComment, IconLike, IconSaved, IconShare } from "@/lib/icons";

type BarProps = ComponentProps<typeof import("./TopEngagementBar").ArticleTopEngagementBar>;
type Action = "like" | "save" | "comment" | "share";

// The real bar (likes, saves, the comment dialog, the sign-in prompt, share) loads on the first
// touch of these buttons — not with the page (Khalid, 3 Oct 2026: «البوتونز… ما تشتغل إلا لما
// يضغط عليها… البرفورمانس تبع الموبايل»). A finger landing on the row is enough to start it.
const loadBar = () => import("./TopEngagementBar");
const RealBar = dynamic(() => loadBar().then((m) => ({ default: m.ArticleTopEngagementBar })), { ssr: false });

const ICONS: Record<Action, typeof IconLike> = { like: IconLike, save: IconSaved, comment: IconComment, share: IconShare };

/**
 * The phone's outline-bar actions, drawn as plain buttons until one is touched. The first tap
 * mounts the real bar and replays itself on the matching button, so the reader's tap is never
 * lost — it just arrives one chunk later.
 */
export function EngagementBarOnDemand(props: BarProps) {
  const [pending, setPending] = useState<Action | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pending) return;
    // Wait for the real buttons to land, then hand them the tap.
    let tries = 0;
    const id = window.setInterval(() => {
      const btn = boxRef.current?.querySelector<HTMLButtonElement>(`[data-engagement="${pending}"]`);
      if (btn || ++tries > 40) {
        window.clearInterval(id);
        btn?.click();
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [pending]);

  if (pending) {
    return (
      <div ref={boxRef}>
        <RealBar {...props} />
      </div>
    );
  }

  const counts: Partial<Record<Action, number>> = { like: props.likes, save: props.favorites };
  return (
    <div className="flex items-start gap-2" onPointerDown={() => void loadBar()} onFocusCapture={() => void loadBar()}>
      {(Object.keys(ICONS) as Action[]).map((a) => {
        const Icon = ICONS[a];
        const n = counts[a] ?? 0;
        return (
          <button
            key={a}
            type="button"
            aria-label={props.labels[a]}
            onClick={() => setPending(a)}
            className="relative flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-xs font-semibold leading-none text-foreground"
          >
            <Icon className="size-[16px]" />
            {n > 0 && (
              <span className="absolute end-0.5 top-0.5 min-w-[16px] rounded-full bg-background px-1 text-xs leading-[16px] text-foreground shadow tabular-nums ring-1 ring-border">
                {n.toLocaleString(SITE_LOCALE)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
