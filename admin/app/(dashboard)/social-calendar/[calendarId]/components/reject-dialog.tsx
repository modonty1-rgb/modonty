"use client";

import { useState, useTransition } from "react";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

import { rejectSocialPost } from "../../actions";

/**
 * رفض الإبداع (القديم `CalendarTable.tsx:511-547`). من «جاهز للمراجعة» الملاحظة اختيارية كالقديم؛
 * من «جاهز للنشر» (إرجاع الميديا باير — س٧) إلزامية، والخادم يفرضها أيضاً.
 */
export function RejectDialog({
  postId,
  open,
  onOpenChange,
  requireNote = false,
  onDone,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requireNote?: boolean;
  onDone: () => void;
}) {
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function close() {
    onOpenChange(false);
    setNote("");
  }

  function submit() {
    startTransition(async () => {
      const res = await rejectSocialPost({ postId, note });
      if (res.success) {
        toast({ title: "تم الرفض — رجع لـ قيد الإنتاج", variant: "success" });
        close();
        onDone();
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            {requireNote ? "إرجاع للإنتاج" : "رفض الإبداع"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <p className="text-sm text-muted-foreground">
            سيرجع المنشور لحالة <span className="font-semibold text-foreground">قيد الإنتاج</span>. أضف سبب الرفض حتى
            يعرف الإبداع ما المطلوب.
          </p>
          <Textarea
            placeholder="سبب الرفض... (مثال: الألوان لا تتوافق مع الهوية، النص يحتاج مراجعة)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            className="resize-none text-sm"
          />
          {requireNote && !note.trim() && <p className="text-[11px] text-muted-foreground">السبب مطلوب عند الإرجاع من مرحلة النشر.</p>}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={close}>
            إلغاء
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending || (requireNote && !note.trim())}
            onClick={submit}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            {pending ? "جاري الرفض..." : "رفض وإعادة للإنتاج"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
