import type { ReactNode } from "react";

/**
 * Inner pages of a partner site render from the shared block registries, and each block
 * carries its own container and bands (full-bleed like the home page) — so this layout is
 * a passthrough. The few pages that are not block-driven live under `(plain)/`, whose
 * layout restores the reading container.
 */
export default function PartnerInnerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
