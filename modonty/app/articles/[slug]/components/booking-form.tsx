"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, CheckCircle2, Lock, MessageSquare, Phone, ShieldCheck } from "lucide-react";

import Link from "@/components/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { bookingSchema, type BookingFormData } from "../helpers/schemas/booking-schema";
import { submitBookingRequest, type BookingSource } from "../actions/booking-actions";

interface BookingFormProps {
  clientId: string;
  articleId?: string | null;
  source: BookingSource;
  clientName?: string;
  /** Session user — booking requires login. null/no-email = logged out. */
  user: { name: string | null; email: string | null } | null;
  /** Default button label override from the client config. */
  submitLabel?: string;
}

type DayKey = "today" | "tomorrow" | "dayafter" | "other";
type PeriodKey = "morning" | "noon" | "evening";

// Representative hour per period — keeps "preferred contact time" rough but valid.
const PERIOD_HOUR: Record<PeriodKey, number> = { morning: 10, noon: 14, evening: 18 };
const PERIOD_LABEL: Record<PeriodKey, string> = {
  morning: "صباحًا · ٩–١٢",
  noon: "ظهرًا · ١٢–٤",
  evening: "مساءً · ٤–٨",
};

const dayLongFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { weekday: "long", day: "numeric", month: "long" });
const dayShortFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { weekday: "long" });

function addDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Local "YYYY-MM-DDTHH:mm" (no timezone shift) for preferredAt.
function toLocalInput(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

function toDateStr(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

// Light client-side validity for the green tick (server/zod is the source of truth).
function isPhoneValid(raw: string): boolean {
  const v = raw.replace(/[\s-]/g, "");
  return /^(\+?9665\d{8}|\+?201\d{9}|05\d{8}|01\d{9})$/.test(v);
}

export function BookingForm({
  clientId,
  articleId,
  source,
  clientName,
  user,
  submitLabel = "أرسل الطلب",
}: BookingFormProps) {
  const pathname = usePathname();
  const isLoggedIn = Boolean(user?.email);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Date control state (drives the hidden preferredAt value).
  const [dayKey, setDayKey] = useState<DayKey | null>(null);
  const [period, setPeriod] = useState<PeriodKey | null>(null);
  const [customDate, setCustomDate] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { phone: "+966 ", preferredAt: "", message: "" },
  });

  const phoneVal = watch("phone") ?? "";
  const phoneOk = isPhoneValid(phoneVal);

  // Pre-computed day chips (label + base date).
  const dayOptions = useMemo(() => {
    const today = addDays(0);
    return [
      { key: "today" as DayKey, title: "اليوم", sub: dayLongFmt.format(today), date: today },
      { key: "tomorrow" as DayKey, title: "غدًا", sub: dayShortFmt.format(addDays(1)), date: addDays(1) },
      { key: "dayafter" as DayKey, title: "بعد غد", sub: dayShortFmt.format(addDays(2)), date: addDays(2) },
    ];
  }, []);

  const todayStr = useMemo(() => toDateStr(addDays(0)), []);
  const nowHour = useMemo(() => new Date().getHours(), []);

  // Recompute preferredAt whenever the day/period/custom changes.
  function recompute(nextDay: DayKey | null, nextPeriod: PeriodKey | null, nextCustom: string) {
    if (!nextDay && !nextPeriod) {
      setValue("preferredAt", "");
      return;
    }
    let base: Date;
    if (nextDay === "tomorrow") base = addDays(1);
    else if (nextDay === "dayafter") base = addDays(2);
    else if (nextDay === "other" && nextCustom) base = new Date(`${nextCustom}T00:00`);
    else base = addDays(0); // today / default
    const hour = nextPeriod ? PERIOD_HOUR[nextPeriod] : 14;
    base.setHours(hour, 0, 0, 0);
    setValue("preferredAt", toLocalInput(base), { shouldValidate: true });
  }

  function pickDay(key: DayKey) {
    const next = dayKey === key ? null : key;
    setDayKey(next);
    if (next !== "other") setCustomDate("");
    recompute(next, period, next === "other" ? customDate : "");
  }

  function pickPeriod(key: PeriodKey) {
    const next = period === key ? null : key;
    setPeriod(next);
    recompute(dayKey, next, customDate);
  }

  function onCustomDate(value: string) {
    setCustomDate(value);
    setDayKey("other");
    recompute("other", period, value);
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitBookingRequest(data, { clientId, articleId: articleId ?? null, source });
    setIsSubmitting(false);
    if (!result.success) {
      setSubmitError(result.error ?? "تعذّر إرسال الطلب");
      return;
    }
    setDone(true);
  };

  // Success state — replaces the form entirely.
  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="text-base font-bold">تم استلام طلبك ✨</p>
        <p className="text-sm text-muted-foreground">
          {clientName ? `${clientName} بيتواصل معك قريبًا على الرقم اللي أدخلته.` : "بيتواصل معك مزوّد الخدمة قريبًا."}
        </p>
      </div>
    );
  }

  const loginHref = `/users/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit(onSubmit)}
        dir="rtl"
        className={!isLoggedIn ? "pointer-events-none select-none blur-[2px] opacity-60" : ""}
        aria-hidden={!isLoggedIn}
      >
        <div className="space-y-5 pb-2">
          {submitError && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive" role="alert">
              {submitError}
            </p>
          )}

          {/* Phone — the only required field */}
          <div className="space-y-2">
            <Label htmlFor="booking-phone" className="flex items-center gap-1.5 text-sm font-semibold">
              <Phone className="h-4 w-4 text-primary/80" />
              رقم جوالك
            </Label>
            <div className="relative">
              <Input
                id="booking-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                {...register("phone")}
                placeholder="+966 5XX XXX XXX"
                className="h-12 pe-10 text-right text-base"
                dir="ltr"
                aria-invalid={Boolean(errors.phone)}
              />
              {phoneOk && (
                <Check className="pointer-events-none absolute inset-y-0 end-3 my-auto h-5 w-5 text-emerald-500" />
              )}
            </div>
            {errors.phone ? (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            ) : (
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                نحتاجه عشان الشركة تتواصل معك بطلبك — بدون رسائل تسويقية.
              </p>
            )}
          </div>

          {/* Preferred contact time — chips, no native datetime */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-primary/80" />
              وقت يناسبك للتواصل <span className="text-xs font-normal text-muted-foreground">— اختياري</span>
            </Label>

            <div className="flex flex-wrap gap-2">
              {dayOptions.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => pickDay(d.key)}
                  aria-pressed={dayKey === d.key}
                  className={`flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-xl border px-3.5 py-1.5 text-center transition-colors ${
                    dayKey === d.key
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-[13px] font-bold">{d.title}</span>
                  <span className="text-[10px] opacity-70">{d.sub}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => pickDay("other")}
                aria-pressed={dayKey === "other"}
                className={`flex min-h-[46px] items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-medium transition-colors ${
                  dayKey === "other"
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                تاريخ آخر
              </button>
            </div>

            {dayKey === "other" && (
              <Input
                type="date"
                min={todayStr}
                value={customDate}
                onChange={(e) => onCustomDate(e.target.value)}
                className="h-11 text-right"
                dir="ltr"
              />
            )}

            <div className="pt-1">
              <p className="mb-1.5 text-[11px] text-muted-foreground">الفترة التقريبية</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PERIOD_HOUR) as PeriodKey[]).map((p) => {
                  const disabled = dayKey === "today" && PERIOD_HOUR[p] <= nowHour;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={disabled}
                      onClick={() => pickPeriod(p)}
                      aria-pressed={period === p}
                      className={`min-h-[42px] rounded-xl border px-3.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        period === p
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                      }`}
                    >
                      {PERIOD_LABEL[p]}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.preferredAt && <p className="text-sm text-destructive">{errors.preferredAt.message}</p>}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="booking-message" className="flex items-center gap-1.5 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-primary/80" />
              تحب تضيف تفاصيل؟ <span className="text-xs font-normal text-muted-foreground">— اختياري</span>
            </Label>
            <Textarea
              id="booking-message"
              {...register("message")}
              placeholder="مثال: أبغى استشارة عن تحسين متجري على جوجل…"
              rows={3}
              className="resize-none text-right"
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              بياناتك (اسمك وجوالك) تُرسل لـ{clientName ? `«${clientName}»` : "الشركة"} فقط، لهذا الطلب — لا تُنشر ولا تُستخدم للإعلانات.
            </span>
          </div>
        </div>

        {/* Submit — normal flow footer (wrapper handles scroll; avoids sticky overlap) */}
        <div className="mt-1 border-t border-border pt-4">
          <Button type="submit" disabled={isSubmitting} className="h-12 w-full text-base font-bold">
            {isSubmitting ? "جاري الإرسال..." : submitLabel}
          </Button>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">عادةً يردّون خلال ساعات العمل</p>
        </div>
      </form>

      {/* Logged-out overlay — form is blurred behind this */}
      {!isLoggedIn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/40 p-4 text-center backdrop-blur-[1px]">
          <Lock className="h-7 w-7 text-primary" />
          <p className="text-sm font-semibold">سجّل الدخول للحجز</p>
          <p className="text-xs text-muted-foreground">لازم تكون مسجّل في مدوّنتي عشان ترسل طلب حجز.</p>
          <Button asChild className="w-full max-w-[220px]">
            <Link href={loginHref}>تسجيل الدخول</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
