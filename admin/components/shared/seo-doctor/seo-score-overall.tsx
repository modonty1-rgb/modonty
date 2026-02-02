import { AnalticCard } from "@/components/shared/analtic-card";

export interface SEOScoreOverallProps {
  value: number;
  title?: string;
  icon?: string;
  className?: string;
  variant?: "default" | "compact";
  thresholds?: {
    excellent: number;
    good: number;
    fair: number;
  };
}

export function SEOScoreOverall({
  value,
  title = "SEO Health",
  icon = "Stethoscope",
  className,
  variant = "default",
  thresholds = {
    excellent: 90,
    good: 70,
    fair: 50,
  },
}: SEOScoreOverallProps) {
  const getScoreColor = (score: number) => {
    if (score >= thresholds.excellent) return "text-green-600";
    if (score >= thresholds.good) return "text-yellow-600";
    if (score >= thresholds.fair) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= thresholds.excellent) return "bg-green-600";
    if (score >= thresholds.good) return "bg-yellow-600";
    if (score >= thresholds.fair) return "bg-orange-600";
    return "bg-red-600";
  };

  const getBorderColor = (score: number) => {
    if (score >= thresholds.excellent) return "#16a34a";
    if (score >= thresholds.good) return "#ca8a04";
    if (score >= thresholds.fair) return "#ea580c";
    return "#dc2626";
  };

  const getStatusIcon = (score: number) => {
    if (score >= thresholds.excellent) return "CheckCircle2";
    if (score >= thresholds.good) return "AlertTriangle";
    return "AlertCircle";
  };

  const getStatusHint = (score: number) => {
    if (score >= thresholds.excellent) return "Excellent";
    if (score >= thresholds.good) return "Good";
    if (score >= thresholds.fair) return "Fair";
    return "Poor";
  };

  const scoreColor = getScoreColor(value);
  const progressColor = getProgressColor(value);
  const borderColor = getBorderColor(value);
  const statusIcon = getStatusIcon(value);
  const statusHint = getStatusHint(value);

  return (
    <AnalticCard
      title={title}
      value={`${value}%`}
      icon={icon}
      className={className}
      showProgress={true}
      progressValue={value}
      progressColor={progressColor}
      borderLeftColor={borderColor}
      statusIcon={statusIcon}
      statusText={statusHint}
      valueColor={scoreColor}
      variant={variant}
    />
  );
}
