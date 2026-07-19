"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, MessageSquare, User, Plus, Minus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";

import { PhoneField } from "./phone-field";
import { bookingSchema, type BookingFormData } from "../helpers/schemas/booking-schema";
import {
  submitBookingRequest,
  trackBookingBlocked,
  trackBookingFormStartAction,
  type BookingSource,
} from "../actions/booking-actions";

interface BookingFormProps {
  clientId: string;
  articleId?: string | null;
  source: BookingSource;
  clientName?: string;
  /** Session user (optional) — prefills name + attaches the lead to the account. */
  user: { name: string | null; email: string | null } | null;
  /** Submit button label (defaults to «اطلب اتصال»). */
  submitLabel?: string;
  /** ISO-2 country from Vercel geo — the phone field's default dial code. */
  defaultCountry?: string | null;
}

export function BookingForm({
  clientId,
  articleId,
  source,
  clientName,
  user,
  submitLabel = "اطلب اتصال",
  defaultCountry,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [started, setStarted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched", // errors show on blur, not only after pressing the button
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "", phone: "", preferredAt: null, message: "" },
  });

  const funnelCtx = { clientId, articleId: articleId ?? null, source };

  // First interaction → booking_form_start (closes the funnel blind spot).
  function firstTouch() {
    if (started) return;
    setStarted(true);
    void trackBookingFormStartAction(funnelCtx);
  }

  /** Zod rejected client-side — the server never hears it, so we record the block. */
  const onInvalid = () => {
    void trackBookingBlocked(funnelCtx, "invalid_input");
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitBookingRequest(data, {
      clientId,
      articleId: articleId ?? null,
      source,
      // Implied consent (sign-in wrap): pressing the button = agreement. Recorded server-side.
      disclaimerAccepted: true,
    });
    setIsSubmitting(false);
    if (!result.success) {
      setSubmitError(result.error ?? "تعذّر إرسال الطلب");
      return;
    }
    setDone(true);
  };

  // Success — replaces the form. The provider confirms the appointment from the console.
  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <p className="text-base font-bold">تم استلام طلبك ✨</p>
        <p className="text-sm text-muted-foreground">
          {clientName ? `${clientName} بيتواصل معك على رقمك قريباً ويحدّد الموعد المناسب.` : "بيتواصل معك مزوّد الخدمة قريباً."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} dir="rtl" className="space-y-4">
      {submitError && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive" role="alert">
          {submitError}
        </p>
      )}

      {/* Phone — the only required field */}
      <div className="space-y-2">
        <Label htmlFor="booking-phone" className="text-sm font-semibold">
          اترك رقمك ونعاود الاتصال بك
        </Label>
        <PhoneField
          id="booking-phone"
          defaultCountry={defaultCountry}
          onFirstTouch={firstTouch}
          onChange={({ e164, valid }) => {
            setValue("phone", e164, { shouldValidate: started });
            setPhoneValid(valid);
          }}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        <p className="text-[11px] text-muted-foreground">رقمك للحجز فقط — بلا رسائل تسويقية.</p>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting || !phoneValid} className="h-12 w-full text-base font-bold">
        {isSubmitting ? "جاري الإرسال..." : submitLabel}
      </Button>

      {/* Progressive disclosure — everything else is optional */}
      <button
        type="button"
        onClick={() => {
          firstTouch();
          setShowDetails((v) => !v);
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] py-2.5 text-sm font-semibold text-primary"
      >
        {showDetails ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {showDetails ? "إخفاء التفاصيل" : "أضف تفاصيل (اختياري)"}
      </button>

      {showDetails && (
        <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="space-y-2">
            <Label htmlFor="booking-name" className="flex items-center gap-1.5 text-sm font-semibold">
              <User className="h-4 w-4 text-primary/80" />
              اسمك <span className="text-xs font-normal text-muted-foreground">— اختياري</span>
            </Label>
            <Input id="booking-name" {...register("name")} placeholder="مثال: أحمد محمد" autoComplete="name" className="h-11 text-right" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-email" className="flex items-center gap-1.5 text-sm font-semibold">
              <Mail className="h-4 w-4 text-primary/80" />
              بريدك <span className="text-xs font-normal text-muted-foreground">— اختياري</span>
            </Label>
            <Input id="booking-email" type="email" inputMode="email" autoComplete="email" {...register("email")} placeholder="example@email.com" className="h-11" dir="ltr" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-message" className="flex items-center gap-1.5 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-primary/80" />
              تفاصيل أو وقت تفضّله؟ <span className="text-xs font-normal text-muted-foreground">— اختياري، والمزوّد يؤكّده</span>
            </Label>
            <Textarea id="booking-message" {...register("message")} placeholder="مثال: بعد العصر، نهاية الأسبوع…" rows={3} className="resize-none text-right" />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>
        </div>
      )}

      {/* sign-in wrap consent — conspicuous, non-blocking; the click = agreement */}
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <span aria-hidden>ℹ️</span>
        <span>
          بمتابعتك، أنت توافق على{" "}
          <Link href="/terms" className="font-semibold text-primary underline">الشروط</Link> و
          <Link href="/legal/privacy-policy" className="font-semibold text-primary underline">الخصوصية</Link> —
          مدوّنتي منصّة تعريفية، لسنا مقدّم الخدمة.
        </span>
      </p>
    </form>
  );
}
