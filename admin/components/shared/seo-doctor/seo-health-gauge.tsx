"use client";

import { useMemo } from "react";
import { SEODoctorConfig } from "./seo-doctor";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CheckCircle2, AlertCircle, XCircle, Info } from "lucide-react";

export interface SEOHealthGaugeProps {
  data: Record<string, any>;
  config: SEODoctorConfig;
  size?: "xs" | "sm" | "md" | "lg";
  showScore?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  xs: { size: 40, fontSize: 8, scoreFontSize: 6, strokeWidth: 4 },
  sm: { size: 50, fontSize: 10, scoreFontSize: 7, strokeWidth: 5 },
  md: { size: 60, fontSize: 14, scoreFontSize: 9, strokeWidth: 6 },
  lg: { size: 70, fontSize: 18, scoreFontSize: 11, strokeWidth: 7 },
};

export function SEOHealthGauge({
  data,
  config,
  size = "md",
  showScore = true,
  className,
}: SEOHealthGaugeProps) {
  const scoreResult = useMemo(() => calculateSEOScore(data, config), [data, config]);

  const fieldDetails = useMemo(() => {
    const details: Array<{ field: string; status: "good" | "warning" | "error" | "info"; message: string; score: number; maxScore: number }> = [];
    for (const fieldConfig of config.fields) {
      const value = data[fieldConfig.name];
      const result = fieldConfig.validator(value, data);

      let maxFieldScore = 10;
      if (fieldConfig.name === "altText") {
        maxFieldScore = 25;
      } else if (fieldConfig.name === "title" || fieldConfig.name === "description") {
        maxFieldScore = 15;
      }

      details.push({
        field: fieldConfig.label,
        status: result.status,
        message: result.message,
        score: result.score,
        maxScore: maxFieldScore,
      });
    }
    return details;
  }, [data, config]);

  const { percentage, score, maxScore } = scoreResult;
  const sizeConfig = SIZE_CONFIG[size];

  const radius = (sizeConfig.size - sizeConfig.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (percent: number): string => {
    if (percent >= 80) return "rgb(34, 197, 94)";
    if (percent >= 60) return "rgb(234, 179, 8)";
    return "rgb(239, 68, 68)";
  };

  const getColorClass = (percent: number): string => {
    if (percent >= 80) return "text-green-600";
    if (percent >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const color = getColor(percentage);
  const center = sizeConfig.size / 2;

  const getStatusMessage = (percent: number): string => {
    if (percent >= 80) return "Excellent SEO health";
    if (percent >= 60) return "Good SEO health - room for improvement";
    return "Poor SEO health - needs attention";
  };

  const getStatusDescription = (percent: number): string => {
    if (percent >= 80) return "Your SEO optimization is excellent. Keep it up!";
    if (percent >= 60) return "Aim for 80%+ for optimal search engine visibility.";
    return "Fill in missing SEO fields to improve your search ranking.";
  };

  const gaugeContent = (
    <div className={cn("relative inline-flex items-center justify-center", size === "xs" && "-m-1", className)}>
      <svg
        width={sizeConfig.size}
        height={sizeConfig.size}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={sizeConfig.strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={sizeConfig.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("font-semibold leading-none", getColorClass(percentage))}
          style={{ fontSize: `${sizeConfig.fontSize}px` }}
        >
          {percentage}%
        </span>
        {showScore && (
          <span
            className={cn(
              "text-muted-foreground font-medium leading-none",
              size === "xs" && "mt-0",
              size === "sm" && "mt-0.5",
              size === "md" && "mt-1",
              size === "lg" && "mt-1.5"
            )}
            style={{ fontSize: `${sizeConfig.scoreFontSize}px` }}
          >
            {score}/{maxScore}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {gaugeContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">SEO Health Score</h4>
              <span className={cn("text-sm font-bold", getColorClass(percentage))}>
                {percentage}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {score} / {maxScore} points
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{getStatusMessage(percentage)}</p>
            <p className="text-xs text-muted-foreground">
              {getStatusDescription(percentage)}
            </p>
          </div>
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium mb-2">Field Breakdown:</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {fieldDetails.map((field, index) => {
                const getStatusIcon = () => {
                  switch (field.status) {
                    case "good":
                      return <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />;
                    case "warning":
                      return <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />;
                    case "error":
                      return <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />;
                    default:
                      return <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />;
                  }
                };
                return (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    {getStatusIcon()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{field.field}</span>
                        <span className={cn(
                          "font-semibold flex-shrink-0",
                          field.score === field.maxScore ? "text-green-600" : field.score > 0 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {field.score}/{field.maxScore}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{field.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
