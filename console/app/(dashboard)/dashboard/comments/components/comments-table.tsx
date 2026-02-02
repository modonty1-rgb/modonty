"use client";

import { useState } from "react";
import Link from "next/link";
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

export function CommentsTable({ comments, clientId }: CommentsTableProps) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );
  const [updating, setUpdating] = useState<string | null>(null);

  const filteredComments =
    filter === "all"
      ? comments
      : comments.filter((c) => c.status.toLowerCase() === filter);

  const handleApprove = async (commentId: string) => {
    setUpdating(commentId);
    const result = await approveComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to approve comment");
    }
    setUpdating(null);
  };

  const handleReject = async (commentId: string) => {
    setUpdating(commentId);
    const result = await rejectComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to reject comment");
    }
    setUpdating(null);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setUpdating(commentId);
    const result = await deleteComment(commentId, clientId);
    if (!result.success) {
      alert(result.error || "Failed to delete comment");
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
      alert(result.error || "Failed to bulk approve");
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
      alert(result.error || "Failed to bulk reject");
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
            <CardTitle className="text-lg">Comments</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredComments.length} comments
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </Button>
          </div>
        </div>
        {selectedComments.size > 0 && (
          <div className="flex gap-2 mt-4">
            <Button size="sm" onClick={handleBulkApprove}>
              <Check className="h-3 w-3 mr-2" />
              Approve Selected ({selectedComments.size})
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkReject}>
              <X className="h-3 w-3 mr-2" />
              Reject Selected ({selectedComments.size})
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredComments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No comments found
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
                          {comment.author?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {comment.author?.email || "No email"}
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
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(comment.id)}
                          disabled={
                            updating === comment.id ||
                            comment.status === "REJECTED"
                          }
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(comment.id)}
                          disabled={updating === comment.id}
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
                            ? "bg-yellow-100 text-yellow-800"
                            : comment.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {comment.status}
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
                        {comment._count.replies} replies
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {comment.parent && (
                      <div className="mt-2 pl-4 border-l-2 border-muted">
                        <p className="text-xs text-muted-foreground">
                          Reply to:
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
