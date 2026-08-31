"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";

import { cn } from "../../../../../lib/utils/index";
import type { HeaderData } from "../header-data";

/**
 * Radix's dialog is not in the first bundle. `ssr: false` + `dynamic` means the panel's
 * chunk is fetched on the FIRST tap of the burger and never on a visit that does not open
 * the menu — which is most visits. What ships up front is this button and one boolean.
 *
 * Why it moved off `<details>` at all: that version cost zero JS but was a dropdown wearing
 * a menu's clothes — no focus trap, no Escape, no close on outside tap, no scroll lock, and
 * `aria-expanded` was never announced. Radix's dialog gives all five for the price of a
 * chunk that only openers pay.
 */
const MobileMenuSheet = dynamic(
  () => import("./mobile-menu-sheet").then((m) => m.MobileMenuSheet),
  { ssr: false },
);

interface MobileMenuProps {
  data: HeaderData;
  light?: boolean;
  /**
   * حدّ الإخفاء حين يختلف عن الافتراضي. «الكبسولة» تعرض شريط روابطها من ١٢٨٠ فقط —
   * دونها يزحم الاسم — فتحتاج زرّ القائمة حتى `xl` لا حتى `md`.
   */
  hideAt?: string;
}

/** The phone menu every header shares below `md`. Five templates, one file. */
export function MobileMenu({ data, light = false, hideAt = "md:hidden" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="القائمة"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "grid h-11 w-11 cursor-pointer place-items-center rounded-full",
          hideAt,
          "motion-safe:transition-transform motion-safe:active:scale-95",
          light ? "text-white" : "text-foreground",
        )}
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

      {/* لا يُركَّب إلا بعد أوّل فتح — فالزيارة التي لا تفتح القائمة لا تنزّل الحزمة. */}
      {open ? <MobileMenuSheet data={data} open={open} onOpenChange={setOpen} /> : null}
    </>
  );
}
