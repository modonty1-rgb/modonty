"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Link2, ShieldAlert } from "lucide-react";
import { linkCoreMedia, type LinkCoreMediaResult, type PlanAction } from "../actions/link-core-media";

const ACTION_LABEL: Record<PlanAction, { text: string; tone: string }> = {
  "claim-orphan": { text: "تملّك يتيمة", tone: "bg-amber-500/15 text-amber-600" },
  "claim-platform": { text: "تملّك PLATFORM", tone: "bg-amber-500/15 text-amber-600" },
  "link-existing": { text: "ربط علاقة", tone: "bg-blue-500/15 text-blue-600" },
  "create-and-link": { text: "إنشاء صفّ + ربط", tone: "bg-violet-500/15 text-violet-600" },
  "create-row": { text: "إنشاء صفّ", tone: "bg-violet-500/15 text-violet-600" },
  "needs-decision": { text: "⚠️ قرار خالد", tone: "bg-red-500/15 text-red-600" },
  done: { text: "منجز", tone: "bg-emerald-500/15 text-emerald-600" },
};

export function LinkCoreMediaCard() {
  const [result, setResult] = useState<LinkCoreMediaResult | null>(null);
  const [gate, setGate] = useState("");
  const [isPreviewing, startPreview] = useTransition();
  const [isApplying, startApply] = useTransition();

  const run = (mode: "preview" | "apply") => {
    const start = mode === "preview" ? startPreview : startApply;
    start(async () => {
      const r = await linkCoreMedia(mode);
      setResult(r);
      if (mode === "apply") setGate("");
    });
  };

  const totalToDo = result?.scopes.reduce((a, s) => a + s.toDo, 0) ?? 0;
  const totalDone = result?.scopes.reduce((a, s) => a + s.done, 0) ?? 0;
  const totalDecisions = result?.scopes.reduce((a, s) => a + s.decisions, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          تمليك صور المنصّة لمدوّنتي — T2b
        </CardTitle>
        <CardDescription>
          «المعاينة» تعرض الخطة بالضبط بلا أي كتابة. «التنفيذ» إضافي فقط وidempotent (التشغيل
          الثاني يجب أن يُظهر صفر تغييرات) — الحقول النصّية القديمة لا تُلمس أبداً.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Runbook — staged (Khalid's plan 2026-08-01), collapsed by default to keep the
            page compact (his ask: everything visible on one screen). */}
        <details dir="rtl" className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-2">
          <summary className="cursor-pointer text-sm font-bold">📋 خطة التنفيذ — مراحل بالترتيب (اضغط للتفاصيل)</summary>
          <p className="mb-3 text-[12px] text-muted-foreground">القاعدة ✅ <code dir="ltr">modonty_dev</code> (تحقّق 2026-08-01) · عميل «مدونتي» موجود بالإنتاج بنفس الـID (تحقّق قراءة-فقط) · لا باكب — اللوكال يُمسح عمداً.</p>

          <p className="mb-1 text-[13px] font-bold text-amber-600">المرحلة ١ — اللوكال = نسخة الإنتاج طبق الأصل</p>
          <ol className="mb-3 list-decimal space-y-1 ps-5 text-[13px] leading-relaxed">
            <li><b>Sync Local من الإنتاج</b> (زرّ الهيدر) — ٤٤٤ صف media حقيقي يحلّ محل بيانات التست.</li>
            <li><b>تصفير Bunny</b> (كرت العدّادات أدناه — زون clients بالتأكيد النصّي) — نبدأ من صفر ملفات.</li>
            <li><b>ترحيل الصور Cloudinary ← Bunny</b> (كرت الترحيل أدناه) — الترحيل الحقيقي كاملاً على بيانات الإنتاج.</li>
            <li><b>بوابة المرحلة:</b> المسح الكامل + تست متصفّح — صفر Cloudinary · صفر صورة مكسورة. <b>هنا نكتشف أي مشكلة قبل الإنتاج لا بعده.</b></li>
          </ol>

          <p className="mb-1 text-[13px] font-bold text-amber-600">المرحلة ٢ — تفعيل الكور</p>
          <ol className="mb-3 list-decimal space-y-1 ps-5 text-[13px] leading-relaxed" start={5}>
            <li><b>ضبط coreClientId:</b> من <code dir="ltr">/settings/system</code> اختر «مدونتي» واحفظ (ضغطة وحدة — الحقل غير موجود ببيانات الإنتاج).</li>
            <li><b>حسم القرارات الحمراء:</b> Preview أدناه — أي بادج «قرار خالد» (صورة كيان مملوكة لعميل آخر) يُحسم من فورم الكيان أو يُترك (الزرّ يتخطّاه بأمان).</li>
          </ol>

          <p className="mb-1 text-[13px] font-bold text-amber-600">المرحلة ٣ — التمليك (هذا الكرت)</p>
          <ol className="mb-1 list-decimal space-y-1 ps-5 text-[13px] leading-relaxed" start={7}>
            <li><b>Preview:</b> اقرأ الخطة بنداً بنداً — كل بند نوع عمليته صحيح.</li>
            <li><b>Run الأول:</b> اكتب <code dir="ltr">LINK</code> ثم Run — وثّق الأرقام (تملُّك / ربط / إنشاء).</li>
            <li><b>الإثبات:</b> Preview ثانية = «سيُنفَّذ: 0» · ثم Run ثانٍ = صفر تغييرات (idempotent).</li>
            <li><b>تحقق + توثيق:</b> عيّنات (فورم وسم + صفحة مودونتي) · النصوص القديمة بلا مساس · النتائج تُسجَّل في كرت T2b بالـflow ← Done.</li>
          </ol>
          <p className="mt-2 text-[12px] text-muted-foreground">⛔ الإعادة على الإنتاج الحقيقي لاحقاً (بعد الـmerge) — بنفس هذه المراحل حرفياً.</p>
        </details>

        <div className="flex items-center gap-3">
          <Button onClick={() => run("preview")} disabled={isPreviewing || isApplying} variant="outline" className="gap-1.5">
            {isPreviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            بروفة بلا تنفيذ — شوف إيش اللي بيتعدل قبل ما توقّع
          </Button>
          {result?.mode === "preview" && result.ok && (
            <span className="text-sm text-muted-foreground">
              سيُنفَّذ: <b className="text-foreground">{totalToDo}</b> · منجز: {totalDone}
              {totalDecisions > 0 && <b className="text-red-500"> · قرارات: {totalDecisions}</b>}
            </span>
          )}
        </div>

        {result?.error && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}

        {result?.ok && (
          <div className="space-y-3">
            {result.scopes.map((s) => (
              <div key={s.scope} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">{s.scope}</span>
                  <span className="text-xs text-muted-foreground">
                    سيُنفَّذ {s.toDo} · منجز {s.done}
                    {s.decisions > 0 && <span className="text-red-500"> · قرارات {s.decisions}</span>}
                  </span>
                </div>
                {s.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">لا بنود.</p>
                ) : (
                  <ul className="max-h-44 space-y-1 overflow-y-auto pe-1">
                    {s.items.map((it, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={`shrink-0 border-0 font-normal ${ACTION_LABEL[it.action].tone}`}>
                          {ACTION_LABEL[it.action].text}
                        </Badge>
                        <span className="truncate" title={it.url}>{it.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {result.mode === "apply" && result.applied && (
              <p className="text-sm font-medium text-emerald-600">
                نُفِّذ: تملُّك {result.applied.claimed} · ربط {result.applied.linked} · إنشاء {result.applied.created} · تخطٍّ {result.applied.skipped}
              </p>
            )}
          </div>
        )}

        {/* Run — gated. NOT to be used until Khalid explicitly starts T2b-2. */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-red-500/40 p-3">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
          <span className="text-xs text-muted-foreground">للتشغيل (بأمر خالد فقط): اكتب LINK ثم اضغط «نفّذ»</span>
          <Input value={gate} onChange={(e) => setGate(e.target.value)} placeholder="LINK" className="h-8 w-24 text-xs" />
          <Button
            onClick={() => run("apply")}
            disabled={gate !== "LINK" || isApplying || isPreviewing || !result?.ok}
            variant="destructive"
            size="sm"
            className="gap-1.5"
          >
            {isApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            نفّذ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
