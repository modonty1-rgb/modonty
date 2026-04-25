import {
  ImageIcon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileImage,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { fetchAndAnalyzeImageSitemap } from "@/lib/gsc/parse-sitemap";
import { SITE_BASE_URL } from "@/lib/gsc/client";
import { listSitemaps } from "@/lib/gsc/sitemaps";

import { SubmitImageSitemapButton } from "./submit-image-sitemap-button";

const IMAGE_SITEMAP_URL = `${SITE_BASE_URL}/image-sitemap.xml`;

export async function ImageSitemapCard() {
  const [stats, gscSitemaps] = await Promise.all([
    fetchAndAnalyzeImageSitemap(IMAGE_SITEMAP_URL).catch(() => null),
    listSitemaps().catch(() => []),
  ]);

  const isSubmittedToGsc = gscSitemaps.some(
    (s) => s.path === IMAGE_SITEMAP_URL,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <ImageIcon className="h-4 w-4 text-pink-500" />
            <CardTitle className="text-base">Image Sitemap</CardTitle>
            {stats && (
              <>
                <Badge variant="secondary" className="text-xs font-mono">
                  {stats.totalImages.toLocaleString("en-US")} images
                </Badge>
                {stats.status === 200 ? (
                  <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3 me-1" />
                    Live
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <XCircle className="h-3 w-3 me-1" />
                    {stats.status}
                  </Badge>
                )}
              </>
            )}
            {isSubmittedToGsc ? (
              <Badge className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 me-1" />
                In GSC
              </Badge>
            ) : (
              <Badge className="text-xs bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">
                <AlertTriangle className="h-3 w-3 me-1" />
                Not in GSC
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isSubmittedToGsc && stats?.status === 200 && (
              <SubmitImageSitemapButton sitemapUrl={IMAGE_SITEMAP_URL} />
            )}
            <a
              href={IMAGE_SITEMAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-muted text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              View XML
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!stats ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Failed to fetch the image sitemap.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat
                label="Total Images"
                value={stats.totalImages.toLocaleString("en-US")}
                accent="text-foreground"
                icon={<FileImage className="h-3 w-3 text-pink-500" />}
              />
              <Stat
                label="Articles w/ Images"
                value={stats.articlesWithImages.toLocaleString("en-US")}
                accent="text-foreground"
              />
              <Stat
                label="Avg per Article"
                value={
                  stats.articlesWithImages > 0
                    ? (stats.totalImages / stats.articlesWithImages).toFixed(1)
                    : "0"
                }
                accent="text-foreground"
              />
              <Stat
                label="File Size"
                value={formatBytes(stats.bytes)}
                accent="text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <Validation
                ok={stats.status === 200}
                label="HTTP 200 OK"
                detail={`Live response: ${stats.status}`}
              />
              <Validation
                ok={stats.hasNamespace}
                label="image:image namespace"
                detail={
                  stats.hasNamespace
                    ? "Google Image Sitemap protocol detected"
                    : "Missing — Google won't recognize this as image sitemap"
                }
              />
              <Validation
                ok={stats.totalImages > 0}
                label="Contains images"
                detail={
                  stats.totalImages > 0
                    ? `${stats.totalImages} <image:image> entries`
                    : "Empty — articles missing featured images?"
                }
              />
              <Validation
                ok={stats.bytes < 50 * 1024 * 1024}
                label="Under 50MB limit"
                detail={`${formatBytes(stats.bytes)} (Google max: 50MB)`}
              />
            </div>

            <div className="text-[10px] text-muted-foreground italic pt-2 border-t">
              <strong>URL:</strong>{" "}
              <a
                href={IMAGE_SITEMAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
              >
                {IMAGE_SITEMAP_URL}
              </a>
              {" · "}
              fetched {new Date(stats.fetchedAt).toLocaleTimeString("en-US")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: string;
  accent: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-1">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`text-xl font-extrabold tabular-nums leading-none ${accent}`}>
        {value}
      </div>
    </div>
  );
}

function Validation({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-md border bg-muted/20">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      )}
      <div>
        <div className="font-bold text-xs">{label}</div>
        <div className="text-[10px] text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
