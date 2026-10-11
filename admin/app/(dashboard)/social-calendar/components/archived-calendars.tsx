"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import { restoreSocialCalendar } from "../actions";

/** «المؤرشفة» أسفل القسم — مطويّة، وكل كاليندر بزرّ «استرجاع» (الأرشفة لا الحذف). */
export function ArchivedCalendars({ calendars, canRestore }: { calendars: { id: string; name: string }[]; canRestore: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (calendars.length === 0) return null;

  function restore(id: string) {
    startTransition(async () => {
      const res = await restoreSocialCalendar(id);
      if (!res.success) return void toast({ title: res.error, variant: "destructive" });
      toast({ title: "تم الاسترجاع", variant: "success" });
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-dashed border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
      >
        <span>
          المؤرشفة <span className="tabular-nums">({calendars.length})</span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {calendars.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="truncate text-foreground">{c.name}</span>
              {canRestore && (
                <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => restore(c.id)} className="gap-1.5">
                  <ArchiveRestore className="h-3.5 w-3.5" />
                  استرجاع
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
