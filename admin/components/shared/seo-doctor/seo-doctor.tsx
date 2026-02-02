"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Stethoscope,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";

export interface SEOHealthCheck {
  field: string;
  status: "good" | "warning" | "error" | "info";
  message: string;
  score: number;
}

export interface SEOFieldValidator {
  (value: unknown, data: Record<string, unknown>): {
    status: "good" | "warning" | "error" | "info";
    message: string;
    score: number;
  };
}

export interface SEOFieldConfig {
  name: string;
  label: string;
  validator: SEOFieldValidator;
}

export interface SEODoctorConfig {
  entityType: string;
  fields: SEOFieldConfig[];
  maxScore: number;
  generateStructuredData: (data: Record<string, unknown>) => Record<string, unknown>;
}

export interface SEODoctorProps {
  data: Record<string, unknown>;
  config: SEODoctorConfig;
  title?: string;
}

export function SEODoctor({ data, config, title = "SEO Doctor" }: SEODoctorProps) {
  const scoreResult = useMemo(() => calculateSEOScore(data, config), [data, config]);

  const healthChecks = useMemo(() => {
    const checks: SEOHealthCheck[] = [];
    const seenFields = new Set<string>();

    for (const fieldConfig of config.fields) {
      if (seenFields.has(fieldConfig.name)) {
        continue;
      }
      seenFields.add(fieldConfig.name);
      
      const value = data[fieldConfig.name];
      const result = fieldConfig.validator(value, data);

      checks.push({
        field: fieldConfig.label,
        status: result.status,
        message: result.message,
        score: result.score,
      });
    }

    return { checks, totalScore: scoreResult.score, maxScore: scoreResult.maxScore };
  }, [data, config, scoreResult]);

  const scorePercentage = scoreResult.percentage;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getStatusIcon = (status: SEOHealthCheck["status"]) => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
      case "error":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Info className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const errorCount = healthChecks.checks.filter(c => c.status === "error").length;
  const warningCount = healthChecks.checks.filter(c => c.status === "warning").length;
  const goodCount = healthChecks.checks.filter(c => c.status === "good").length;

  // Only show fields that are not fully healthy so the user immediately sees
  // what is blocking 100% (errors and warnings first, then info).
  const problematicChecks = useMemo(() => {
    const important = healthChecks.checks.filter(
      (c) => c.status === "error" || c.status === "warning"
    );
    const info = healthChecks.checks.filter((c) => c.status === "info");

    // If everything is good, fall back to showing a single “all good” item.
    if (important.length === 0 && info.length === 0) {
      return healthChecks.checks.filter((c) => c.status === "good");
    }

    return [...important, ...info];
  }, [healthChecks.checks]);

  return (
    <div className="w-full">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer w-full">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">SEO</span>
            </div>
            <div className="flex-1 min-w-0">
              <Progress value={scorePercentage} className="h-1.5" />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {errorCount > 0 && (
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-xs font-medium text-red-600">{errorCount}</span>
                  </div>
                )}
                {warningCount > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-600">{warningCount}</span>
                  </div>
                )}
                {goodCount > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-600">{goodCount}</span>
                  </div>
                )}
              </div>
              <Badge
                variant={getScoreBadgeVariant(scorePercentage)}
                className={cn(
                  "text-xs font-semibold px-2 py-0.5",
                  scorePercentage >= 80 && "bg-green-600 hover:bg-green-700",
                  scorePercentage >= 60 && scorePercentage < 80 && "bg-yellow-600 hover:bg-yellow-700",
                  scorePercentage < 60 && "bg-red-600 hover:bg-red-700"
                )}
              >
                {scorePercentage}%
              </Badge>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[500px] max-h-[80vh] overflow-y-auto" align="start" side="bottom" sideOffset={8}>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-1">SEO Health Analysis</h4>
              <p className="text-[11px] text-muted-foreground mb-3">
                Score {scorePercentage}% – fix the items below to move closer to 100%.
              </p>
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {problematicChecks.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-card w-fit"
                    >
                      <div className="flex-shrink-0">{getStatusIcon(check.status)}</div>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium">{check.field}</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{check.message}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      {check.score > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                          +{check.score}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
