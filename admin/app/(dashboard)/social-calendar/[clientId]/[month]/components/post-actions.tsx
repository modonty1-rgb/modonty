"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, CheckCircle2, Clapperboard, ExternalLink, Pencil, Send, Share2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

import { RejectDialog } from "../../components/reject-dialog";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import { ApproveDialog } from "./approve-dialog";
import type { CalendarPermissions } from "./calendar-board";

/**
 * أفعال المنشور في تفاصيل الصفّ — أزرار بأسمائها لا أيقونات تظهر عند المرور
 * (مراجعة الواجهة ١٠ أكتوبر ٢٠٢٦). الروابط للجميع، والأفعال لمن تسمح له `post-permissions`.
 */
export function PostActions({
  post,
  clientId,
  permissions,
  onArchive,
  onChanged,
}: {
  post: SocialPostRow;
  clientId: string;
  permissions: CalendarPermissions;
  onArchive: () => void;
  onChanged: () => void;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const canReview = permissions.review && post.status === "READY_FOR_REVIEW";
  const publishStage = post.status === "READY_TO_PUBLISH" || post.status === "PUBLISHED";

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${postHref(clientId, post.id)}`);
      toast({ title: "تم نسخ رابط المنشور", variant: "success" });
    } catch (error) {
      console.warn("[social-calendar] clipboard failed", error);
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-3">
      {canReview && (
        <>
          <Button type="button" size="sm" onClick={() => setApproveOpen(true)} className="h-8 gap-1.5 bg-green-600 text-white hover:bg-green-700">
            <CheckCircle2 className="size-3.5" /> موافقة
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setRejectOpen(true)} className="h-8 gap-1.5 text-destructive hover:text-destructive">
            <XCircle className="size-3.5" /> رفض
          </Button>
          <span className="h-5 w-px bg-border" />
        </>
      )}
      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
        <Link href={postHref(clientId, post.id)}>
          <ExternalLink className="size-3.5" /> صفحة المنشور
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
        <Link href={postHref(clientId, post.id, "production")}>
          <Clapperboard className="size-3.5" /> الإنتاج
        </Link>
      </Button>
      {publishStage && (
        <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
          <Link href={postHref(clientId, post.id, "publish")}>
            <Send className="size-3.5" /> النشر
          </Link>
        </Button>
      )}
      {permissions.editBrief && (
        <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5">
          <Link href={postHref(clientId, post.id, "edit")}>
            <Pencil className="size-3.5" /> تعديل
          </Link>
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={share} className="h-8 gap-1.5">
        <Share2 className="size-3.5" /> نسخ الرابط
      </Button>
      {permissions.archive && (
        <Button type="button" size="sm" variant="ghost" onClick={onArchive} className="ms-auto h-8 gap-1.5 text-muted-foreground hover:text-destructive">
          <Archive className="size-3.5" /> أرشفة
        </Button>
      )}

      {canReview && (
        <>
          <ApproveDialog post={post} open={approveOpen} onOpenChange={setApproveOpen} onDone={onChanged} />
          <RejectDialog postId={post.id} open={rejectOpen} onOpenChange={setRejectOpen} onDone={onChanged} />
        </>
      )}
    </div>
  );
}
