"use client";

import dynamic from "next/dynamic";
import type { ClientHeroSlide } from "@/app/api/helpers/client-queries";
import type { FilterOption } from "./types";

// Golden rule (modonty): client-side is last resort, and when unavoidable it MUST be lazy.
// The interactive shell (Sheet/Tabs) is loaded client-only — kept out of the critical path.
const HomeBottomBarShell = dynamic(
  () =>
    import("./HomeBottomBarShell").then((m) => ({
      default: m.HomeBottomBarShell,
    })),
  { ssr: false }
);

interface HomeBottomBarLoaderProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  partners: FilterOption[];
  heroSlides: ClientHeroSlide[];
}

export function HomeBottomBarLoader(props: HomeBottomBarLoaderProps) {
  return <HomeBottomBarShell {...props} />;
}
