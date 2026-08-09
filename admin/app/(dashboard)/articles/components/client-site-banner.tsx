'use client';

import { Globe, AlertTriangle } from 'lucide-react';

import { useArticleForm } from './article-form-context';
import { slugify } from '@/lib/utils';

/**
 * WHERE this article goes — stated once, at the top, on every tab.
 *
 * A client-site article looks identical to a modonty one in the editor: same fields,
 * same tabs, same buttons. The only difference is the destination, and the writer must
 * never have to remember which one they opened. So the destination is printed, not
 * implied — with the actual address the piece will live at.
 *
 * Renders nothing for a normal modonty article: no banner IS the modonty case.
 */
export function ClientSiteBanner() {
  const { formData, clients } = useArticleForm();

  if (!formData.isClientSiteArticle) return null;

  const client = clients.find((c) => c.id === formData.clientId);
  const baseUrl = (client?.articlesBaseUrl ?? '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const slug = slugify(formData.slug || '');

  // No address = we cannot build a URL for this piece. Say so here rather than let the
  // writer discover it when saving fails.
  if (!baseUrl) {
    return (
      <div
        className="flex items-center gap-2 border-t border-amber-300/60 bg-amber-50 px-4 py-1.5 dark:border-amber-800/60 dark:bg-amber-950/40"
        role="status"
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          Client site
        </span>
        <Dot tone="amber" />
        <span className="text-xs font-medium text-amber-900 dark:text-amber-100" dir="auto">
          {client?.name ?? '—'}
        </span>
        <Dot tone="amber" />
        <span className="text-xs text-amber-900 dark:text-amber-100">
          No articles address yet — add it in Client settings before saving.
        </span>
      </div>
    );
  }

  // Chips, not a sentence. An Arabic client name dropped inside an English clause flips
  // the whole line (شركة جبر سيو's own website) — every piece stands on its own instead.
  return (
    <div
      className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-violet-300/60 bg-violet-50 px-4 py-1.5 dark:border-violet-800/60 dark:bg-violet-950/40"
      role="status"
    >
      <Globe className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
        Client site
      </span>

      <Dot />
      <span className="text-xs font-medium text-violet-900 dark:text-violet-100" dir="auto">
        {client?.name}
      </span>

      <Dot />
      <code
        className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-[11px] text-violet-800 dark:bg-violet-900/60 dark:text-violet-200"
        dir="ltr"
      >
        {baseUrl}/{slug || '…'}
      </code>

      <Dot />
      <span className="text-[11px] text-violet-700/80 dark:text-violet-300/80">
        Not published on modonty.com
      </span>
    </div>
  );
}

function Dot({ tone = 'violet' }: { tone?: 'violet' | 'amber' }) {
  return (
    <span
      className={
        tone === 'amber'
          ? 'text-amber-400 dark:text-amber-600'
          : 'text-violet-400 dark:text-violet-600'
      }
      aria-hidden="true"
    >
      ·
    </span>
  );
}
