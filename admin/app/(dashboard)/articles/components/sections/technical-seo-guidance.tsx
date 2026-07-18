'use client';

import { useMemo } from 'react';
import { Check, X, AlertTriangle, Wrench, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useArticleForm } from '../article-form-context';
import { analyzeArticleSEO } from '../../analyzer';
import type { ArticleSEOCategory, ArticleSEOScoreResult } from '../../analyzer';

// ── Types ──────────────────────────────────────────────────────────────────

interface CategoryEntry {
  key: string;
  label: string;
  data: ArticleSEOCategory;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getStatus(pct: number): 'green' | 'amber' | 'red' {
  if (pct >= 80) return 'green';
  if (pct >= 40) return 'amber';
  return 'red';
}

function StatusIcon({ pct }: { pct: number }) {
  const s = getStatus(pct);
  return (
    <span
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
        s === 'green' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        s === 'amber' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
        s === 'red' && 'bg-destructive/15 text-destructive',
      )}
    >
      {s === 'green' ? (
        <Check className="h-2.5 w-2.5" />
      ) : s === 'amber' ? (
        <AlertTriangle className="h-2.5 w-2.5" />
      ) : (
        <X className="h-2.5 w-2.5" />
      )}
    </span>
  );
}

function scoreText(pct: number) {
  return cn(
    'text-[10px] font-semibold tabular-nums shrink-0',
    pct >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : pct >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-destructive',
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FailedCategory({ entry }: { entry: CategoryEntry }) {
  const { label, data } = entry;
  const failed = (data.items ?? []).filter((i) => !i.passed);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <StatusIcon pct={data.percentage} />
        <span className="text-xs font-medium flex-1 truncate">{label}</span>
        <span className={scoreText(data.percentage)}>
          {data.passed}/{data.total}
        </span>
      </div>

      {failed.length > 0 && (
        <ul className="ms-6 space-y-1">
          {failed.map((item, idx) => (
            <li key={idx} className="space-y-0.5">
              <p className="text-[11px] text-muted-foreground leading-snug">
                <span className="text-destructive/70 me-1">•</span>
                {item.label}
              </p>
              {item.reason && (
                <p className="ms-3 text-[10px] text-muted-foreground/60 leading-snug">
                  {item.reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PassedCategory({ entry }: { entry: CategoryEntry }) {
  const { label, data } = entry;
  return (
    <div className="flex items-center gap-2">
      <StatusIcon pct={data.percentage} />
      <span className="text-xs text-muted-foreground flex-1 truncate">{label}</span>
      <span className={scoreText(data.percentage)}>
        {data.passed}/{data.total}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

function buildCategories(result: ArticleSEOScoreResult): CategoryEntry[] {
  return [
    { key: 'metaTags', label: 'Meta Tags', data: result.categories.metaTags },
    { key: 'content', label: 'Content', data: result.categories.content },
    { key: 'images', label: 'Images', data: result.categories.images },
    { key: 'structuredData', label: 'Structured Data', data: result.categories.structuredData },
    { key: 'technical', label: 'Technical', data: result.categories.technical },
    { key: 'social', label: 'Social / OG', data: result.categories.social },
  ];
}

export function TechnicalSEOGuidance() {
  const { formData, articleId } = useArticleForm();
  const result = useMemo(() => analyzeArticleSEO(formData), [formData]);

  const categories = result ? buildCategories(result) : [];
  const totalPassed = categories.reduce((s, c) => s + c.data.passed, 0);
  const totalChecks = categories.reduce((s, c) => s + c.data.total, 0);
  const score = result?.percentage ?? 0;

  const failing = categories.filter((c) => c.data.percentage < 80);
  const passing = categories.filter((c) => c.data.percentage >= 80);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          دليل تعبئة حقول السيو
        </p>
        <span
          className={cn(
            'text-[11px] font-semibold tabular-nums',
            score >= 80
              ? 'text-emerald-600 dark:text-emerald-400'
              : score >= 40
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-destructive',
          )}
        >
          {totalPassed}/{totalChecks} checks
        </span>
      </div>

      {/* ── Body — always show real analysis ── */}
      <div className="space-y-3">

        {failing.map((entry) => (
          <FailedCategory key={entry.key} entry={entry} />
        ))}

        {failing.length > 0 && passing.length > 0 && (
          <div className="border-t" />
        )}

        {passing.length > 0 && (
          <div className="space-y-2">
            {passing.map((entry) => (
              <PassedCategory key={entry.key} entry={entry} />
            ))}
          </div>
        )}

      </div>

      {/* ── Footer: link to full review ── */}
      {articleId && (
        <div className="border-t pt-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs gap-2"
          >
            <Link
              href={`/articles/${articleId}/technical`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Wrench className="h-3 w-3" />
              فتح المراجعة التقنية الكاملة
              <ExternalLink className="h-3 w-3 opacity-50 ms-auto" />
            </Link>
          </Button>
        </div>
      )}

    </div>
  );
}
