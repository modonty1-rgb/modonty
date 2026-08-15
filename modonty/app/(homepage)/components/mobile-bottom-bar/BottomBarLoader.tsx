"use client";

import dynamic from "next/dynamic";
import type { ClientServiceAction, FilterOption } from "./types";

// Golden rule (modonty): client-side is last resort, and when unavoidable it MUST be lazy.
// The interactive shell (Sheet/Tabs) is loaded client-only — kept out of the critical path.
const BottomBarShell = dynamic(
  () =>
    import("./BottomBarShell").then((m) => ({
      default: m.BottomBarShell,
    })),
  { ssr: false }
);

interface BottomBarLoaderProps {
  categories: FilterOption[];
  industries: FilterOption[];
  tags: FilterOption[];
  partners: FilterOption[];
  services: ClientServiceAction[];
}

export function BottomBarLoader(props: BottomBarLoaderProps) {
  return <BottomBarShell {...props} />;
}
