"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ActivateOrderDialog, type ActivatableOrder } from "./activate-order-dialog";

/** يحمل حالة النافذة للصفّ الواحد — الصفحة نفسها تبقى مكوّنَ خادم. */
export function ActivateOrderButton({ order }: { order: ActivatableOrder }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="h-7 gap-1.5 px-2.5 text-[12px]" onClick={() => setOpen(true)}>
        <UserCheck className="size-3.5" />
        فعّل
      </Button>
      <ActivateOrderDialog order={order} open={open} onOpenChange={setOpen} />
    </>
  );
}
