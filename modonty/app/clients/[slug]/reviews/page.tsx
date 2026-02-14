import { notFound } from "next/navigation";
import { getClientReviewsBySlug } from "../helpers/client-reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "@/components/link";
import { MessageSquare } from "lucide-react";

interface ClientReviewsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientReviewsPage({ params }: ClientReviewsPageProps) {
  const { slug } = await params;

  const data = await getClientReviewsBySlug(slug);

  if (!data) {
    notFound();
  }

  const { client, reviews } = data;

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            التقييمات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد تقييمات منشورة بعد لمحتوى {client.name}. عند إضافة تعليقات على مقالات هذا العميل ستظهر هنا.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          التقييمات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review) => {
          const initials = (review.author?.name || "مستخدم")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={review.id}
              className="flex gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-3"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                {review.author?.image ? (
                  <AvatarImage src={review.author.image} alt={review.author.name ?? "مراجع"} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {review.author?.name || "مستخدم مجهول"}
                    </span>
                    <Link
                      href={`/articles/${review.article.slug}`}
                      className="text-xs text-primary hover:underline"
                    >
                      على مقال: {review.article.title}
                    </Link>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {review.content}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

