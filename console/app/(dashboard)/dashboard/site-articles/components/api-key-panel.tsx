"use client";

import { useState } from "react";
import { Copy, Check, KeyRound } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * What the client's developer needs, and nothing they could get wrong.
 *
 * The key itself is NOT shown here. It sits in Modonty's admin and is handed over once,
 * out of band — a credential printed on a page every account manager can open is a
 * credential that leaks. What this panel gives is the part that is safe to publish and
 * tedious to reconstruct: the address, the header shape, the cache setting, and what a
 * response looks like.
 */
interface ApiKeyPanelProps {
  articlesBaseUrl: string | null;
  hasKey: boolean;
  keySuspended: boolean;
  lastFetchedAt: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_ARTICLES_API_BASE || "https://api.modonty.com/v1";

const SAMPLE_CODE = `const res = await fetch("${API_BASE}/articles", {
  headers: { Authorization: \`Bearer \${process.env.MODONTY_API_KEY}\` },
  next: { revalidate: 3600 },
});
const { articles } = await res.json();`;

function CopyLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <span className="block text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <code
          dir="ltr"
          className={`flex-1 overflow-x-auto whitespace-pre rounded bg-muted px-2 py-1.5 text-[11px] ${mono ? "font-mono" : ""}`}
        >
          {value}
        </code>
        <Button type="button" variant="ghost" size="sm" onClick={copy} aria-label={`نسخ ${label}`}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

export function ApiKeyPanel({ articlesBaseUrl, hasKey, keySuspended, lastFetchedAt }: ApiKeyPanelProps) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ربط موقعك بمحتوانا
        </span>
        <span
          className={
            keySuspended
              ? "text-xs font-medium text-destructive"
              : hasKey
                ? "text-xs font-medium text-emerald-600"
                : "text-xs font-medium text-muted-foreground"
          }
        >
          {keySuspended ? "الخدمة موقوفة" : hasKey ? "الربط فعّال" : "المفتاح ما أُصدر بعد"}
        </span>
      </div>

      <dl className="grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">عنوان مقالاتك</dt>
          <dd className="font-mono text-[11px]" dir="ltr">
            {articlesBaseUrl ?? "—"}
          </dd>
        </div>
        <div>
          {/* The one number that says whether the integration is alive. Empty means their
              site has never once asked us for content — a silent break, made visible. */}
          <dt className="text-muted-foreground">آخر مرّة سحب موقعك المحتوى</dt>
          <dd className="font-medium">{lastFetchedAt ?? "ما سحب بعد"}</dd>
        </div>
      </dl>

      <div className="space-y-2 rounded-md border bg-muted/30 p-3">
        <CopyLine label="عنوان القائمة" value={`${API_BASE}/articles`} mono />
        <CopyLine label="عنوان مقال واحد" value={`${API_BASE}/articles/{slug}`} mono />
        <CopyLine label="ترويسة المصادقة" value="Authorization: Bearer <مفتاحك>" mono />
        <CopyLine label="مثال جاهز — كاش ساعة" value={SAMPLE_CODE} mono />
      </div>

      <ul className="space-y-1 text-[11px] text-muted-foreground">
        <li>· الردّ يجي جاهزاً للطباعة: العنوان والوصف والمتن والصورة بأبعادها والبطاقة المهيكلة.</li>
        <li>· اطبع البطاقة كما وصلتك داخل وسم <code dir="ltr">script</code> بلا تعديل — هي أساس ظهورك في جوجل.</li>
        <li>· الحدّ: ١٢٠ طلباً في الدقيقة لكل مفتاح. تجاوزه يرجّع <code dir="ltr">429</code>.</li>
        <li>· ضاع المفتاح أو تسرّب؟ كلّمنا ونصدر لك غيره — لا تنشره في كود المتصفّح.</li>
      </ul>
    </Card>
  );
}
