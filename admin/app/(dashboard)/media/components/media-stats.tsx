import { ImageIcon, HardDrive, CheckCircle2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MediaStatsProps {
  stats: {
    total: number;
    images: number;
    videos: number;
    used: number;
    unused: number;
    createdThisMonth: number;
    totalSize: number;
    imageTypes?: {
      jpeg: number;
      png: number;
      webp: number;
      svg: number;
      other: number;
    };
    mediaTypes?: {
      GENERAL: number;
      LOGO: number;
      OGIMAGE: number;
      POST: number;
      TWITTER_IMAGE: number;
      NULL?: number;
    };
    cloudinaryUsed?: number;
    cloudinaryTotal?: number;
    cloudinaryRemaining?: number;
    cloudinaryDetails?: {
      plan?: string;
      credits?: {
        usage?: number;
        limit?: number;
        used_percent?: number;
      };
      storage?: {
        usage?: number;
        limit?: number;
        credits_usage?: number;
      };
      bandwidth?: {
        usage?: number;
        credits_usage?: number;
      };
      resources?: number;
    };
    usageBreakdown?: {
      inArticles: number;
      asLogos: number;
      asOGImages: number;
      asTwitterImages: number;
      totalUsed: number;
      unused: number;
    };
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function MediaStats({ stats }: MediaStatsProps) {
  const usedCount = stats.usageBreakdown?.totalUsed ?? stats.used;
  const usedPercent = stats.total > 0 ? Math.round((usedCount / stats.total) * 100) : 0;

  return (
    <div className="hidden md:flex items-center gap-2">
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <ImageIcon className="h-3 w-3 text-violet-500" />
        <span className="font-semibold">{stats.total}</span>
        <span className="text-muted-foreground">files</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <HardDrive className="h-3 w-3 text-blue-500" />
        <span className="font-semibold">{formatFileSize(stats.totalSize)}</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        <span className="font-semibold">{usedPercent}%</span>
        <span className="text-muted-foreground">used</span>
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
        <CalendarDays className="h-3 w-3 text-amber-500" />
        <span className="font-semibold">+{stats.createdThisMonth}</span>
        <span className="text-muted-foreground">this month</span>
      </Badge>
    </div>
  );
}
