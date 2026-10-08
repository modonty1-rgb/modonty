"use client";

import { useEffect, useRef, useState, type ChangeEventHandler, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SocialChannel, SocialFunnelStage, SocialPostFormat } from "@prisma/client";
import {
  ChevronDown,
  Clapperboard,
  ClipboardList,
  Image as ImageIcon,
  Layers,
  Megaphone,
  ShoppingBag,
  Smartphone,
  ThumbsUp,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { createSocialPost, updateSocialPost } from "../../actions";
import { CHANNEL_ICON } from "../../components/channel-icon";
import { MONTH_LABELS, dayName, daysInMonth, formatDayInput } from "../../helpers/dates";
import {
  CHANNEL_META,
  CHANNEL_ORDER,
  FORMAT_LABEL,
  FORMAT_ORDER,
  FUNNEL_ORDER,
  FUNNEL_SHORT_LABEL,
} from "../../helpers/social-labels";
import { DayCalendar } from "./day-calendar";

export interface PostFormValues {
  year: number;
  /** 0-11 */
  month: number;
  day: number;
  idea: string;
  format: SocialPostFormat | null;
  funnelStages: SocialFunnelStage[];
  channels: SocialChannel[];
  text: string;
  hook: string;
  cta: string;
  scriptUrl: string;
  voiceTone: string;
  inspiration: string;
  notes: string;
}

const FORMAT_ICON: Record<SocialPostFormat, LucideIcon> = {
  VIDEO: Video,
  CAROUSEL: Layers,
  POST: ImageIcon,
  STORY: Smartphone,
  REEL: Clapperboard,
};

const FUNNEL_ICON: Record<SocialFunnelStage, LucideIcon> = {
  AWARENESS: Megaphone,
  ENGAGEMENT: ThumbsUp,
  LEADS: ClipboardList,
  CONVERSION: ShoppingBag,
};

const labelClass = "text-xs font-semibold text-foreground";

function Section({
  title,
  badge,
  children,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const head = (
    <>
      <h3 className="flex-1 text-sm font-bold text-foreground">{title}</h3>
      {badge}
      {collapsible && (
        <ChevronDown className={cn("h-3 w-3 text-muted-foreground/50 transition-transform duration-200", open && "rotate-180")} />
      )}
    </>
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 border-b border-border/60 px-5 py-4 text-start transition-colors hover:bg-muted/20"
        >
          {head}
        </button>
      ) : (
        <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">{head}</div>
      )}
      {open && <div className="space-y-5 p-5">{children}</div>}
    </div>
  );
}

function SidebarCard({ title, detail, children }: { title?: string; detail?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        {title && <h3 className="text-center text-[11px] font-bold text-muted-foreground">{title}</h3>}
        {detail && <p className={cn("text-center text-sm font-semibold leading-tight text-foreground", title && "mt-1")}>{detail}</p>}
      </div>
      <div className="space-y-1.5 p-2.5">{children}</div>
    </div>
  );
}

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("resize-none overflow-hidden transition-[height]", className)}
    />
  );
}

/** عدّاد الأحرف التحذيري (س٨) — كالقديم: لون فقط، لا منع. */
function Counter({ length, warn, danger, alwaysShow = false }: { length: number; warn: number; danger: number; alwaysShow?: boolean }) {
  if (!alwaysShow && length === 0) return null;
  return (
    <span
      className={cn(
        "text-[11px] tabular-nums transition-colors",
        length > danger ? "font-semibold text-red-500" : length > warn ? "text-amber-500" : "text-muted-foreground/50",
      )}
    >
      {length} حرف
    </span>
  );
}

/**
 * نموذج المنشور — الإنشاء والتعديل (القديم `EntryPageForm.tsx`): ثلاثة أعمدة — تقويم اليوم يميناً،
 * المحتوى في الوسط، نوع المحتوى/هدف الحملة/القنوات يساراً — ثم شريط حفظ، ثم نافذة تأكيد فيها
 * «إرسال إشعار على Telegram» (مفعّل افتراضياً في الإنشاء فقط، كالقديم).
 *
 * الفرق المفروض: في التعديل يُنقل المنشور لأي يوم بسنة كاملة (سنة + شهر + يوم) بدل قائمة
 * شهور بلا سنة. والخادم يتحقّق بـ Zod من كل حقل.
 */
