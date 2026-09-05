"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, ThumbsDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { markLost, reopenLead } from "../actions";
import { LOST_LABEL, LOST_REASONS, type LostReason } from "../helpers/funnel";

/**
 * إقفال العميل كخسارة — وحوارٌ لا زرّ لأنه يسأل سؤالاً واحداً لا يُسأل في مكانٍ آخر: **ليه؟**
 *
 * بدون الجواب يبقى «خسرنا ٤٠ صفقة» رقماً ميتاً؛ ومعه يُعرف إن كان السعر يطرد الناس أم
 * المتابعة تتأخّر أم السوق غلط. والسبب إلزاميّ هنا بينما كل شيء آخر في هذه الشاشة اختياري،
 * لأنه اللحظة الوحيدة التي يُعرف فيها الجواب: بعد أسبوع لن يتذكّره أحد.
 */
export function LostDialog({
  leadId,
  leadName,
  className,
}: {
  leadId: string;
  leadName: string;
  /** يمرّره العمود الجانبيّ ليمدّ الزرّ على عرضه — الشكل قرارُ المكان لا قرارُ الحوار. */
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<LostReason | "">("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      if (!reason) return;
      const r = await markLost(leadId, { reason, note: note || undefined });
      if (r.success) {
        setOpen(false);
        toast({ title: "أُغلق كخسارة", variant: "success" });
        router.refresh();
      } else {
        toast({ title: r.error, variant: "destructive" });
      }
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-1.5 text-muted-foreground", className)}>
          <ThumbsDown className="size-3.5" aria-hidden /> خسرناه
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>قفل {leadName} كخسارة</DialogTitle>
          <DialogDescription>
            سيختفي من القائمة ومن قائمة المتابعة. تقدرين ترجعينه في أي وقت.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">لماذا خسرناه؟</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LOST_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  aria-pressed={reason === r}
                  className={cn(
                    "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                    reason === r
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {LOST_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="lostNote" className="text-xs">تفاصيل إضافية (اختياري)</Label>
            <Textarea
              id="lostNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="قال إن العرض أغلى من عرض غيرنا بـ٣٠٪."
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          {/* الزرّ معطّل حتى يُختار سبب — ولا يُخفى: زرٌّ ظاهرٌ معطَّل يقول «ينقصك حاجة»،
              وزرٌّ مختفٍ يقول «مافيش زرّ». */}
          <Button onClick={submit} disabled={pending || !reason} variant="destructive" className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "جارٍ الإغلاق…" : "أغلقيه"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** الخسارة قرارٌ يُراجَع لا حائط — عميلٌ قال «مش دلوقتي» يرجع بعد ثلاثة شهور. */
export function ReopenButton({ leadId, className }: { leadId: string; className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-1.5", className)}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reopenLead(leadId);
          if (r.success) {
            toast({ title: "أرجعه للقائمة", variant: "success" });
            router.refresh();
          } else {
            toast({ title: r.error, variant: "destructive" });
          }
        })
      }
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" aria-hidden />}
      أرجعه للقائمة
    </Button>
  );
}
