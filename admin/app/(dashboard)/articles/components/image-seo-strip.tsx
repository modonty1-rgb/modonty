'use client';

import { useCallback, useEffect, useState } from 'react';
import { PenLine, Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoScoreBadge } from '@/components/shared/seo-score-badge';
import { ImageSeoDialog } from '@/app/(dashboard)/seo-images/components/image-seo-dialog';
import { getSeoImageRow } from '@/app/(dashboard)/media/actions/get-seo-image-row';
import type { SeoImageRow } from '@/app/(dashboard)/seo-images/helpers/load-groups';
import type { MediaCheckStatus } from '@modonty/database/lib/seo/media/seo-score';

// The writer's inline SEO lever for one image (article cover / gallery item): shows the live
// score + the gaps the writer can actually fix (alt · description) and opens the SAME dialog
// used on /seo-images. Optionally shows a read-only data view — the ACTUAL stored values behind
// the score. Reused by the featured image now and the gallery next, so the two never diverge.

// The checks a writer can fix from here. Dimensions/filename are properties of the uploaded
// file, not editable in this dialog — so they never appear as an actionable gap on the card.
const FIXABLE = new Set(['altText', 'description']);

const STATUS_ICON: Record<MediaCheckStatus, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};
const STATUS_CLS: Record<MediaCheckStatus, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-500',
  error: 'text-red-600 dark:text-red-400',
};

const FORMAT_LABEL: Record<string, string> = {
  webp: 'WebP',
  jpeg: 'JPG',
  jpg: 'JPG',
  png: 'PNG',
  gif: 'GIF',
  'svg+xml': 'SVG',
  avif: 'AVIF',
};

function formatType(mime: string | null): string | null {
  if (!mime) return null;
  const sub = (mime.split('/')[1] ?? mime).toLowerCase();
  return FORMAT_LABEL[sub] ?? sub.toUpperCase();
}

function formatBytes(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DataRow {
  key: string;
  label: string;
  value: string | null;
  ltr?: boolean;
  stacked?: boolean;
  /** Whether this field is scored (drives the status icon); metadata rows get a neutral dot. */
  checkKey?: string;
}

export function ImageSeoStrip({
  mediaId,
  showBreakdown = false,
  onChange,
}: {
  mediaId: string;
  /** Also render the read-only data view (actual alt/dimensions/type/size/filename/desc) below. */
  showBreakdown?: boolean;
  /** Called after a save with the fresh URL, so the parent can refresh a thumbnail whose
   *  filename was renamed (the Cloudinary URL changed). */
  onChange?: (url?: string) => void;
}) {
  const [row, setRow] = useState<SeoImageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const next = await getSeoImageRow(mediaId);
    setRow(next);
    setLoading(false);
  }, [mediaId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = useCallback(async () => {
    const next = await getSeoImageRow(mediaId);
    setRow(next);
    onChange?.(next?.url ?? undefined);
  }, [mediaId, onChange]);

  if (loading) {
    return <Skeleton className="h-9 w-full rounded-lg" />;
  }
  if (!row) return null;

  const statusOf = (key: string): MediaCheckStatus =>
    row.checks.find((c) => c.key === key)?.status ?? 'good';
  const gaps = row.checks.filter((c) => FIXABLE.has(c.key) && c.earned < c.max);

  // The actual stored values behind the score — what the writer wants to SEE, not the points.
  const dims = row.width && row.height ? `${row.width} × ${row.height}` : null;
  const data: DataRow[] = [
    { key: 'altText', label: 'النص البديل', value: row.altText, checkKey: 'altText' },
    { key: 'dimensions', label: 'الأبعاد', value: dims, ltr: true, checkKey: 'dimensions' },
    { key: 'type', label: 'نوع الصورة', value: formatType(row.mimeType), ltr: true },
    { key: 'size', label: 'حجم الصورة', value: formatBytes(row.fileSize), ltr: true },
    { key: 'filename', label: 'اسم الملف', value: row.filename, ltr: true, checkKey: 'filename' },
    { key: 'description', label: 'الوصف', value: row.description, stacked: true, checkKey: 'description' },
  ];

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
        <SeoScoreBadge score={row.score} size="sm" />

        {gaps.length > 0 ? (
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <PenLine className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            {gaps.map((c) => (
              <span
                key={c.key}
                className="inline-flex shrink-0 items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-400"
              >
                {c.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="flex-1 text-[12px] text-muted-foreground">
            سيو الصورة مكتمل — لا نواقص يكتبها الكاتب
          </span>
        )}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className="h-7 shrink-0 gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          تعديل SEO
        </Button>
      </div>

      {/* Read-only data view — the ACTUAL stored values (not points). Short fields inline;
          the description on its own line since it can be long. */}
      {showBreakdown && (
        <ul className="flex flex-1 flex-col justify-between gap-3 rounded-lg border bg-muted/20 p-3">
          {data.map((d) => {
            const icon = d.checkKey ? (
              (() => {
                const Icon = STATUS_ICON[statusOf(d.checkKey)];
                return <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${STATUS_CLS[statusOf(d.checkKey)]}`} />;
              })()
            ) : (
              <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              </span>
            );

            const valueNode = d.value ? (
              <span className="text-foreground" dir={d.ltr ? 'ltr' : 'auto'}>
                {d.value}
              </span>
            ) : (
              <span className="italic text-muted-foreground/70">لا يوجد</span>
            );

            return (
              <li key={d.key} className="flex items-start gap-2 text-xs">
                {icon}
                {d.stacked ? (
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
                    <p className="mt-0.5 leading-snug break-words">{valueNode}</p>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{d.label}</span>
                    <span className="min-w-0 truncate text-end" title={d.value ?? undefined}>
                      {valueNode}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <ImageSeoDialog image={row} open={dialogOpen} onOpenChange={setDialogOpen} onSaved={handleSaved} />
    </div>
  );
}
