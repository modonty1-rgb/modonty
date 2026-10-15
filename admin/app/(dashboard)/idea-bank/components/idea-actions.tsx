"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setIdeaStatus } from "../actions/set-idea-status";

type Status = "NEW" | "WATCH" | "APPROVED" | "REJECTED" | "USED";
type Act = { to: Exclude<Status, "USED">; label: string; variant: "default" | "outline" | "ghost" };

/** كل الانتقالات — تظهر كاملةً داخل التفاصيل. */
const FULL: Record<Status, Act[]> = {
  NEW: [
    { to: "APPROVED", label: "اعتماد", variant: "default" },
    { to: "WATCH", label: "متابعة", variant: "outline" },
    { to: "REJECTED", label: "رفض", variant: "ghost" },
  ],
  WATCH: [
    { to: "APPROVED", label: "اعتماد", variant: "default" },
    { to: "REJECTED", label: "رفض", variant: "ghost" },
    { to: "NEW", label: "إرجاع لجديدة", variant: "ghost" },
  ],
  // «كُتبت» ليست زرّاً هنا: تمرّ بربط المقال في التفاصيل (`article-linker.tsx`) ليُقاس أثرها
  APPROVED: [{ to: "NEW", label: "إرجاع لجديدة", variant: "ghost" }],
  REJECTED: [{ to: "NEW", label: "إرجاع لجديدة", variant: "ghost" }],
  USED: [{ to: "APPROVED", label: "إرجاع لمعتمدة", variant: "ghost" }],
};

/** الصفّ يحمل القرار الأوّل وحده — «اعتماد» و«رفض» — والباقي خلف «+». */
const COMPACT: Record<Status, Status[]> = {
  NEW: ["APPROVED", "REJECTED"],
  WATCH: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: ["NEW"],
  USED: [],
};

export function IdeaActions({ id, status, compact = false }: { id: string; status: Status; compact?: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const acts = compact ? FULL[status].filter((a) => COMPACT[status].includes(a.to)) : FULL[status];
  return (
    <div className="flex flex-nowrap gap-1.5">
      {acts.map((a) => (
        <Button
          key={a.to}
          size="sm"
          variant={a.variant}
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation(); // الصفّ نفسه يفتح التفاصيل — الزرّ قرارٌ لا فتح
            start(async () => {
              const r = await setIdeaStatus({ id, status: a.to });
              if (r.success) router.refresh();
            });
          }}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}
