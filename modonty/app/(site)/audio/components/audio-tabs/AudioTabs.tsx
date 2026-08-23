"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AudioPanelName = "quran" | "articles";

interface AudioTabsState {
  active: AudioPanelName;
  setActive: (name: AudioPanelName) => void;
}

const AudioTabsContext = createContext<AudioTabsState | null>(null);

function useAudioTabs(): AudioTabsState {
  const ctx = useContext(AudioTabsContext);
  if (!ctx) throw new Error("AudioTabBar/AudioPanel must be rendered inside <AudioTabs>");
  return ctx;
}

/**
 * Phones only: two intents, one page, and one of them was 25 screens down.
 *
 * Measured 22 Aug on an iPhone 12: the page ran 17,589px and «المقالات المسموعة» — modonty's OWN
 * recordings — began at y=16,455. Nobody scrolls twenty-five screens, so on a phone the articles
 * did not exist. Both halves are first-class, so neither gets buried under the other: the choice
 * moves to the top and costs one tap.
 *
 * Desktop keeps the two columns side by side (Khalid, 20 Aug: «عمودان لا تبويبان») — that is what
 * a wide screen is for, and everything here is `md:hidden` / `max-md:hidden` so no desktop pixel
 * moves. Verified by measuring 1280 before and after.
 *
 * State lives in a context rather than in a wrapper element because the two panels sit in two
 * different slots of `TwoColumnLayout` (`main` and `rail`). Wrapping the rail in an extra div
 * would have broken its `lg:w-[300px]` flex sizing on desktop, which is exactly what must not
 * happen — so `AudioPanel` BECOMES the element instead of adding one.
 *
 * The three pieces share one private context and are meaningless apart, so they share a file.
 */
export function AudioTabs({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<AudioPanelName>("quran");
  return <AudioTabsContext.Provider value={{ active, setActive }}>{children}</AudioTabsContext.Provider>;
}

interface AudioTabBarProps {
  labels: { group: string; quran: string; articles: string };
}

export function AudioTabBar({ labels }: AudioTabBarProps) {
  const { active, setActive } = useAudioTabs();

  return (
    // Sticky under the 56px header: the switch stays reachable after scrolling into the mushaf,
    // which is the only moment someone realises they wanted the other half.
    // Not `role="tablist"`: on desktop both panels are visible with no visible tab bar, and a tab
    // widget whose tabs are hidden while its panels are all open is a lie to a screen reader.
    // Two toggle buttons say the true thing at both sizes.
    <div
      role="group"
      aria-label={labels.group}
      className="sticky top-[var(--sticky-chrome)] z-30 -mx-3 mt-4 flex gap-2 bg-background/95 px-3 py-2 backdrop-blur md:hidden"
    >
      {(["quran", "articles"] as const).map((name) => {
        const on = active === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => setActive(name)}
            aria-pressed={on}
            className={cn(
              "h-11 flex-1 rounded-xl text-sm font-bold motion-safe:transition-colors motion-safe:active:scale-95",
              on
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-card text-muted-foreground"
            )}
          >
            {labels[name]}
          </button>
        );
      })}
    </div>
  );
}

interface AudioPanelProps {
  name: AudioPanelName;
  /** `aside` for the articles rail, so its landmark and width classes survive untouched. */
  as?: "div" | "aside";
  className?: string;
  label?: string;
  children: ReactNode;
}

export function AudioPanel({ name, as = "div", className, label, children }: AudioPanelProps) {
  const { active } = useAudioTabs();
  const Tag = as;

  return (
    // `display:none` and not a mount/unmount: switching tabs must not tear down the `<audio>`
    // element mid-recitation, and a hidden subtree is out of the accessibility tree anyway.
    <Tag className={cn(className, active !== name && "max-md:hidden")} aria-label={label}>
      {children}
    </Tag>
  );
}
