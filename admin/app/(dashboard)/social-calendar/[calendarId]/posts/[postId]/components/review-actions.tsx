"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ApproveDialog } from "../../../[month]/components/approve-dialog";
import { RejectDialog } from "../../../components/reject-dialog";
import type { SocialPostRow } from "../../../../helpers/queries";

/**
 * موافقة / رفض من صفحة المنشور — نفس نافذتَي صفّ الجدول، كي لا يضطرّ المراجع للرجوع للشهر.
 * تظهر فقط في «جاهز للمراجعة» ولمن يملك `review` (الصفحة تقرّر ذلك قبل العرض).
 */
export function ReviewActions({ post }: { post: SocialPostRow }) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">الإبداع جاهز وينتظر مراجعتك.</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setRejectOpen(true)} className="gap-1.5 text-destructive hover:text-destructive">
          <XCircle className="h-4 w-4" />
          رفض
        </Button>
        <Button type="button" size="sm" onClick={() => setApproveOpen(true)} className="gap-1.5 bg-green-600 text-white hover:bg-green-700">
          <CheckCircle2 className="h-4 w-4" />
          موافقة
        </Button>
      </div>
      <ApproveDialog post={post} open={approveOpen} onOpenChange={setApproveOpen} onDone={() => router.refresh()} />
      <RejectDialog postId={post.id} open={rejectOpen} onOpenChange={setRejectOpen} onDone={() => router.refresh()} />
    </div>
  );
}
