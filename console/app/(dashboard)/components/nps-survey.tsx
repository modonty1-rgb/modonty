"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitNps } from "../actions/submit-nps";

const SCORES = Array.from({ length: 11 }, (_, i) => i);

/**
 * استبيان رضا العميل (NPS) — نافذة على نمط تمارا (خالد ١٥ أكتوبر ٢٠٢٦): سؤال · ١١ مربّعاً ٠–١٠ ·
 * «غير مرجّح» تحت الصفر و«مرجّح جداً» تحت العشرة · ×. بعد الرقم سؤالٌ اختياري «ليش؟» ثم شكر.
 * يقرّر ظهورها الخادم (`helpers/get-nps-due.ts`)؛ والـ× تأجيل ١٤ يوماً لا رفض.
 */
export function NpsSurvey() {
  const [open, setOpen] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const close = () => {
    // إغلاقٌ بلا رقم = تأجيل · إغلاقٌ بعد اختيار رقم = إجابته بلا تعليق (اختار، فلا يُسأل ثانيةً)
    if (!done) start(async () => void (await submitNps(score === null ? { dismissed: true } : { score })));
    setOpen(false);
  };

  const send = (withComment: boolean) =>
    start(async () => {
      setError(null);
      const r = await submitNps({ score, ...(withComment && comment.trim() ? { comment: comment.trim() } : {}) });
      if (!r.success) return setError(r.error ?? "تعذّر الإرسال");
      setDone(true);
      setTimeout(() => setOpen(false), 2500);
    });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      {/* بلا تركيزٍ تلقائي: كان يحطّ على «٠» فيبدو مختاراً سلفاً (مقيس بلقطة ١٥ أكتوبر ٢٠٢٦) */}
      <DialogContent dir="rtl" className="max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-emerald-600" aria-hidden />
            <DialogTitle className="text-lg">شكراً لك</DialogTitle>
            <DialogDescription>رأيك وصل لفريق مدونتي، ونشتغل عليه.</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader className="text-start">
              <DialogTitle className="text-lg leading-relaxed">ما مدى احتمال أن توصي بمدونتي لصديق أو زميل؟</DialogTitle>
              <DialogDescription>اختر رقماً من ٠ إلى ١٠.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <div className="grid grid-cols-11 gap-1" role="radiogroup" aria-label="التقييم من ٠ إلى ١٠">
                {SCORES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={score === n}
                    disabled={pending}
                    onClick={() => setScore(n)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border text-sm font-bold tabular-nums transition-colors",
                      score === n ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:bg-primary/10",
                    )}
                  >
                    {n.toLocaleString("ar-EG")}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>غير مرجّح أبداً</span>
                <span>مرجّح جداً</span>
              </div>
            </div>

            {score !== null && (
              <div className="space-y-3">
                <label htmlFor="nps-comment" className="text-sm font-semibold">
                  وش أكثر شي أثّر في تقييمك؟ <span className="font-normal text-muted-foreground">(اختياري)</span>
                </label>
                <Textarea
                  id="nps-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="اكتب بكلماتك…"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => send(true)} disabled={pending}>إرسال</Button>
                  <Button variant="ghost" onClick={() => send(false)} disabled={pending}>أرسل التقييم بلا تعليق</Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