export function PostForm({
  mode,
  clientId,
  postId,
  initial,
  postDays,
  todayYmd,
  cancelHref,
}: {
  mode: "create" | "edit";
  clientId: string;
  postId?: string;
  initial: PostFormValues;
  /** أيام الشهر الأصلي التي فيها منشورات. */
  postDays: number[];
  todayYmd: { year: number; month: number; day: number };
  cancelHref: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<PostFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notifyTelegram, setNotifyTelegram] = useState(mode === "create");

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const sameMonth = data.year === initial.year && data.month === initial.month;
  const todayInView = todayYmd.year === data.year && todayYmd.month === data.month ? todayYmd.day : null;
  const additionalFilled = [data.voiceTone, data.inspiration, data.scriptUrl, data.notes].filter((v) => v.trim()).length;
  const yearOptions = Array.from({ length: 5 }, (_, i) => todayYmd.year - 2 + i);
  if (!yearOptions.includes(data.year)) yearOptions.unshift(data.year);

  function setMonthYear(year: number, month: number) {
    setData((prev) => ({ ...prev, year, month, day: Math.min(prev.day, daysInMonth(year, month)) }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!data.idea.trim()) return;
    setShowConfirm(true);
  }

  async function handleConfirm() {
    setShowConfirm(false);
    setSaving(true);
    const brief = {
      date: formatDayInput(data.year, data.month, data.day),
      idea: data.idea,
      format: data.format,
      funnelStages: data.funnelStages,
      channels: data.channels,
      text: data.text,
      hook: data.hook,
      cta: data.cta,
      scriptUrl: data.scriptUrl,
      voiceTone: data.voiceTone,
      inspiration: data.inspiration,
      notes: data.notes,
    };
    try {
      if (mode === "create") {
        const res = await createSocialPost({ ...brief, clientId, notifyTelegram });
        if (!res.success) {
          toast({ title: res.error, variant: "destructive" });
          return;
        }
        toast({ title: "تم إضافة المنشور بنجاح", variant: "success" });
        router.push(`/social-calendar/${clientId}/${res.monthParam}`);
      } else if (postId) {
        const res = await updateSocialPost({ ...brief, postId });
        if (!res.success) {
          toast({ title: res.error, variant: "destructive" });
          return;
        }
        toast({
          title: res.moved
            ? `تم نقل المنشور إلى ${data.day} ${MONTH_LABELS[data.month]} ${data.year}`
            : "تم حفظ التعديلات",
          variant: "success",
        });
        router.push(`/social-calendar/${clientId}/${res.monthParam}`);
      }
    } catch (error) {
      console.error("[social-calendar] save post failed", error);
      toast({ title: "تعذّر الحفظ — تحقّق من الاتصال وحاول مرة أخرى", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[200px_1fr_200px]">
        {/* اليمين — اليوم */}
        <div className="order-2 space-y-4 lg:sticky lg:top-20 lg:order-1">
          <SidebarCard detail={`${dayName(data.year, data.month, data.day)} · ${data.day} ${MONTH_LABELS[data.month]} ${data.year}`}>
            {mode === "edit" && (
              <div className="flex gap-1.5 px-1 pb-2">
                <select
                  aria-label="الشهر"
                  value={data.month}
                  onChange={(e) => setMonthYear(data.year, Number(e.target.value))}
                  className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs font-semibold text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {MONTH_LABELS.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="السنة"
                  value={data.year}
                  onChange={(e) => setMonthYear(Number(e.target.value), data.month)}
                  className="h-9 w-[72px] rounded-md border border-border bg-background px-2 text-xs font-semibold tabular-nums text-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <DayCalendar
              year={data.year}
              month={data.month}
              value={data.day}
              postDays={sameMonth ? postDays : []}
              today={todayInView}
              onChange={(d) => set("day", d)}
            />
          </SidebarCard>
        </div>

        {/* الوسط — المحتوى */}
        <div className="order-1 min-w-0 space-y-5 lg:order-2">
          <Section title="المحتوى">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor="sp-idea" className={labelClass}>
                  الفكرة
                </Label>
                <span className="text-xs leading-none text-red-500" title="مطلوب">
                  *
                </span>
              </div>
              <Input
                id="sp-idea"
                value={data.idea}
                onChange={(e) => set("idea", e.target.value)}
                placeholder="ما هي فكرة المحتوى؟"
                maxLength={500}
                className={cn("h-10 text-sm font-medium transition-all", data.idea && "border-primary/30 bg-primary/5")}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className={labelClass}>النص</Label>
                <Counter length={data.text.length} warn={400} danger={800} alwaysShow />
              </div>
              <AutoTextarea value={data.text} onChange={(e) => set("text", e.target.value)} placeholder="النص الكامل..." className="min-h-28" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className={labelClass}>
                  الخطاف <span className="font-normal text-muted-foreground/60">Hook</span>
                </Label>
                <Counter length={data.hook.length} warn={100} danger={200} />
              </div>
              <AutoTextarea value={data.hook} onChange={(e) => set("hook", e.target.value)} placeholder="الخطاف..." className="min-h-16" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className={labelClass}>
                  الدعوة <span className="font-normal text-muted-foreground/60">CTA</span>
                </Label>
                <Counter length={data.cta.length} warn={80} danger={150} />
              </div>
              <AutoTextarea value={data.cta} onChange={(e) => set("cta", e.target.value)} placeholder="الدعوة للتصرف..." className="min-h-16" />
            </div>
          </Section>

          <Section
            title="معلومات إضافية"
            collapsible
            defaultOpen={additionalFilled > 0}
            badge={
              additionalFilled > 0 ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{additionalFilled}</span>
              ) : (
                <span className="text-[10px] font-normal text-muted-foreground/50">اختياري</span>
              )
            }
          >
            <div className="space-y-1.5">
              <Label className={labelClass}>نبرة الصوت</Label>
              <Input value={data.voiceTone} onChange={(e) => set("voiceTone", e.target.value)} placeholder="نبرة الصوت..." className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>
                الإلهام <span className="font-normal text-muted-foreground/60">Reference</span>
              </Label>
              <Input value={data.inspiration} onChange={(e) => set("inspiration", e.target.value)} placeholder="مرجع أو رابط إلهام..." className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>السيناريو</Label>
              <Input
                value={data.scriptUrl}
                onChange={(e) => set("scriptUrl", e.target.value)}
                placeholder="https://docs.google.com/..."
                dir="ltr"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>ملحوظات</Label>
              <AutoTextarea value={data.notes} onChange={(e) => set("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." className="min-h-16" />
            </div>
          </Section>
        </div>

        {/* اليسار — نوع المحتوى ← هدف الحملة ← القنوات */}
        <div className="order-3 space-y-4 lg:sticky lg:top-20">
          <SidebarCard title="نوع المحتوى">
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
              {FORMAT_ORDER.map((f) => {
                const Icon = FORMAT_ICON[f];
                const active = data.format === f;
                return (
                  <button
                    key={f}
                    type="button"
                    title={FORMAT_LABEL[f]}
                    aria-pressed={active}
                    onClick={() => set("format", active ? null : f)}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all",
                      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-medium leading-none">{FORMAT_LABEL[f]}</span>
                  </button>
                );
              })}
            </div>
          </SidebarCard>

          <SidebarCard title="هدف الحملة">
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1">
              {FUNNEL_ORDER.map((s) => {
                const Icon = FUNNEL_ICON[s];
                const active = data.funnelStages.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    title={FUNNEL_SHORT_LABEL[s]}
                    aria-pressed={active}
                    onClick={() =>
                      set("funnelStages", active ? data.funnelStages.filter((v) => v !== s) : [...data.funnelStages, s])
                    }
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all",
                      active ? "bg-card text-primary shadow-sm" : "text-muted-foreground/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-[9px] font-medium leading-none">{FUNNEL_SHORT_LABEL[s]}</span>
                  </button>
                );
              })}
            </div>
          </SidebarCard>

          <SidebarCard title="القنوات">
            <div className="flex flex-wrap gap-1">
              {CHANNEL_ORDER.map((ch) => {
                const meta = CHANNEL_META[ch];
                const Icon = CHANNEL_ICON[ch];
                const active = data.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    title={meta.label}
                    aria-label={meta.label}
                    aria-pressed={active}
                    onClick={() => set("channels", active ? data.channels.filter((v) => v !== ch) : [...data.channels, ch])}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                      active ? cn("shadow-sm", meta.bg, meta.fg) : "bg-muted/50 text-muted-foreground/50 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
            {data.channels.length > 0 && (
              <p className="pt-0.5 text-center text-[10px] font-semibold leading-none text-primary">
                {data.channels.length === 1 ? "قناة واحدة" : `${data.channels.length} قنوات`}
              </p>
            )}
          </SidebarCard>
        </div>
      </div>

      {/* شريط الحفظ */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-5 flex items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        <Button type="submit" disabled={saving || !data.idea.trim()} className="h-10 min-w-36 font-semibold">
          {saving ? "جاري الحفظ..." : mode === "create" ? "إضافة المنشور" : "حفظ التعديلات"}
        </Button>
        <Button type="button" variant="outline" className="h-10" onClick={() => router.push(cancelHref)}>
          إلغاء
        </Button>
        {!data.idea.trim() && !saving && <span className="ms-auto text-xs text-muted-foreground/70">أضف الفكرة أولاً</span>}
      </div>

      {/* نافذة التأكيد */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "تأكيد إضافة المنشور" : "تأكيد حفظ التعديلات"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1 rounded-xl bg-muted/50 px-4 py-3 text-sm">
              <p className="text-xs text-muted-foreground">
                يوم {data.day} — {MONTH_LABELS[data.month]} {data.year}
                {mode === "edit" && !sameMonth && " (نقل من شهره)"}
              </p>
              <p className="font-semibold leading-snug text-foreground">{data.idea}</p>
            </div>
            {mode === "create" && (
              <label className="flex cursor-pointer select-none items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-muted/30">
                <Checkbox checked={notifyTelegram} onCheckedChange={(v) => setNotifyTelegram(v === true)} />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">إرسال إشعار على Telegram</p>
                  <p className="text-xs text-muted-foreground">إخطار الفريق بهذا المنشور</p>
                </div>
              </label>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void handleConfirm()} disabled={saving} className="font-semibold">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

