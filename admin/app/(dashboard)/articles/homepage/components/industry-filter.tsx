"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * **المجالُ قائمةً منسدلة لا أزراراً** (خالد ٢٤ سبتمبر ٢٠٢٦: «خلّي التوجلز الرئيسية موجودة والباقي
 * دروب داون»). «الكل / المختارة» تبقى زرّين — هما الفلترُ الأكثر استعمالاً؛ وثمانيةُ مجالاتٍ أزراراً
 * كانت تملأ سطرين. يُبقي البحثَ والعرضَ الحاليّ عند تغيير المجال.
 */
export function IndustryFilter({ industries }: { industries: Array<[string, string]> }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("industry") ?? "";

  return (
    <select
      aria-label="المجال"
      value={current}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        if (e.target.value) next.set("industry", e.target.value);
        else next.delete("industry");
        const s = next.toString();
        router.push(`/articles/homepage${s ? `?${s}` : ""}`);
      }}
      className="h-8 rounded-md border bg-card px-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <option value="">كل المجالات</option>
      {industries.map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}
