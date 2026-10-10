"use client";

import { useState } from "react";

const N = new Intl.NumberFormat("ar-EG");

/**
 * «باختصار» — على الجوال النقطةُ الأولى فقط، والباقي بزرّ (تدقيق الجوال، خالد ٣ أكتوبر ٢٠٢٦: «Fix all»).
 * كان الصندوقُ ٤١٥px على ٣٦٠، فبدأ نصُّ المقال عند ١٢١٨px — شاشتان قبل أوّل سطر. النقطةُ الأولى تجيب
 * السؤال، ومَن يريد البقيّة يضغط. ومن `lg` تظهر كلُّها كما كانت — في العمود العريض لا تأكل الشاشة.
 */
export function KeyPoints({ title, points }: { title: string; points: string[] }) {
  const [open, setOpen] = useState(false);
  const rest = points.length - 1;
  return (
    <div className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-3.5 py-3 lg:mb-5 lg:p-4">
      <p className="mb-1.5 text-sm font-bold text-primary">⚡ {title}</p>
      <ul className="space-y-1.5 ps-5 text-sm leading-relaxed text-foreground/85 [&>li]:list-disc">
        {points.map((point, i) => (
          <li key={i} className={i > 0 && !open ? "hidden lg:list-item" : undefined}>
            {point}
          </li>
        ))}
      </ul>
      {rest > 0 && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1.5 inline-flex min-h-11 items-center text-[13px] font-bold text-link hover:underline lg:hidden"
        >
          اعرض الملخص كاملاً (+{N.format(rest)})
        </button>
      ) : null}
    </div>
  );
}
