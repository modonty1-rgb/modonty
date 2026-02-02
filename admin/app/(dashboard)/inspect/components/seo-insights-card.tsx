"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SeoInsights } from "../helpers/source-info";

interface SeoInsightsCardProps {
  insights: SeoInsights;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
      )}
      <span className={ok ? "text-muted-foreground" : "text-amber-600"}>{label}</span>
    </span>
  );
}

const DOCS_URL =
  "https://developers.google.com/search/docs/appearance/snippet";

export function SeoInsightsCard({ insights }: SeoInsightsCardProps) {
  if (insights.type === "unknown") return null;

  return (
    <Card className="border-muted/50">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            SEO Insights
          </div>
          <Link
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            title="Google Search Central guidelines"
          >
            Rules <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4 space-y-2">
        {insights.type === "meta" && insights.meta && insights.rules && (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Title: {insights.meta.titleLength} chars ({insights.rules.titleRange})
                </span>
                <StatusBadge
                  ok={insights.meta.titleOk}
                  label={insights.meta.titleOk ? "OK" : "Check"}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  Desc: {insights.meta.descLength} chars ({insights.rules.descRange})
                </span>
                <StatusBadge
                  ok={insights.meta.descOk}
                  label={insights.meta.descOk ? "OK" : "Check"}
                />
              </div>
            </div>
            {insights.meta.robots && (
              <div>
                <span className="text-xs text-muted-foreground">Robots: </span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{insights.meta.robots}</code>
              </div>
            )}
          </>
        )}
        {insights.type === "jsonld" && insights.jsonld && (
          <>
            <div className="flex flex-wrap gap-1">
              {insights.jsonld.schemaTypes.slice(0, 8).map((t) => (
                <Badge key={t} variant="secondary" className="font-normal text-xs">
                  {t}
                </Badge>
              ))}
              {insights.jsonld.schemaTypes.length > 8 && (
                <Badge variant="outline" className="font-normal text-xs">
                  +{insights.jsonld.schemaTypes.length - 8}
                </Badge>
              )}
            </div>
            {insights.jsonld.mainItemType && (
              <div>
                <span className="text-xs text-muted-foreground">List items: </span>
                <span className="text-sm font-medium">{insights.jsonld.mainItemType}</span>
              </div>
            )}
            {insights.jsonld.itemCountOk === false && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">numberOfItems should match itemListElement length (Schema.org)</span>
              </div>
            )}
            {insights.jsonld.primaryUrl && (
              <div className="truncate">
                <span className="text-xs text-muted-foreground">URL: </span>
                <span className="text-xs font-mono truncate block" title={insights.jsonld.primaryUrl}>
                  {insights.jsonld.primaryUrl}
                </span>
              </div>
            )}
            {insights.jsonld.languages.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Languages: </span>
                <span className="text-sm">{insights.jsonld.languages.join(", ")}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
