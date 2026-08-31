"use client";

import { useState } from "react";
import { Copy, Check, Link2, ExternalLink } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * What the client's developer needs, on one screen, with nothing to install.
 *
 * There is no key. Everything this address returns is already printed on the client's
 * own public pages, so a secret would guard nothing while costing them a credential to
 * install and us one to rotate (Khalid 2026-08-09). The address carries their client id
 * and that is the whole identity — safe to read aloud over the phone.
 */
interface PullAddressPanelProps {
  clientId: string;
  articlesBaseUrl: string | null;
  suspended: boolean;
  lastFetchedAt: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_ARTICLES_API_BASE || "https://api.modonty.com/v1";

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

export function PullAddressPanel({
  clientId,
  articlesBaseUrl,
  suspended,
  lastFetchedAt,
}: PullAddressPanelProps) {
  const base = `${API_BASE}/sites/${clientId}`;

  const sampleCode = `const res = await fetch("${base}/articles", {
  next: { revalidate: 3600 },
});
const { articles } = await res.json();`;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Link2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ربط موقعك بمحتوانا
        </span>
        <span
          className={
            suspended ? "text-xs font-medium text-[hsl(var(--destructive-ink))]" : "text-xs font-medium text-emerald-600"
          }
        >
          {suspended ? "الخدمة موقوفة" : "الربط فعّال"}
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
        <CopyLine label="عنوان القائمة" value={`${base}/articles`} mono />
        <CopyLine label="عنوان مقال واحد" value={`${base}/articles/{slug}`} mono />
        <CopyLine label="جرّبه في الطرفية" value={`curl ${base}/articles`} mono />
        <CopyLine label="مثال جاهز — كاش ساعة" value={sampleCode} mono />
        {/* The one line the client's side has to carry. Everything else lives here. */}
        <CopyLine label="سطر واحد في robots.txt عندك" value={`Sitemap: ${base}/sitemap.xml`} mono />
      </div>

      {/* With no header to send, the address is openable in any browser — so the honest
          "try it" is the address itself, not a button that simulates it. */}
      <a
        href={`${base}/articles`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 hover:underline dark:text-violet-300"
      >
        افتح العنوان وشوف الردّ
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>

      <ul className="space-y-1 text-[11px] text-muted-foreground">
        <li>· ما فيه مفتاح ولا إعدادات — انسخ العنوان واستخدمه في موقعك مباشرة.</li>
        <li>· خريطة مقالاتك نستضيفها نحن وتتجدّد وحدها — تحطّ سطر <code dir="ltr">Sitemap</code> مرة واحدة وخلاص.</li>
        <li>· الردّ يجي جاهزاً للطباعة: العنوان والوصف والمتن والصورة بأبعادها والبطاقة المهيكلة.</li>
        <li>· اطبع البطاقة كما وصلتك داخل وسم <code dir="ltr">script</code> بلا تعديل — هي أساس ظهورك في جوجل.</li>
        <li>· الحدّ: ١٢٠ طلباً في الدقيقة. تجاوزه يرجّع <code dir="ltr">429</code>.</li>
      </ul>
    </Card>
  );
}
