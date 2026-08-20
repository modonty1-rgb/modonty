"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { RelativeTime } from "@/components/date/RelativeTime";
import { CommentForm } from "@/components/shared/comment-form/CommentForm";
import { AuthPromptLazy, warmAuthPrompt } from "@/components/shared/auth-prompt/AuthPromptLazy";
import { IconLike, IconReply, IconUser } from "@/lib/icons";
import { cn } from "@/lib/utils";

import { fetchReelComments } from "../data/fetch-reel-comments";
import { submitReelComment } from "../actions/submit-reel-comment";
import { submitReelCommentReply } from "../actions/submit-reel-comment-reply";
import { toggleReelCommentLike } from "../actions/toggle-reel-comment-like";
import type { ReelComment } from "../data/get-reel-comments";

interface ReelCommentsSheetProps {
  mediaId: string;
  /** APPROVED count from the feed — the headline until the real list arrives. */
  commentsCount: number;
  isLoggedIn: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The TikTok-style bottom sheet: the reel keeps playing behind it, the conversation slides
 * over the lower half. Everyone can read; writing goes through the same contract as article
 * comments — sign in, then the comment waits for the partner's approval, so a fresh submit
 * is answered with «يظهر بعد المراجعة» instead of appearing in the list.
 */
export function ReelCommentsSheet({
  mediaId,
  commentsCount,
  isLoggedIn,
  open,
  onOpenChange,
}: ReelCommentsSheetProps) {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    setError(null);
    fetchReelComments(mediaId)
      .then((data) => {
        setComments(data);
        setFetched(true);
      })
      .catch(() => setError("فشل تحميل التعليقات"))
      .finally(() => setLoading(false));
  }, [open, fetched, mediaId]);

  const handleLike = async (commentId: string) => {
    if (!isLoggedIn) {
      setAuthOpen(true);
      return;
    }
    // Optimistic flip; the server answer rewrites it with the real count.
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, likedByMe: !c.likedByMe, likesCount: Math.max(0, c.likesCount + (c.likedByMe ? -1 : 1)) }
          : c
      )
    );
    const res = await toggleReelCommentLike(commentId);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId && res.success
          ? { ...c, likedByMe: res.liked, likesCount: res.likes }
          : c
      )
    );
    if (!res.success) setFetched(false); // reload the truth on failure
  };

  const shownCount = fetched ? comments.length : commentsCount;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex h-[70dvh] flex-col rounded-t-2xl border-neutral-800 bg-neutral-950 p-0 text-white"
          dir="rtl"
        >
          <SheetHeader className="border-b border-neutral-800 px-4 py-3 text-center">
            <SheetTitle className="text-sm font-bold text-white">
              التعليقات ({shownCount.toLocaleString("ar-SA")})
            </SheetTitle>
            <SheetDescription className="sr-only">
              تعليقات الزوّار على هذا الريل
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="size-8 shrink-0 rounded-full bg-neutral-800" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 bg-neutral-800" />
                    <Skeleton className="h-3 w-full bg-neutral-800" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="py-8 text-center">
                <p className="mb-2 text-sm text-red-400">{error}</p>
                <Button variant="outline" size="sm" onClick={() => { setFetched(false); setError(null); }}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : comments.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-400">
                ما فيه تعليقات لحد الآن. تكون أول واحد؟
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <Avatar className="size-8 shrink-0">
                    {comment.author?.image && (
                      <AvatarImage src={comment.author.image} alt={comment.author.name ?? undefined} />
                    )}
                    <AvatarFallback className="bg-neutral-800 text-xs font-semibold text-white">
                      {comment.author?.name?.charAt(0) ?? <IconUser className="size-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-300">
                        {comment.author?.name || "ضيف"}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        <RelativeTime date={comment.createdAt} dateTime={comment.createdAt.toISOString()} />
                      </span>
                    </div>
                    {comment.replyingTo && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500">
                        <IconReply className="size-3" aria-hidden />
                        رداً على @{comment.replyingTo.authorName}
                      </p>
                    )}
                    <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>

                    <div className="mt-1 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleLike(comment.id)}
                        className={cn(
                          "flex items-center gap-1 text-xs transition",
                          comment.likedByMe ? "text-[#3030FF]" : "text-neutral-400 hover:text-white"
                        )}
                        aria-pressed={comment.likedByMe}
                        aria-label="إعجاب بالتعليق"
                      >
                        <IconLike className={cn("size-3.5", comment.likedByMe && "fill-current")} />
                        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          isLoggedIn
                            ? setReplyTo((r) => (r === comment.id ? null : comment.id))
                            : setAuthOpen(true)
                        }
                        className="flex items-center gap-1 text-xs text-neutral-400 transition hover:text-white"
                      >
                        <IconReply className="size-3.5" />
                        رد
                      </button>
                    </div>

                    {replyTo === comment.id && isLoggedIn && (
                      <div className="mt-2 border-t border-neutral-800 pt-2">
                        <CommentForm
                          onSubmit={(content) => submitReelCommentReply(mediaId, comment.id, content)}
                          onSuccess={() => setReplyTo(null)}
                          placeholder="اكتب ردك..."
                          submitLabel="رد"
                          compact
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-neutral-800 px-4 py-3">
            {isLoggedIn ? (
              <CommentForm
                onSubmit={(content) => submitReelComment(mediaId, content)}
                placeholder="اكتب تعليقك..."
                submitLabel="إرسال"
                compact
              />
            ) : (
              <Button
                type="button"
                onPointerEnter={warmAuthPrompt}
                onPointerDown={warmAuthPrompt}
                onClick={() => setAuthOpen(true)}
                className="h-11 w-full font-semibold"
              >
                سجّل دخولك عشان تعلّق
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {authOpen && <AuthPromptLazy open onOpenChange={setAuthOpen} action="comment" />}
    </>
  );
}
