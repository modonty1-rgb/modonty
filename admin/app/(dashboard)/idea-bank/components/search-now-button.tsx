"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requestFieldSearch } from "../actions/request-field-search";

/** «ابحث الآن» — يسجّل طلباً يلتقطه الرادار خلال ٥ دقائق، ويعرض سبب الرفض إن رُفض. */
export function SearchNowButton({ field, fieldName, busy }: { field: string; fieldName: string; busy: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        disabled={pending || busy}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await requestFieldSearch({ field });
            if (!r.success) setError(r.error ?? "تعذّر الطلب");
            router.refresh();
          })
        }
      >
        ابحث الآن عن «{fieldName}»
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
