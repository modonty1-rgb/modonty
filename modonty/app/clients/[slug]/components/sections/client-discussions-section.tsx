import Link from "next/link";

import { SectionCard } from "./section-card";

interface DiscussionComment {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; image: string | null };
  article: { title: string; slug: string } | null;
}

interface Props {
  comments: DiscussionComment[];
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

function initial(name: string | null): string {
  return (name?.trim()?.[0] ?? "ز").toUpperCase();
}

export function ClientDiscussionsSection({ comments }: Props) {
  if (comments.length === 0) return null;

  return (
    <SectionCard id="discussions" icon="💬" title="نقاشات القرّاء على مقالاتنا">
      <div className="space-y-2.5">
        {comments.map((c) => (
          <div
            key={c.id}
            className="flex gap-3 rounded-md border bg-muted/40 p-3"
          >
            <span
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[13px] font-extrabold text-white"
              aria-hidden
            >
              {initial(c.author.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] font-extrabold text-foreground">
                  {c.author.name || "زائر"}
                </span>
                <span className="ms-auto text-[10px] text-muted-foreground">
                  {fmtDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">
                {c.content}
              </p>
              {c.article && (
                <Link
                  href={`/articles/${c.article.slug}`}
                  className="text-[10.5px] font-bold text-primary hover:underline"
                >
                  على مقال: {c.article.title} ›
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
