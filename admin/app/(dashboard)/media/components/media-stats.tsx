import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Core Statistics (Most Important) - Total & Total Size together */}
      <Badge variant="outline" className="font-semibold border-primary border-2">
        Total: {stats.total}
      </Badge>
      <Badge variant="outline" className="font-semibold border-primary border-2">
        Total Size: {formatFileSize(stats.totalSize)}
      </Badge>

      {/* Cloudinary Storage Info */}
      {(() => {
        // Calculate remaining if we have used and total
        const remaining = stats.cloudinaryRemaining !== undefined
          ? stats.cloudinaryRemaining
          : (stats.cloudinaryUsed !== undefined && stats.cloudinaryTotal !== undefined)
            ? stats.cloudinaryTotal - stats.cloudinaryUsed
            : undefined;

        // Show remaining storage if available (paid plan with quota)
        if (remaining !== undefined && remaining >= 0) {
          return (
            <Badge variant="outline" className="font-semibold border-primary border-2">
              Remaining: {formatFileSize(remaining)}
            </Badge>
          );
        }

        // Show used storage if available but no limit (Free plan)
        if (stats.cloudinaryUsed !== undefined && stats.cloudinaryUsed > 0) {
          const badgeContent = (
            <Badge variant="outline" className="font-semibold border-primary border-2 cursor-help">
              Cloudinary Used: {formatFileSize(stats.cloudinaryUsed)}
            </Badge>
          );

          // Wrap in hover card if details are available
          if (stats.cloudinaryDetails) {
            return (
              <HoverCard>
                <HoverCardTrigger asChild>
                  {badgeContent}
                </HoverCardTrigger>
                <HoverCardContent className="w-80 max-h-96 overflow-y-auto pb-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Cloudinary Account Details</h4>
                      {stats.cloudinaryDetails.plan && (
                        <div className="text-sm">
                          <span className="font-medium">Plan:</span> {stats.cloudinaryDetails.plan}
                        </div>
                      )}
                    </div>

                    {stats.cloudinaryDetails.storage && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Storage</div>
                        <div className="text-sm space-y-0.5 text-muted-foreground">
                          <div>Used: {formatFileSize(stats.cloudinaryDetails.storage.usage || 0)}</div>
                          {stats.cloudinaryDetails.storage.limit && (
                            <div>Limit: {formatFileSize(stats.cloudinaryDetails.storage.limit)}</div>
                          )}
                          {stats.cloudinaryDetails.storage.credits_usage !== undefined && (
                            <div>Credits: {stats.cloudinaryDetails.storage.credits_usage.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {stats.cloudinaryDetails.bandwidth && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Bandwidth</div>
                        <div className="text-sm space-y-0.5 text-muted-foreground">
                          <div>Used: {formatFileSize(stats.cloudinaryDetails.bandwidth.usage || 0)}</div>
                          {stats.cloudinaryDetails.bandwidth.credits_usage !== undefined && (
                            <div>Credits: {stats.cloudinaryDetails.bandwidth.credits_usage.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {stats.cloudinaryDetails.credits && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Credits</div>
                        <div className="text-sm space-y-0.5 text-muted-foreground">
                          {stats.cloudinaryDetails.credits.usage !== undefined && (
                            <div>Used: {stats.cloudinaryDetails.credits.usage.toFixed(2)}</div>
                          )}
                          {stats.cloudinaryDetails.credits.limit !== undefined && (
                            <div>Limit: {stats.cloudinaryDetails.credits.limit}</div>
                          )}
                          {stats.cloudinaryDetails.credits.used_percent !== undefined && (
                            <div>Usage: {stats.cloudinaryDetails.credits.used_percent.toFixed(2)}%</div>
                          )}
                        </div>
                      </div>
                    )}

                    {stats.cloudinaryDetails.resources !== undefined && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Resources</div>
                        <div className="text-sm text-muted-foreground">
                          Total: {stats.cloudinaryDetails.resources}
                        </div>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          }

          return badgeContent;
        }

        // Don't show anything if no data is available
        return null;
      })()}

      {/* Media Type Badge - Consolidated */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge variant="secondary" className="cursor-help">
            Media Type: {stats.total}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">Media Type Breakdown</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Media Types: Images, Videos
              </p>
              <div className="text-sm space-y-1.5">
                {/* Show ALL types even if zero */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Images:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stats.images || 0}</span>
                    {stats.total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({((stats.images || 0) / stats.total * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Videos:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stats.videos || 0}</span>
                    {stats.total > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({((stats.videos || 0) / stats.total * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t pt-1.5 mt-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Usage Statistics */}
      {stats.usageBreakdown ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="secondary" className="cursor-help">
              Usage: {stats.usageBreakdown.totalUsed} / {stats.total}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-1">Usage Breakdown</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Usage Types: In Articles, As Logos, As OG Images, As Twitter Images
                </p>
                <div className="text-sm space-y-1.5">
                  {/* Show ALL usage types even if zero */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">In Articles:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.usageBreakdown.inArticles || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.usageBreakdown.inArticles || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">As Logos:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.usageBreakdown.asLogos || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.usageBreakdown.asLogos || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">As OG Images:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.usageBreakdown.asOGImages || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.usageBreakdown.asOGImages || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">As Twitter Images:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.usageBreakdown.asTwitterImages || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.usageBreakdown.asTwitterImages || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-1.5 mt-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>Used:</span>
                      <span>{stats.usageBreakdown.totalUsed}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground mt-1">
                      <span>Unused:</span>
                      <span>{stats.usageBreakdown.unused}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ) : (
        <Badge variant="secondary">
          Usage: {stats.used} / {stats.total}
        </Badge>
      )}
      <Badge variant="secondary">
        This Month: {stats.createdThisMonth}
      </Badge>

      {/* Media Format Badge - Consolidated */}
      {stats.imageTypes && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              Media Format: {stats.images}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-1">Media Format Breakdown</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Supported: PNG, JPEG, GIF, WebP, SVG
                </p>
                <div className="text-sm space-y-1.5">
                  {/* Show ALL formats even if zero */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PNG:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.imageTypes.png || 0}</span>
                      {stats.images > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.imageTypes.png || 0) / stats.images * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">JPEG:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.imageTypes.jpeg || 0}</span>
                      {stats.images > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.imageTypes.jpeg || 0) / stats.images * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">WebP:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{stats.imageTypes.webp || 0}</span>
                      {stats.images > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.imageTypes.webp || 0) / stats.images * 100).toFixed(1)}%)
                        </span>
                      )}
                      <span className="text-xs text-primary font-semibold">(Recommended)</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SVG:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.imageTypes.svg || 0}</span>
                      {stats.images > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.imageTypes.svg || 0) / stats.images * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.imageTypes.other || 0}</span>
                      {stats.images > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.imageTypes.other || 0) / stats.images * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-1.5 mt-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{stats.images}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}

      {/* Media Role Badge - Consolidated */}
      {stats.mediaTypes && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge variant="outline" className="cursor-help">
              Media Role: {stats.total}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold mb-1">Media Role Breakdown</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Roles: General, Logo, OG Image, Twitter Image, Post
                </p>
                <div className="text-sm space-y-1.5">
                  {/* Show ALL roles even if zero */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">General:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.GENERAL || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.GENERAL || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Logo:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.LOGO || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.LOGO || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OG Image:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.OGIMAGE || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.OGIMAGE || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Twitter Image:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.TWITTER_IMAGE || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.TWITTER_IMAGE || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Post:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.POST || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.POST || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unset:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.mediaTypes.NULL || 0}</span>
                      {stats.total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({((stats.mediaTypes.NULL || 0) / stats.total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border-t pt-1.5 mt-1.5">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{stats.total}</span>
                    </div>
                  </div>
                  {(stats.mediaTypes.NULL || 0) > 0 && (
                    <p className="pt-2 mt-2 border-t text-xs text-muted-foreground">
                      Unset files need to be assigned a media type (General, Logo, OG Image, Twitter, or Post).
                    </p>
                  )}
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
