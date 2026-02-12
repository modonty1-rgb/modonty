'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/date/RelativeTime";
import { cn } from "@/lib/utils";
import { MessageCircle, Reply, LogIn, ThumbsUp, ThumbsDown, User, AlertCircle } from "lucide-react";
import { CommentForm } from "./comment-form";
import Link from "@/components/link";
import { useRouter } from "next/navigation";
import { submitComment, submitReply, likeComment, dislikeComment, approveComment, approveAllCommentsForArticle } from "../actions/comment-actions";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  status?: string;
  parentId?: string | null;
  replyingTo?: { id: string; authorName: string } | null;
  isOrphaned?: boolean;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  _count?: {
    likes: number;
    dislikes: number;
  };
  likes?: { id: string }[];
  dislikes?: { id: string }[];
}

interface ArticleCommentsProps {
  comments: Comment[];
  articleId: string;
  articleSlug: string;
  userId?: string | null;
}

export function ArticleComments({ comments: initialComments, articleId, articleSlug, userId }: ArticleCommentsProps) {
  const [comments, setComments] = useState(initialComments);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter(); 


  const handleCommentSubmit = async (content: string) => {
    const result = await submitComment(articleId, articleSlug, content);
    return result;
  };

  const handleReplySubmit = async (content: string, parentCommentId: string) => {
    const result = await submitReply(articleId, articleSlug, parentCommentId, content);
    return result;
  };

  const handleSuccess = () => {
    // Optionally refresh comments (though new ones won't show until approved)
    // For now, we just show the success message
  };

  const handleLike = async (commentId: string) => {
    if (!userId) {
      router.push('/users/login');
      return;
    }

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const currentLikesCount = comment._count?.likes || 0;
        const currentDislikesCount = comment._count?.dislikes || 0;
        const userLiked = comment.likes && comment.likes.length > 0;
        const userDisliked = comment.dislikes && comment.dislikes.length > 0;

        let newLikesCount = currentLikesCount;
        let newDislikesCount = currentDislikesCount;
        let newUserLiked = userLiked;

        if (userLiked) {
          newLikesCount--;
          newUserLiked = false;
        } else {
          newLikesCount++;
          newUserLiked = true;
          if (userDisliked) {
            newDislikesCount--;
          }
        }

        return {
          ...comment,
          _count: {
            likes: newLikesCount,
            dislikes: newDislikesCount,
          },
          likes: newUserLiked ? [{ id: 'temp' }] : [],
          dislikes: [],
        };
      }
      return comment;
    });

    setComments(updatedComments);

    try {
      const result = await likeComment(commentId, articleSlug);

      if (!result.success) {
        throw new Error(result.error || 'Like operation failed');
      }

    } catch (error) {
      setComments(initialComments);
    }
  };

  const handleDislike = async (commentId: string) => {
    if (!userId) {
      router.push('/users/login');
      return;
    }

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const currentLikesCount = comment._count?.likes || 0;
        const currentDislikesCount = comment._count?.dislikes || 0;
        const userLiked = comment.likes && comment.likes.length > 0;
        const userDisliked = comment.dislikes && comment.dislikes.length > 0;

        let newLikesCount = currentLikesCount;
        let newDislikesCount = currentDislikesCount;
        let newUserDisliked = userDisliked;

        if (userDisliked) {
          newDislikesCount--;
          newUserDisliked = false;
        } else {
          newDislikesCount++;
          newUserDisliked = true;
          if (userLiked) {
            newLikesCount--;
          }
        }

        return {
          ...comment,
          _count: {
            likes: newLikesCount,
            dislikes: newDislikesCount,
          },
          likes: [],
          dislikes: newUserDisliked ? [{ id: 'temp' }] : [],
        };
      }
      return comment;
    });

    setComments(updatedComments);

    try {
      const result = await dislikeComment(commentId, articleSlug);

      if (!result.success) {
        throw new Error(result.error || 'Dislike operation failed');
      }

    } catch (error) {
      setComments(initialComments);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      const result = await approveComment(commentId, articleSlug);
      
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const handleApproveAll = async () => {
    try {
      const result = await approveAllCommentsForArticle(articleId, articleSlug);
      
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    
    const likesCount = comment._count?.likes || 0;
    const dislikesCount = comment._count?.dislikes || 0;
    const userLiked = comment.likes && comment.likes.length > 0;
    const userDisliked = comment.dislikes && comment.dislikes.length > 0;

    return (
      <div className="rounded-lg border bg-card p-3 hover:bg-muted/40 transition-colors">
        {/* Reply indicator */}
        {comment.replyingTo && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Reply className="h-3 w-3" />
            <span>Replying to</span>
            <span className="font-medium text-foreground">
              @{comment.replyingTo.authorName}
            </span>
          </div>
        )}

        {/* Author + Avatar */}
        <div className="flex items-start gap-2">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {comment.author?.image ? (
              <>
                <AvatarImage src={comment.author.image} alt={comment.author.name ?? undefined} />
                <AvatarFallback>{comment.author.name?.charAt(0) ?? <User className="h-4 w-4" />}</AvatarFallback>
              </>
            ) : (
              <AvatarFallback>
                {comment.author?.name ? comment.author.name.charAt(0) : <User className="h-4 w-4" />}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Author and time */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.author?.name || "ضيف"}
              </span>
              {comment.isOrphaned && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <AlertCircle className="h-3 w-3" />
                  Orphaned
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                <RelativeTime date={comment.createdAt} dateTime={comment.createdAt.toISOString()} />
              </span>
            </div>
            
            {/* Comment content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              {userId && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Reply className="h-3 w-3" />
                  رد
                </button>
              )}
              
              {userId && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={cn(
                      "text-xs hover:text-foreground flex items-center gap-1 transition-colors",
                      userLiked ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <ThumbsUp className={cn("h-3 w-3", userLiked && "fill-current")} />
                    {likesCount > 0 && <span>{likesCount}</span>}
                  </button>
                  
                  <button
                    onClick={() => handleDislike(comment.id)}
                    className={cn(
                      "text-xs hover:text-foreground flex items-center gap-1 transition-colors",
                      userDisliked ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    <ThumbsDown className={cn("h-3 w-3", userDisliked && "fill-current")} />
                    {dislikesCount > 0 && <span>{dislikesCount}</span>}
                  </button>
                </div>
              )}

              {comment.status !== 'APPROVED' && (
                <button
                  onClick={() => handleApprove(comment.id)}
                  className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <span>✓ Approve</span>
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && userId && (
              <div className="mt-3 pt-3 border-t">
                <CommentForm
                  onSubmit={(content) => handleReplySubmit(content, comment.id)}
                  onSuccess={() => {
                    setShowReplyForm(false);
                    handleSuccess();
                  }}
                  placeholder="اكتب ردك..."
                  submitLabel="رد"
                  compact={true}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="article-comments" className="my-8 md:my-12">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">التعليقات ({comments.length})</h2>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={handleApproveAll}
            variant="outline"
            size="sm"
            className="gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
          >
            <span className="text-xs">✓ Approve All (Dev)</span>
          </Button>
        )}
      </div>

      {/* Comment Form - Show if user is authenticated */}
      {userId ? (
        <div className="mb-8">
          <CommentForm
            onSubmit={handleCommentSubmit}
            onSuccess={handleSuccess}
            placeholder="اكتب تعليقك هنا..."
            submitLabel="إرسال التعليق"
          />
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-muted/30 p-6 text-center">
          <LogIn className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            يرجى تسجيل الدخول لإضافة تعليق
          </p>
          <Button variant="default">
            <Link href="/users/login">تسجيل الدخول</Link>
          </Button>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
}
