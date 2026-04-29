import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gauge, ExternalLink, Smartphone, Monitor } from "lucide-react";
import type { PagespeedScores, PagespeedStrategyScores } from "@/lib/health/pagespeed";

function colorFor(score: number | null): string {
  if (score == null) return "bg-muted text-muted-foreground ring-border";
  if (score >= 90) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (score >= 50) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function ScoreCircle({ label, score }: { label: string; score: number | null }) {
  const cls = colorFor(score);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`grid h-14 w-14 place-items-center rounded-full ring-2 ${cls}`}>
        <p className="text-lg font-bold tabular-nums leading-none">
          {score ?? "—"}
        </p>
      </div>
      <p className="text-[11px] font-medium text-foreground text-center">{label}</p>
    </div>
  );
}

function StrategyBlock({
  data,
  icon: Icon,
  label,
}: {
  data: PagespeedStrategyScores;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  if (!data.available) {
    return (
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{label}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          ⚠️ غير متاح: {data.error ?? "Google لم يُرجع نتائج"}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreCircle label="الأداء" score={data.performance} />
        <ScoreCircle label="سهولة الوصول" score={data.accessibility} />
        <ScoreCircle label="أفضل الممارسات" score={data.bestPractices} />
        <ScoreCircle label="SEO" score={data.seo} />
      </div>
      {(data.cwv.lcpDisplay || data.cwv.clsDisplay || data.cwv.fcpDisplay) && (
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-md border bg-muted/30 p-2 text-center">
          <div>
            <p className="text-[11px] text-muted-foreground">LCP</p>
            <p className="text-sm font-semibold tabular-nums">
              {data.cwv.lcpDisplay ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">CLS</p>
            <p className="text-sm font-semibold tabular-nums">
              {data.cwv.clsDisplay ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">FCP</p>
            <p className="text-sm font-semibold tabular-nums">
              {data.cwv.fcpDisplay ?? "—"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PagespeedCard({
  scores,
  url,
}: {
  scores: PagespeedScores;
  url: string;
}) {
  const gMobileUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=mobile`;
  const gDesktopUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=desktop`;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4 text-primary" />
          درجات Google PageSpeed
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center justify-between gap-2">
          <span>الأرقام مباشرة من Google — مصدر الحقيقة الرسمي</span>
          <span className="flex items-center gap-3">
            <a href={gMobileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Mobile <ExternalLink className="h-3 w-3" />
            </a>
            <a href={gDesktopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Desktop <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <StrategyBlock data={scores.mobile} icon={Smartphone} label="📱 موبايل" />
        <StrategyBlock data={scores.desktop} icon={Monitor} label="💻 كمبيوتر" />

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          ملاحظة: Lighthouse غير حتمي — تشغيلين متتاليين قد يعطون أرقام مختلفة (±5-10 نقاط). لو الفرق أكبر من 10 نقاط، افتح الرابط أعلاه للمقارنة.
        </p>
      </CardContent>
    </Card>
  );
}
