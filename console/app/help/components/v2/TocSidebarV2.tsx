"use client";

import { useEffect, useState } from "react";
import { tiers } from "../../data/guide-v2";

export function TocSidebarV2() {
  const [activeId, setActiveId] = useState(tiers[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    tiers.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <aside
      data-master="toc"
      className="md:fixed md:top-4 md:bottom-4 md:start-4 md:w-[260px] lg:w-[280px] md:overflow-y-auto bg-card border border-border rounded-2xl p-4 lg:p-5 z-20 shadow-md"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="font-extrabold text-foreground">مودونتي · بوابة العملاء</span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">دليل الاستخدام</p>

      <nav className="space-y-1.5">
        {tiers.map((tier) => {
          const isActive = activeId === tier.id;
          return (
            <a
              key={tier.id}
              href={`#${tier.id}`}
              className={
                "block rounded-lg transition-all p-3 " +
                (isActive
                  ? "bg-primary/10 border border-primary/20"
                  : "border border-transparent hover:bg-muted")
              }
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={
                    "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 " +
                    (isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {tier.num}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className={
                      "text-sm font-bold truncate " +
                      (isActive ? "text-primary" : "text-foreground")
                    }
                  >
                    {tier.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {tier.subtitle}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </nav>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          ⏱ وقت القراءة الكامل: ١٠ دقائق · ١١ لقطة شاشة من موقعك الحقيقي
        </p>
      </div>
    </aside>
  );
}
