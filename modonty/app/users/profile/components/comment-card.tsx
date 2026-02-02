"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import Link from "@/components/link";
import { formatRelativeTime } from "@/lib/utils";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    createdAt: Date;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    article: {
      title: string;
      slug: string;
      client?: {
        name: string;
      };
    };
    likesCount?: number;
    dislikesCount?: number;
    repliesCount?: number;
    author?: {
      name: string | null;
      image: string | null;
    };
    likedAt?: Date;
  };
  showAuthor?: boolean;
  showLikedAt?: boolean;
}

const statusConfig = {
  APPROVED: {
    label: "موافق عليه",
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  PENDING: {
    label: "قيد المراجعة",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  REJECTED: {
    label: "مرفوض",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
};

export function CommentCard({ comment, showAuthor = false, showLikedAt = false }: CommentCardProps) {
  return (
    <Link href={`/articles/${comment.article.slug}#comment-${comment.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-primary flex-1">
                  {comment.article.title}
                </h4>
                {comment.status && (
                  <Badge className={statusConfig[comment.status].className}>
                    {statusConfig[comment.status].label}
                  </Badge>
                )}
              </div>
              {comment.article.client && (
                <p className="text-xs text-muted-foreground">
                  {comment.article.client.name}
                </p>
              )}
            </div>

            <p className="text-sm text-foreground line-clamp-3">
              {comment.content}
            </p>

            {showAuthor && comment.author && (
              <p className="text-xs text-muted-foreground">
                بواسطة: {comment.author.name || "مستخدم"}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {typeof comment.likesCount === "number" && (
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {comment.likesCount}
                  </span>
                )}
                {typeof comment.dislikesCount === "number" && (
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" />
                    {comment.dislikesCount}
                  </span>
                )}
                {typeof comment.repliesCount === "number" && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {comment.repliesCount}
                  </span>
                )}
              </div>
              <span>
                {showLikedAt && comment.likedAt
                  ? `أُعجِب به ${formatRelativeTime(comment.likedAt)}`
                  : formatRelativeTime(comment.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
