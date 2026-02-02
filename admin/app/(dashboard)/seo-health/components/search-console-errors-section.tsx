import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StructuredDataError, ErrorTrend } from "@/lib/seo/search-console-api";

interface SearchConsoleErrorsSectionProps {
  errors: StructuredDataError[];
  trends: ErrorTrend[];
}

export function SearchConsoleErrorsSection({
  errors,
  trends,
}: SearchConsoleErrorsSectionProps) {
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
            <div className="flex items-center gap-2 text-green-500 py-4">
              <AlertTriangle className="h-5 w-5" />
              <span>لا توجد أخطاء في Search Console</span>
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
              Error Trends (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Trends in structured data errors over time
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
                        Previous: {trend.previousCount}
                      </span>
                      {trend.changePercentage !== 0 && (
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
                    <Badge
                      variant={
                        trend.trend === "increasing"
                          ? "destructive"
                          : trend.trend === "decreasing"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {trend.trend}
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