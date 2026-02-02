"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check, MessageSquare, Clock } from "lucide-react";
import type { ArticleWithAllData } from "../helpers/article-queries";
import { approveArticle, requestChanges } from "../actions/article-actions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeedbackForm } from "./feedback-form";

interface ArticleCardProps {
  article: ArticleWithAllData;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const isPending = article.status === "DRAFT";

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this article?")) return;

    setLoading(true);
    try {
      const result = await approveArticle(article.id, article.client.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to approve article");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChanges = async (feedback: string) => {
    setLoading(true);
    try {
      const result = await requestChanges(article.id, article.client.id, feedback);
      if (result.success) {
        setShowFeedback(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to request changes");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
              <CardDescription className="mt-1">
                {article.category?.name ?? "—"} · Created{" "}
                {new Date(article.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                isPending
                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "bg-green-500/10 text-green-600 dark:text-green-400"
              }`}
            >
              {isPending ? "Pending Approval" : "Published"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-4 text-xs text-muted-foreground">
            {article.wordCount && (
              <span>{article.wordCount.toLocaleString()} words</span>
            )}
            {article.readingTimeMinutes && (
              <span>· {article.readingTimeMinutes} min read</span>
            )}
            {article.tags.length > 0 && (
              <span>
                · {article.tags.length} tag{article.tags.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {article.featuredImage && (
            <div className="mb-4 aspect-video w-full max-w-md rounded-lg overflow-hidden bg-muted">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.altText || article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/articles/${article.id}/preview`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </Link>

            {isPending && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(true)}
                  disabled={loading}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              </>
            )}

            {!isPending && article.datePublished && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Published {new Date(article.datePublished).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {showFeedback && (
        <FeedbackForm
          articleTitle={article.title}
          onSubmit={handleRequestChanges}
          onCancel={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
