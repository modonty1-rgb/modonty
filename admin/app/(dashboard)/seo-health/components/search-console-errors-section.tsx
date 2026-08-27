import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, CheckCircle, HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StructuredDataError, ErrorTrend } from "@/lib/seo/search-console-api";

/**
 * What we know about Search Console right now. "We could not read it" is its own state:
 * folding it into an empty error list is what printed a green all-clear over a failed read.
 */
export type SearchConsoleSnapshot =
  | { status: "not-configured" }
  | { status: "unavailable"; reason: string }
  | { status: "read"; errors: StructuredDataError[]; trends: ErrorTrend[] };

interface SearchConsoleErrorsSectionProps {
  snapshot: SearchConsoleSnapshot;
}

export function SearchConsoleErrorsSection({
  snapshot,
}: SearchConsoleErrorsSectionProps) {
  if (snapshot.status === "not-configured") {
    return null;
  }

  if (snapshot.status === "unavailable") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-500" />
            Search Console — not measured
          </CardTitle>
          <CardDescription>
            Structured data was NOT checked this time. This is not an all-clear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {snapshot.reason}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { errors, trends } = snapshot;
  const criticalErrors = errors.filter((e) => e.severity === "ERROR");
  const warnings = errors.filter((e) => e.severity === "WARNING");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Search Console Errors
          </CardTitle>
          <CardDescription>
            Structured data errors detected by Google Search Console
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-500 py-4">
              <CheckCircle className="h-5 w-5" />
              <span>Google was asked, and reported no structured-data issues</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Badge variant="destructive">
                  {criticalErrors.length} Critical Errors
                </Badge>
                <Badge variant="secondary">
                  {warnings.length} Warnings
                </Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              error.severity === "ERROR"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {error.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.firstDetected).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{error.description}</p>
                        {error.url && (
                          <a
                            href={error.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 block"
                          >
                            {error.url}
                          </a>
                        )}
                        {error.affectedItems && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Affected: {error.affectedItems} item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Errors by type — snapshot
            </CardTitle>
            <CardDescription>
              Counts as of this inspection. Search Console does not serve past
              rich-results issues, so the direction of travel is not measured
              until we store our own snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trends.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{trend.errorType}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Current: {trend.currentCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Previous:{" "}
                        {trend.previousCount === null
                          ? "not measured"
                          : trend.previousCount}
                      </span>
                      {trend.changePercentage !== null &&
                        trend.changePercentage !== 0 && (
                          <span
                            className={`text-xs ${
                              trend.trend === "increasing"
                                ? "text-red-500"
                                : trend.trend === "decreasing"
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {trend.changePercentage > 0 ? "+" : ""}
                            {trend.changePercentage.toFixed(1)}%
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.trend === "increasing" && (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                    {trend.trend === "decreasing" && (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    {trend.trend === "stable" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    {trend.trend === "not-measured" && (
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge
                      variant={
                        trend.trend === "increasing"
                          ? "destructive"
                          : trend.trend === "decreasing"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {trend.trend === "not-measured"
                        ? "trend not measured"
                        : trend.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}