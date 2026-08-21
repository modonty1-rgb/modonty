"use client";

import { useEffect, useState } from "react";

import { IconUser, IconShield, IconSettings } from "@/lib/icons";
import { cn } from "@/lib/utils";

// Three sections only — the reader-account standard (Khalid 2026-08-20, best-practice
// review): identity · security · account. «المظهر» was removed because its save wrote an
// empty object, and «الإشعارات» because nothing in the codebase reads its toggles — a
// setting that promises and does nothing is what scares a subscriber off.
export const SETTINGS_SECTIONS = [
  { id: "profile", label: "الملف الشخصي", icon: IconUser },
  { id: "security", label: "الأمان", icon: IconShield },
  // IconSettings, not the trash can: the nav icon is the section's face, and a trash icon
  // reads as «delete my account» before the reader even opens it (Khalid 2026-08-21).
  { id: "account", label: "الحساب", icon: IconSettings },
] as const;

/**
 * The rail nav for the stacked settings page (Khalid 2026-08-20: «كل حاجة تكون قدامنا») —
 * anchors, not tabs: every section is already on the page, the rail only scrolls to it.
 * The highlight follows the scroll with one IntersectionObserver over the five sections.
 */
export function SettingsNav() {
  const [active, setActive] = useState<string>(SETTINGS_SECTIONS[0].id);

  useEffect(() => {
    // The last section is short: it never reaches the observer's top band, so at the very
    // bottom of the page it could never highlight (measured live: stuck on «المظهر»).
    // Reaching the bottom IS being at the last section — and the check lives INSIDE the
    // observer callback too, or the observer overwrites the scroll listener's answer.
    const atPageBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const io = new IntersectionObserver(
      (entries) => {
        if (atPageBottom()) {
          setActive(SETTINGS_SECTIONS[SETTINGS_SECTIONS.length - 1].id);
          return;
        }
        // The topmost visible section wins — with a top-biased rootMargin the "current"
        // section is the one under the reader's eyes, not the one entering at the fold.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    for (const s of SETTINGS_SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    const onScroll = () => {
      if (atPageBottom()) {
        setActive(SETTINGS_SECTIONS[SETTINGS_SECTIONS.length - 1].id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav aria-label="أقسام الإعدادات" className="rounded-xl border bg-card p-2">
      <ul className="space-y-1">
        {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={active === id ? "true" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
