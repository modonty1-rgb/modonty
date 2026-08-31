"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { checkClientSiteSeo, type ClientSiteSeoReport } from "../helpers/check-client-site-seo";

/**
 * Run on demand, never on page load: this fires real requests at the client's own server,
 * and a dashboard that quietly pings someone else's site every time it opens is a
 * dashboard that shows up in their logs as traffic they did not ask for.
 */
function Row({ status, message, recommendation }: { status: string; message: string; recommendation?: string }) {
  const icon =
    status === "pass" ? (
      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
    ) : status === "fail" ? (
      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--destructive-ink))]" aria-hidden="true" />
    ) : (
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
    );

  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon}
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block text-xs">{message}</span>
        {recommendation && (
          <span className="block text-[11px] text-muted-foreground">{recommendation}</span>
        )}
      </span>
    </div>
  );
}

export function SiteSeoCheck({ articlesBaseUrl }: { articlesBaseUrl: string }) {
  const [report, setReport] = useState<ClientSiteSeoReport | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setReport(null);
    try {
      setReport(await checkClientSiteSeo(articlesBaseUrl));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          فحص موقعك — هل جوجل يقدر يقرأ مقالاتك؟
        </span>
        <Button type="button" variant="outline" size="sm" onClick={run} disabled={loading}>
          {loading && <Loader2 className="me-2 h-3.5 w-3.5 animate-spin" />}
          افحص الآن
        </Button>
      </div>

      {!report && !loading && (
        <p className="text-xs text-muted-foreground">
          نفحص ملف <code dir="ltr">robots.txt</code> وخريطة موقعك، ونتأكد أن مسار مقالاتك مسموح
          لجوجل. الخريطة تبقى عندك على موقعك — نحن ننبّه فقط.
        </p>
      )}

      {report && (
        <div className="divide-y rounded-md border bg-muted/30 px-3">
          <Row {...report.articlesPath} />
          {report.robots.map((r, i) => (
            <Row key={`robots-${i}`} {...r} />
          ))}
          {report.sitemap.map((r, i) => (
            <Row key={`sitemap-${i}`} {...r} />
          ))}
        </div>
      )}
    </Card>
  );
}
