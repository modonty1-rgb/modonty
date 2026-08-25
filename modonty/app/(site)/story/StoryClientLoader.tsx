"use client";

import dynamic from "next/dynamic";
import { StorySkeleton } from "./StorySkeleton";
import type { SalesPitchProps } from "./SalesPitchPage";

const SalesPitchPage = dynamic(
  () => import("./SalesPitchPage").then((m) => ({ default: m.SalesPitchPage })),
  {
    loading: () => <StorySkeleton />,
  },
);

// Props pass straight through — the legal entity is read on the server and handed down,
// so this client bundle never reaches for the database or a constant of its own.
export function StoryClientLoader(props: SalesPitchProps) {
  return <SalesPitchPage {...props} />;
}
