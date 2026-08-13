"use client";

import { OptimizedImage, asMedia } from "@modonty/database/components/optimized-image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Images, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { ImageSeoDialog } from "../../components/image-seo-dialog";
import type { SeoImageRow } from "../../helpers/load-groups";

const PAGE_SIZE = 24;

interface Props {
  name: string;
  isModonty: boolean;
  avgScore: number;
  images: SeoImageRow[];
}

export function ClientImagesGrid({ name, isModonty, avgScore, images }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const active = images.find((i) => i.id === openId) ?? null;

  // Count per image type — feeds the toggle filter chips (each chip is its own counter).
  const typeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of images) m.set(i.type, (m.get(i.type) ?? 0) + 1);
    return [...m.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
  }, [images]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = typeFilter ? images.filter((i) => i.type === typeFilter) : images;
    if (q) {
      filtered = filtered.filter((i) =>
        [i.type, i.altText ?? "", i.usedIn].some((f) => f.toLowerCase().includes(q)),
      );
    }
    return [...filtered].sort((a, b) => a.score - b.score);
  }, [images, query, typeFilter]);

  // Counted over ALL the owner's images, not the filtered page — this is the plan for the
  // whole client, and it must not change because someone typed in the search box.
  const plan = useMemo(() => {
    const t = { ready: 0, duplicate: 0, "no-alt": 0, same: 0, foreign: 0 };
    for (const i of images) t[i.rename.status]++;
    return t;
  }, [images]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Header: back + name + avg score */}
      <div className="flex items-center justify-between gap-3">
        <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
          <Link href="/seo-images">
            <ChevronRight className="h-3.5 w-3.5" />
            كل العملاء
          </Link>
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          {isModonty ? (
            <Images className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-sm font-bold" title={name}>
            {name}
          </span>
          <SeoScoreBadge score={avgScore} size="sm" />
        </div>
      </div>

      {/* Title + total counter + splitter */}
      <div className="flex items-center gap-2 border-b pb-2">
        <span className="text-sm font-bold">صور المعرض</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
          {images.length}
        </span>
      </div>

      {/* The rename plan for this client, at a glance, before anything is executed. */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-muted-foreground">خطة الأسماء:</span>
        <span className="rounded border border-green-500/40 px-2 py-0.5 font-bold text-green-700 dark:text-green-400">
          جاهزة {plan.ready}
        </span>
        {plan.duplicate > 0 && (
          <span className="rounded border border-red-500/40 px-2 py-0.5 font-bold text-red-600 dark:text-red-400">
            مكرّرة {plan.duplicate}
          </span>
        )}
        <span className="rounded border border-amber-500/40 px-2 py-0.5 font-bold text-amber-600 dark:text-amber-500">
          بلا نص بديل {plan["no-alt"]}
        </span>
        <span className="rounded border px-2 py-0.5 text-muted-foreground">مطابقة {plan.same}</span>
        {plan.foreign > 0 && (
          <span className="rounded border px-2 py-0.5 text-muted-foreground">خارج بني {plan.foreign}</span>
        )}
      </div>

      {/* Search + type filter toggles on one line (each chip carries its own count) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[200px]">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث…"
            className="h-8 ps-8 text-xs"
          />
        </div>
        <TypeChip
          label="الكل"
          count={images.length}
          active={typeFilter === null}
          onClick={() => {
            setTypeFilter(null);
            setPage(1);
          }}
        />
        {typeCounts.map((t) => (
          <TypeChip
            key={t.type}
            label={t.type}
            count={t.count}
            active={typeFilter === t.type}
            onClick={() => {
              setTypeFilter(t.type);
              setPage(1);
            }}
          />
        ))}
        <p className="ms-auto shrink-0 text-xs text-muted-foreground">
          {rows.length === images.length ? `${images.length} صورة` : `${rows.length} من ${images.length}`}
        </p>
      </div>

      {/* Image grid — click any image to edit alt + description */}
      {pageRows.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          لا توجد صورة تطابق البحث.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {pageRows.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenId(img.id)}
              className="rounded-xl border bg-card text-start transition hover:ring-2 hover:ring-primary/40"
            >
              <div className="relative grid aspect-video place-items-center overflow-hidden rounded-t-xl bg-muted/40">
                <OptimizedImage fill media={asMedia(img.url, img.altText ?? "")} alt={img.altText ?? ""} sizes="(max-width: 768px) 50vw, 220px" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  {img.type}
                </span>
                <SeoScoreBadge score={img.score} size="sm" />
              </div>
              {/* What a rename would do to this image — the plan lives on the screen the team
                  already works in, so there is no second report to keep in step. */}
              <div className="px-2.5 pb-2">
                {img.rename.status === "ready" ? (
                  <div className="truncate text-[10px] font-bold text-green-700 dark:text-green-400" dir="auto" title={img.rename.newBase ?? undefined}>
                    ← {img.rename.newBase}
                  </div>
                ) : img.rename.status === "duplicate" ? (
                  <div className="truncate text-[10px] font-bold text-red-600 dark:text-red-400" dir="auto">
                    نص بديل مكرّر — راجعه
                  </div>
                ) : img.rename.status === "no-alt" ? (
                  <div className="text-[10px] font-bold text-amber-600 dark:text-amber-500">بلا نص بديل</div>
                ) : img.rename.status === "same" ? (
                  <div className="text-[10px] text-muted-foreground">الاسم مطابق</div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">خارج بني</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">
            صفحة {current} من {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ImageSeoDialog
        image={active}
        open={Boolean(active)}
        onOpenChange={(o) => {
          if (!o) setOpenId(null);
        }}
      />
    </div>
  );
}

function TypeChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
      <span className={active ? "opacity-80" : "text-foreground"}>{count}</span>
    </button>
  );
}
