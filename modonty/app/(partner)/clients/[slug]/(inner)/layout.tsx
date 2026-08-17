import type { ReactNode } from "react";

/**
 * Every inner page of a partner site (services · about · photos · reviews · articles ·
 * faq · contact · book …) sits in the same reading container. The home page is NOT in
 * this group on purpose — its hero and bands run full-bleed.
 */
export default function PartnerInnerLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1216px] px-4 pb-20 pt-8">{children}</div>;
}
