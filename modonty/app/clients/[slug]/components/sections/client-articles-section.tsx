import { OptimizedImage } from "@/components/media/OptimizedImage";
import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";
import { cn } from "@/lib/utils";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  category: string | null;
  datePublished: Date | null;
  readingTime: number | null;
  views: number | null;
  hasAudio: boolean;
}

interface ArticleTotals {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface ClientArticlesSectionProps {
  slug: string;
  totalCount: number;
  posts: ArticleRow[];
  totals: ArticleTotals;
  topics: string[];
}

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const numberFormatter = new Intl.NumberFormat("ar-SA");

/** Gradient placeholders matching the mockup `.thumb` / `.thumb.t2` / `.thumb.t3`. */
const THUMB_GRADIENTS = [
  "bg-gradient-to-br from-primary to-accent",
  "bg-gradient-to-br from-primary/90 to-accent/80",
  "bg-gradient-to-br from-[#2422b8] to-accent",
] as const;

/**
 * «أحدث المقالات» — faithful `.topics` / `.art` / `.mostRead` rows from the binding
 * mockup. Pure Server Component (zero JS): renders simple article rows itself,
 * the first row gets the «الأكثر قراءة» treatment. Hidden engagement strip when
 * all totals are zero.
 */
export function ClientArticlesSection({
  slug,
  totalCount,
  posts,
  totals,
  topics,
}: ClientArticlesSectionProps) {
  const hasTotals =
    totals.views > 0 || totals.likes > 0 || totals.comments > 0 || totals.shares > 0;
  const rows = posts.slice(0, 6);

  return (
    <SectionCard
      id="articles"
      icon="📰"
      title="أحدث المقالات"
      moreHref={`/articles?client=${slug}`}
      moreLabel={`عرض الـ ${numberFormatter.format(totalCount)}`}
    >
      {hasTotals && (
        <div className="mb-3.5 grid grid-cols-4 overflow-hidden rounded-md border">
          <ActivityCell value={totals.views} label="👁️ مشاهدة" />
          <ActivityCell value={totals.likes} label="👍 إعجاب" />
          <ActivityCell value={totals.comments} label="💬 تعليق" />
          <ActivityCell value={totals.shares} label="🔗 مشاركة" />
        </div>
      )}

      {topics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-[7px]">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-primary/[0.08] px-[11px] py-1 text-[11.5px] font-bold text-primary"
            >
              # {topic}
            </span>
          ))}
        </div>
      )}

      {rows.length > 0 ? (
        <div className="flex flex-col gap-[11px]">
          {rows.map((post, index) => {
            const isMostRead = index === 0;
            return (
              <a
                key={post.id}
                href={`/articles/${post.slug}`}
                className={cn(
                  "relative flex gap-3 rounded-md border bg-muted/40 p-3 transition-colors hover:border-primary/30",
                  isMostRead && "border-primary/15"
                )}
              >
                {isMostRead && (
                  <span className="absolute -top-[9px] start-[11px] rounded-full bg-primary px-[9px] py-0.5 text-[10px] font-extrabold text-primary-foreground">
                    🔥 الأكثر قراءة
                  </span>
                )}

                <div className="relative h-[70px] w-[100px] shrink-0 overflow-hidden rounded-lg">
                  {post.image ? (
                    <OptimizedImage
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="100px"
                      className="object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className={cn(
                        "block h-full w-full",
                        THUMB_GRADIENTS[index % THUMB_GRADIENTS.length]
                      )}
                      aria-hidden
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-[13.5px] font-extrabold leading-[1.45] text-foreground">
                    {post.title}
                    {isMostRead && post.hasAudio && (
                      <span className="ms-1.5 inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-px align-middle text-[9.5px] font-extrabold text-accent-foreground">
                        🎧 صوتي
                      </span>
                    )}
                  </h4>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {post.datePublished && (
                      <span>{dateFormatter.format(post.datePublished)}</span>
                    )}
                    {post.readingTime != null && (
                      <span>⏱️ {numberFormatter.format(post.readingTime)} دقيقة</span>
                    )}
                    {post.views != null && (
                      <span>👁️ {numberFormatter.format(post.views)}</span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] text-muted-foreground">
          لا توجد مقالات منشورة بعد.
        </p>
      )}

      <div className="mt-3.5 flex flex-wrap gap-4 border-t border-dashed pt-3.5 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          📚 مقالاتنا تستند إلى مصادر موثوقة
        </span>
      </div>
    </SectionCard>
  );
}

function ActivityCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-muted/40 px-2 py-3 text-center">
      <b className="block text-[20px] font-black text-foreground">
        {numberFormatter.format(value)}
      </b>
      <span className="mt-0.5 inline-block text-[10.5px] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
