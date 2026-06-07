"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { IconGift } from "@/lib/icons";

// Lazy — the sheet (perks + form + links) only loads on first open.
const MazayaSheet = dynamic(
  () => import("@/components/layout/MazayaSheet").then((m) => ({ default: m.MazayaSheet })),
  { ssr: false }
);

export function MazayaNavTrigger() {
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => { setEverOpened(true); setOpen(true); }}
        aria-haspopup="dialog"
        className="relative flex h-14 flex-col items-center justify-center border-b-2 border-transparent px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-primary"
      >
        <IconGift className="h-4 w-4" />
        <span className="mt-0.5">المزايا</span>
      </button>
      {everOpened && <MazayaSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
