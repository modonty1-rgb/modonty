import Link from "@/components/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface Review {
  id: string;
  content: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  article: {
    id: string;
    title: string;
    slug: string;
  };
}

interface ClientReviewsPreviewProps {
  reviews: Review[];
  clientSlug: string;
  clientName: string;
  showEmptyState?: boolean;
}

export function ClientReviewsPreview({
  reviews,
  clientSlug,
  clientName,
  showEmptyState = false,
}: ClientReviewsPreviewProps) {
  const previewReviews = reviews.slice(0, 3);

  if (previewReviews.length === 0) {
    if (!showEmptyState) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitleWithIcon title="التقييمات" icon={MessageSquare} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد تقييمات منشورة بعد لمحتوى {clientName}. عند إضافة تعليقات على مقالات هذا العميل ستظهر هنا.
          </p>
          <Link
            href={`/clients/${encodeURIComponent(clientSlug)}/reviews`}
            className="inline-block mt-3 text-sm text-primary hover:underline"
          >
            عرض التقييمات
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="التقييمات" icon={MessageSquare} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {previewReviews.map((review) => {
            const initials = (review.author?.name || "مستخدم")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={review.id}
                className="flex gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {review.author?.image ? (
                    <AvatarImage src={review.author.image} alt={review.author.name ?? "مراجع"} />
                  ) : (
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium">{review.author?.name || "مستخدم مجهول"}</span>
                  <Link
                    href={`/articles/${review.article.slug}`}
                    className="block text-xs text-primary hover:underline mt-0.5 truncate"
                  >
                    على: {review.article.title}
                  </Link>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground line-clamp-2">
                    {review.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Link
          href={`/clients/${encodeURIComponent(clientSlug)}/reviews`}
          className="inline-block mt-4 text-sm text-primary hover:underline"
        >
          عرض كل التقييمات
        </Link>
      </CardContent>
    </Card>
  );
}
