"use client";

import { useEffect, useState } from "react";

const N = new Intl.NumberFormat("ar-EG");
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * العدّاد التنازلي لمهلة الموافقة. الوقت يُحسب في المتصفّح بعد التركيب — لو حُسب على
 * الخادم لاختلف الرقمان عند الترطيب — فيُحجز مكانه بنفس المقاس حتى لا يقفز البانر.
 */
export function ApprovalCountdown({ deadline }: { deadline: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="h-[52px] w-[168px]" aria-hidden />;

  const left = new Date(deadline).getTime() - now;
  if (left <= 0) {
    return (
      <p className="rounded-md bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950 dark:bg-amber-500/20 dark:text-amber-100">
        انتهت المهلة — سيعتمده فريق مدونتي
      </p>
    );
  }

  const units = [
    { value: Math.floor(left / DAY), label: "يوم" },
    { value: Math.floor((left % DAY) / HOUR), label: "ساعة" },
    { value: Math.floor((left % HOUR) / MINUTE), label: "دقيقة" },
  ];

  return (
    <div role="timer" aria-label="الوقت المتبقّي على مهلة الموافقة" className="flex items-center gap-1.5">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-[52px] flex-col items-center rounded-md bg-white py-1 shadow-sm ring-1 ring-amber-300/60 dark:bg-amber-500/15 dark:ring-amber-500/30"
        >
          <span className="text-base font-bold leading-tight tabular-nums text-amber-950 dark:text-amber-100">
            {N.format(u.value)}
          </span>
          <span className="text-[11px] leading-tight text-amber-900/80 dark:text-amber-100/75">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
