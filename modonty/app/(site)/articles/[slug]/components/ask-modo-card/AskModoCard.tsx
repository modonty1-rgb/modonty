import Link from "next/link";
import { ModoCharacter } from "@modonty/shared/components/modo-character/ModoCharacter";

import { IconChevronLeft } from "@/lib/icons";

interface AskModoCardProps {
  /** The article the conversation will be scoped to. */
  slug: string;
}

/**
 * The way into asking Modo about THIS article.
 *
 * `/modo-chat/api/article/[slug]` has always existed, but nothing on the site produced the link
 * that reaches it — measured 2026-08-18, a grep across modonty found zero places generating
 * `?article=`. So the whole article-scoped path was unreachable code.
 *
 * It sits directly under the header rather than at the end: this article is 68 paragraphs, and
 * a prompt below them is one almost nobody scrolls to. A plain link, so it ships no JavaScript.
 */
export function AskModoCard({ slug }: AskModoCardProps) {
  return (
    <Link
      href={`/modo-chat?article=${encodeURIComponent(slug)}`}
      className="group mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/10"
    >
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-primary/20">
        <ModoCharacter sizes="36px" decorative />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          عندك سؤال عن المقال؟ اسأل مودو
        </span>
        <span className="block text-xs text-muted-foreground">
          يجاوبك من هذا المقال، ويدلّك على الشريك اللي يقدر يخدمك
        </span>
      </span>
      <IconChevronLeft className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5" aria-hidden />
    </Link>
  );
}
