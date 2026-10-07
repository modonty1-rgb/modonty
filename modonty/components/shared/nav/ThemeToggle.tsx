"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { ThemeToggleButton, type ThemeLabels } from "./ThemeToggleButton";

/**
 * The theme control, loaded on demand (plan أ١, 3 Oct 2026). The first load ships only the
 * sun/moon button; the Radix menu (~50KB gzip, measured in the local production build's
 * first-load chunks: dropdown-menu · focus-scope · remove-scroll) arrives when the reader
 * points at the button, focuses it, or taps it. A tap opens the menu as soon as it lands; the
 * placeholder while it loads is the very same button, so nothing moves.
 */
const loadMenu = () => import("./ThemeToggleMenu");

const ThemeToggleMenu = dynamic(() => loadMenu().then((m) => ({ default: m.ThemeToggleMenu })), {
  ssr: false,
  loading: () => <ThemeToggleButton label="" aria-hidden tabIndex={-1} />,
});

export function ThemeToggle({ labels }: { labels: ThemeLabels }) {
  const [open, setOpen] = useState(false);

  // Once tapped, the real menu takes over for good, opened on arrival.
  if (open) return <ThemeToggleMenu labels={labels} defaultOpen />;

  return (
    <ThemeToggleButton
      label={labels.toggle}
      // Pointing at it or tabbing to it only fetches the chunk (same module as the dynamic
      // import above, so the tap that follows finds it in cache); nothing re-renders.
      onPointerEnter={() => void loadMenu()}
      onFocus={() => void loadMenu()}
      onClick={() => setOpen(true)}
    />
  );
}
