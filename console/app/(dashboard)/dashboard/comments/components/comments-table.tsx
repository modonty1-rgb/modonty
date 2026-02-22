"use client";

import { useState } from "react";
import Link from "next/link";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { CommentWithDetails } from "../helpers/comment-queries";
import {
  approveComment,
  rejectComment,
  deleteComment,
  bulkApproveComments,
  bulkRejectComments,
} from "../actions/comment-actions";

interface CommentsTableProps {
  comments: CommentWithDetails[];
  clientId: string;
}

function statusLabel(status: string): string {
  const c = ar.comments;
  if (status === "PENDING") return c.pending;
  if (status === "APPROVED") return c.approved;
  if (status === "REJECTED") return c.rejected;
  return status;
}

export function CommentsTable({ comments, clientId }: CommentsTableProps) {
  const c = ar.comments;
  const [filter, setFilter] = useState<string>("all");
  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredComments =
    filter === "all"
      ? comments
      : comments.filter((co) => co.status.toLowerCase() === filter);

  const handleApprove = async (commentId: string) => {
    setUpdating(commentId);
    const result = await approveComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || c.approveFailed);
    }
    setUpdating(null);
  };

  const handleReject = async (commentId: string) => {
    setUpdating(commentId);
    const result = await rejectComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || c.rejectFailed);
    }
    setUpdating(null);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(c.deleteConfirm)) return;

    setUpdating(commentId);
    const result = await deleteComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || c.deleteFailed);
    }
    setUpdating(null);
  };

  const handleBulkApprove = async () => {
    if (selectedComments.size === 0) return;

    const result = await bulkApproveComments(
      Array.from(selectedComments),
      clientId
    );
    if (result.success) {
      setSelectedComments(new Set());
    } else {
      alert(result.error || c.bulkApproveFailed);
    }
  };

  const handleBulkReject = async () => {
    if (selectedComments.size === 0) return;

    const result = await bulkRejectComments(
      Array.from(selectedComments),
      clientId
    );
    if (result.success) {
      setSelectedComments(new Set());
    } else {
      alert(result.error || c.bulkRejectFailed);
    }
  };

  const toggleSelect = (commentId: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{c.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredComments.length} {c.commentsCount}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              {c.all}
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              {c.pending}
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              {c.approved}
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
            >
              {c.rejected}
            </Button>
          </div>
        </div>
        {selectedComments.size > 0 && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleBulkApprove}>
              <Check className="h-3 w-3 me-2" />
              {c.approveSelected} ({selectedComments.size})
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkReject}>
              <X className="h-3 w-3 me-2" />
              {c.rejectSelected} ({selectedComments.size})
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredComments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {c.noCommentsFound}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg border border-border"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={() => toggleSelect(comment.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {comment.author?.name || c.anonymous}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {comment.author?.email || c.noEmail}
                        </p>
                        <Link
                          href={`/dashboard/articles`}
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          {comment.article.title}
                        </Link>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(comment.id)}
                          disabled={
                            updating === comment.id ||
                            comment.status === "APPROVED"
                          }
                          title={c.approveComment}
                        >
                          <Check className="h-3 w-3 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(comment.id)}
                          disabled={
                            updating === comment.id ||
                            comment.status === "REJECTED"
                          }
                          title={c.rejectComment}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(comment.id)}
                          disabled={updating === comment.id}
                          title={c.deleteComment}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mt-2">
                      {comment.content}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          comment.status === "PENDING"
                            ? "bg-muted text-muted-foreground"
                            : comment.status === "APPROVED"
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {statusLabel(comment.status)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {comment._count.likes}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        {comment._count.dislikes}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {comment._count.replies} {c.replies}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString("ar-SA")}
                      </span>
                    </div>

                    {comment.parent && (
                      <div className="mt-2 ps-4 border-s-2 border-muted">
                        <p className="text-xs text-muted-foreground">
                          {c.replyTo}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {comment.parent.content.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
