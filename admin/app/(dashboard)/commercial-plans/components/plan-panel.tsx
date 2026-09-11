"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PlanPanel({ defaultOpen, header, children }: { defaultOpen: boolean; header: ReactNode; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return <article className="rounded-xl border bg-card"><div className="flex min-h-16 items-center gap-3 p-3"><div className="min-w-0 flex-1">{header}</div><Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setOpen((value) => !value)} aria-label={open ? "إخفاء إعدادات الباقة" : "فتح إعدادات الباقة"} aria-expanded={open}><ChevronDown className={open ? "rotate-180 transition-transform" : "transition-transform"} /></Button></div>{open ? <div className="border-t p-3">{children}</div> : null}</article>;
}
