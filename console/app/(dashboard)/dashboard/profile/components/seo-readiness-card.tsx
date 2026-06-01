import { CheckCircle2, XCircle, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

interface SeoReadinessCardProps {
  /** Raw client row (loose shape) — mapped to the scorer input internally. */
  client: Record<string, unknown>;
}

// Read-only "جاهزية SEO" card shown near the top of the profile so the client
// sees how index-ready their page is. Score comes from the currently stored
// cached SEO (a save + regen refreshes it on the next page load).
export function SeoReadinessCard({ client }: SeoReadinessCardProps) {
  const { score, checks } = computeClientSeoScore(clientToSeoInput(client));

  const tone =
    score >= 80
      ? {
          ring: "text-emerald-600",
          track: "text-emerald-100",
          chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
          bar: "bg-emerald-500",
        }
      : score >= 50
        ? {
            ring: "text-amber-500",
            track: "text-amber-100",
            chip: "bg-amber-50 text-amber-700 border-amber-200",
            bar: "bg-amber-500",
          }
        : {
            ring: "text-red-500",
            track: "text-red-100",
            chip: "bg-red-50 text-red-700 border-red-200",
            bar: "bg-red-500",
          };

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        {/* Score block */}
        <div className="flex items-center gap-4 sm:min-w-[14rem]">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl grid place-items-center bg-primary/10 text-primary">
            <Search className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">جاهزية SEO</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold border tabular-nums ${tone.chip}`}
              >
                {score}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              مدى جاهزية صفحتك للظهور في نتائج البحث
            </p>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${tone.bar}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 flex-1 sm:border-s sm:ps-5">
          {checks.map((c) => {
            const good = c.status === "good";
            return (
              <li key={c.key} className="flex items-center gap-1.5 text-sm" title={c.hint}>
                {good ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                )}
                <span className={good ? "text-foreground" : "text-muted-foreground"}>
                  {c.label}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
