"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, CheckCircle2, Clapperboard, Eye, Pencil, Send, Share2, XCircle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { PostSummary } from "../../components/post-summary";
import { RejectDialog } from "../../components/reject-dialog";
import { postHref } from "../../../helpers/post-href";
import type { SocialPostRow } from "../../../helpers/queries";
import { ApproveDialog } from "./approve-dialog";
import type { CalendarPermissions } from "./calendar-table";

const btn = "inline-flex h-6 w-6 items-center justify-center rounded-md p-0 transition-colors";

/**
 * أكشنات الصفّ عند المرور (القديم `ActionsMenu` — `CalendarTable.tsx:245-550`).
 *
 * الروابط إلى صفحات المراحل تظهر للجميع (الصفحة نفسها تُعرض للقراءة لمن لا يملك الفعل)؛
 * الأفعال — موافقة · رفض · تعديل · أرشفة — لا تظهر إلّا لمن تسمح له `post-permissions`.
 *
 * «نسخ رابط المشاركة» صار رابط صفحة المنشور داخل الأدمن: الرابط العامّ القديم `/view/entry`
 * سقط في الإصدار الأول (س١١) لأن الأدمن كلّه خلف تسجيل دخول.
 */
export function RowActions({
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
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  async function share() {
    const url = `${window.location.origin}${postHref(clientId, post.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "تم نسخ رابط المنشور", variant: "success" });
    } catch (error) {
      console.warn("[social-calendar] clipboard failed", error);
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  }

  const productionLink = (
    <Link
      href={postHref(clientId, post.id, "production")}
      className={cn(btn, "text-muted-foreground hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/40")}
      title="صفحة الإنتاج"
    >
      <Clapperboard className="h-3.5 w-3.5" />
    </Link>
  );

  return (
    <>
      <div className="flex items-center gap-0.5">
        {post.status === "IN_PRODUCTION" && productionLink}

        {post.status === "READY_FOR_REVIEW" && (
          <>
            {permissions.review && (
              <>
                <button
                  type="button"
                  onClick={() => setApproveOpen(true)}
                  className={cn(btn, "text-muted-foreground hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40")}
                  title="منح الموافقة"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  className={cn(btn, "text-muted-foreground hover:bg-destructive/10 hover:text-destructive")}
                  title="رفض الإبداع"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {productionLink}
          </>
        )}

        {(post.status === "READY_TO_PUBLISH" || post.status === "PUBLISHED") && (
          <>
            <Link
              href={postHref(clientId, post.id, "publish")}
              className={cn(btn, "text-muted-foreground hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40")}
              title="صفحة النشر"
            >
              <Send className="h-3.5 w-3.5" />
            </Link>
            {productionLink}
          </>
        )}

        <button
          type="button"
          onClick={() => setViewOpen(true)}
          className={cn(btn, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="عرض التفاصيل"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        {permissions.editBrief && (
          <Link
            href={postHref(clientId, post.id, "edit")}
            className={cn(btn, "text-muted-foreground hover:bg-muted hover:text-foreground")}
            title="تعديل"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
        )}
        <button
          type="button"
          onClick={share}
          className={cn(btn, "text-muted-foreground hover:bg-muted hover:text-foreground")}
          title="نسخ رابط المنشور"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
        {permissions.archive && (
          <button
            type="button"
            onClick={onArchive}
            className={cn(btn, "text-muted-foreground hover:bg-destructive/10 hover:text-destructive")}
            title="أرشفة"
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent dir="rtl" className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="pe-6">
              يوم {post.scheduledFor.getUTCDate()} — {post.idea || "بدون فكرة"}
            </DialogTitle>
          </DialogHeader>
          <PostSummary post={post} />
          <div className="flex justify-end border-t pt-3">
            <Link href={postHref(clientId, post.id)} className="text-xs font-medium text-primary hover:underline">
              صفحة المنشور والسجلّ
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {permissions.review && post.status === "READY_FOR_REVIEW" && (
        <>
          <ApproveDialog post={post} open={approveOpen} onOpenChange={setApproveOpen} onDone={onChanged} />
          <RejectDialog postId={post.id} open={rejectOpen} onOpenChange={setRejectOpen} onDone={onChanged} />
        </>
      )}
    </>
  );
}
