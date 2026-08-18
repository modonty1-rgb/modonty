import type { ReactNode } from "react";

/** The reading container for pages that are not block-driven (reels · followers · likes · mentions). */
export default function PlainInnerLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1216px] px-4 pb-20 pt-8">{children}</div>;
}
