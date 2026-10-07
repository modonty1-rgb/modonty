"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { AccountBenefitsTrigger } from "./AccountBenefitsTrigger";

// The benefits menu (Radix DropdownMenu) loads on the first tap, not with every page (plan أ١,
// 3 Oct 2026). Until then the phone shows the same icon and hint; the placeholder while the
// menu lands is that same icon, so nothing moves.
const loadDropdown = () => import("./MobileAccountBenefitsDropdown");
const MobileAccountBenefitsDropdown = dynamic(
  () => loadDropdown().then((m) => ({ default: m.MobileAccountBenefitsDropdown })),
  { ssr: false, loading: () => <span className="inline-block size-11 sm:hidden" aria-hidden /> },
);

/** `hint` — the «مزاياك هنا» bubble under the icon. Off inside the thin partner-site platform bar, where it spilled over the partner's own header. */
export function MobileAccountBenefitsMenu({ hint = true }: { hint?: boolean } = {}) {
  const [open, setOpen] = useState(false);

  if (open) return <MobileAccountBenefitsDropdown hint={hint} defaultOpen />;

  return (
    <div className="relative sm:hidden">
      <AccountBenefitsTrigger
        hint={hint}
        isOpen={false}
        aria-haspopup="menu"
        onPointerEnter={() => void loadDropdown()}
        onFocus={() => void loadDropdown()}
        onClick={() => setOpen(true)}
      />
    </div>
  );
}
