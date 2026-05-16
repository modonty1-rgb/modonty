"use client";

import dynamic from "next/dynamic";
import { StorySkeleton } from "./StorySkeleton";
import type { SalesPitchProps } from "./SalesPitchPage";

const SalesPitchPage = dynamic(
  () => import("./SalesPitchPage").then((m) => ({ default: m.SalesPitchPage })),
  {
    ssr: false,
    loading: () => <StorySkeleton />,
  },
);

export function StoryClientLoader(props: SalesPitchProps) {
  return <SalesPitchPage {...props} />;
}
