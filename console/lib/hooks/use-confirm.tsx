"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ar } from "@/lib/ar";

interface UseConfirmOptions {
  /** نصّ زرّ التأكيد — يبقى نصّ كل شاشة كما هو. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** عنوان الحوار. */
  title?: string;
}

interface PendingConfirm {
  message: string;
  onConfirm: () => void;
  /** فعل الإجراء نفسه — «احذف» · «ارفض» · «انشر». يقرأه العميل فيعرف الناتج بلا ما يرجع للنصّ. */
  actionLabel?: string;
}

/**
 * حوار تأكيد مشترك — بديل `confirmThen` القديم الذي كان توستاً عمره ٨ ثوانٍ.
 *
 * قرار الحذف أو التنفيذ لا يُبنى على مؤقّت: لو تأخّر العميل ضاع التأكيد بلا أثر والزرّ
 * يبدو كأنه لا يعمل. الحوار يبقى حتى يختار، ومخرجه الوحيد «تأكيد» أو «إلغاء» — لا نقرة
 * خارجية ولا Escape ولا زرّ X.
 *
 * التوقيع مطابق للدالة القديمة عمداً، فمواضع الاستدعاء لا تتغيّر:
 *   const { confirmThen, confirmDialog } = useConfirm({ confirmLabel: s.confirm });
 *   confirmThen(s.deleteConfirm, () => { ... });
 *   ...
 *   {confirmDialog}
 */
export function useConfirm(opts: UseConfirmOptions = {}) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirmThen = useCallback(
    (message: string, onConfirm: () => void, actionLabel?: string) => {
      setPending({ message, onConfirm, actionLabel });
    },
    []
  );

  const close = useCallback(() => setPending(null), []);

  const confirmDialog = (
    <Dialog open={pending !== null} onOpenChange={(o) => !o && close()}>
      <DialogContent
        role="alertdialog"
        className="sm:max-w-md [&>button:last-child]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{opts.title ?? ar.confirm.title}</DialogTitle>
          <DialogDescription>{pending?.message}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={close}>
            {opts.cancelLabel ?? ar.confirm.cancel}
          </Button>
          <Button
            onClick={() => {
              pending?.onConfirm();
              close();
            }}
          >
            {pending?.actionLabel ?? opts.confirmLabel ?? ar.confirm.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirmThen, confirmDialog };
}
