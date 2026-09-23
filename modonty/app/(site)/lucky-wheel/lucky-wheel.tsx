"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import confetti from "canvas-confetti";
import { IconCheckCircle, IconGift, IconRefresh } from "@/lib/icons";
import type { Wheel } from "spin-wheel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { LUCKY_WHEEL_PRIZES, MODONTY_GIFT_INDEX, SPINS_PER_PHONE } from "./prizes";

const SPIN_BUTTON =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#00d8d8] px-6 text-lg font-black text-[#0e065a] shadow-[0_12px_28px_rgba(0,216,216,0.25)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200";

type SpinResponse = { success?: boolean; error?: string; data?: { index?: number; alreadyPlayed?: boolean; spinsLeft?: number } };

function celebrateModontyGift() {
  const colors = ["#00d8d8", "#3030ff", "#ffcc66", "#ffffff"];

  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  window.setTimeout(() => {
    void confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    void confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }, 250);
}

export function LuckyWheelGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<Wheel | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [registrationState, setRegistrationState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  /** الجوّال: الاسمُ والجوالُ في نافذةٍ من الأسفل، كي تبقى العجلةُ والزرُّ في الشاشة. */
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  /** الاسمُ والجوالُ يبقيان بين اللفّات — ويُقرآن في النموذجين (الديسكتوب والنافذة) معاً. */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  /** `null` قبل أوّل لفّة؛ السيرفرُ يقول الباقي بعد كلّ لفّة (`SPINS_PER_PHONE`). */
  const [spinsLeft, setSpinsLeft] = useState<number | null>(null);

  function resetRegistrationFeedback() {
    if (registrationState === "submitting") return;
    setRegistrationState("idle");
    setRegistrationMessage("");
  }

  useEffect(() => {
    let isMounted = true;

    void import("spin-wheel").then(({ Wheel }) => {
      if (!isMounted || !containerRef.current) return;

      const wheel = new Wheel(containerRef.current, {
        items: LUCKY_WHEEL_PRIZES.map(({ label, backgroundColor, labelColor }) => ({ label, backgroundColor, labelColor })),
        borderColor: "#dffcff",
        borderWidth: 5,
        lineColor: "#dffcff",
        lineWidth: 1,
        isInteractive: false,
        itemLabelAlign: "center",
        itemLabelFont: "Tajawal, sans-serif",
        itemLabelFontSizeMax: 24,
        // Original placement was .82. Keep the labels near the rim, with only enough inset
        // for the longer «هدية مدونتي» text to clear the border.
        itemLabelRadius: 0.70,
        itemLabelRadiusMax: 0.22,
        // A shared canvas stroke made a dark halo around white text on the cyan slice. Keep
        // labels clean; contrast comes from each item's own labelColor instead.
        itemLabelStrokeColor: "transparent",
        itemLabelStrokeWidth: 0,
        onRest: ({ currentIndex }) => {
          setIsSpinning(false);
          setResult(currentIndex);
          if (LUCKY_WHEEL_PRIZES[currentIndex]?.code) {
            setRegistrationState("success");
            setSuccessDialogOpen(true);
          }
          if (currentIndex === MODONTY_GIFT_INDEX) celebrateModontyGift();
        },
      });

      wheelRef.current = wheel;
      setIsReady(true);
    });

    return () => {
      isMounted = false;
      wheelRef.current?.remove();
      wheelRef.current = null;
    };
  }, []);

  /**
   * The server picks the slice and stores it; the wheel only plays the answer back. So name and
   * phone come first — the phone is what limits a visitor to one spin — and a phone that already
   * played gets its stored outcome instead of a new roll.
   */
  async function spin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wheelRef.current || isSpinning || registrationState === "submitting") return;

    setResult(null);
    setRegistrationState("submitting");
    setRegistrationMessage("");
    setSuccessDialogOpen(false);

    try {
      const response = await fetch("/api/lucky-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const payload = (await response.json().catch(() => null)) as SpinResponse | null;
      const index = payload?.data?.index;

      if (!response.ok || !payload?.success || typeof index !== "number" || !LUCKY_WHEEL_PRIZES[index]) {
        throw new Error(payload?.error ?? "تعذر تسجيل اللفّة الآن. جرّب مرة أخرى.");
      }

      // النتيجةُ تُرى على العجلة لا تحت الكيبورد: تُغلق النافذةُ وتعود العجلةُ إلى العين.
      setFormSheetOpen(false);
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

      setSpinsLeft(payload.data?.spinsLeft ?? 0);
      if (payload.data?.alreadyPlayed) {
        setResult(index);
        setRegistrationState("error");
        setRegistrationMessage("انتهت لفّات هذا الرقم — النتيجة أعلاه هي آخر نتيجة له.");
        return;
      }

      setRegistrationState("idle");
      setIsSpinning(true);
      wheelRef.current.spinToItem(index, 4200, true, 5, 1);
    } catch (error) {
      setRegistrationState("error");
      setRegistrationMessage(error instanceof Error ? error.message : "تعذر تسجيل اللفّة الآن. جرّب مرة أخرى.");
    }
  }

  const won = result === null ? null : LUCKY_WHEEL_PRIZES[result];
  const code = won?.code ?? null;
  const wonModontyOffer = result === MODONTY_GIFT_INDEX;
  const outOfSpins = spinsLeft === 0;
  /** يُقفل أثناء الدوران، وحين تنفد لفّاتُ الرقم — لا بعد أوّل نتيجة. */
  const played = isSpinning || outOfSpins;
  const spinLabel = !isReady
    ? "جارٍ تجهيز العجلة…"
    : isSpinning
      ? "العجلة تدور…"
      : registrationState === "submitting"
        ? "جارٍ التسجيل…"
        : outOfSpins
          ? "انتهت لفّاتك"
          : spinsLeft != null
            ? `لفّة ثانية — باقي ${spinsLeft}`
            : "لف العجلة واربح";

  useEffect(() => {
    if (!successDialogOpen) return;

    const colors = ["#00d8d8", "#3030ff", "#ffcc66", "#ffffff"];
    const launchCelebration = () => {
      void confetti({ particleCount: 26, spread: 62, startVelocity: 30, gravity: 0.82, origin: { x: 0.06, y: 0.64 }, colors });
      void confetti({ particleCount: 26, spread: 62, startVelocity: 30, gravity: 0.82, origin: { x: 0.94, y: 0.64 }, colors });
    };

    launchCelebration();
    // The display may stay open for passers-by at the event, so the celebration gently renews
    // until the visitor closes it instead of disappearing after one burst.
    const interval = window.setInterval(launchCelebration, 850);

    return () => window.clearInterval(interval);
  }, [successDialogOpen]);

  /** نموذجٌ واحد يُرسم في مكانين: بجانب العجلة على الديسكتوب، وفي النافذة على الجوّال. */
  const renderForm = () => (
    <form onSubmit={spin} className="rounded-2xl border border-white/15 bg-white/5 p-4 text-right shadow-[0_10px_25px_rgba(0,0,0,0.14)]" noValidate>
      <div className="grid gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-cyan-100">الاسم</span>
          <input name="name" required minLength={2} autoComplete="name" placeholder="اكتب اسمك" disabled={played} value={name} onChange={(e) => { setName(e.target.value); resetRegistrationFeedback(); }} className="min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-white placeholder:text-white/45 focus:border-cyan-300 focus:outline-none disabled:opacity-60" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-cyan-100">رقم الجوال</span>
          <input name="phone" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" disabled={played} value={phone} onChange={(e) => { setPhone(e.target.value); resetRegistrationFeedback(); }} className="min-h-11 w-full rounded-xl border border-white/15 bg-black/20 px-3 text-left text-white placeholder:text-right placeholder:text-white/45 focus:border-cyan-300 focus:outline-none disabled:opacity-60" />
        </label>
      </div>
      <button
        type="submit"
        disabled={!isReady || played || registrationState === "submitting"}
        className={`mt-4 ${SPIN_BUTTON}`}
      >
        <IconRefresh className={isSpinning || registrationState === "submitting" ? "size-5 animate-spin" : "size-5"} aria-hidden />
        {spinLabel}
      </button>
      {registrationMessage && (
        <p role={registrationState === "error" ? "alert" : "status"} className={`mt-3 text-sm ${registrationState === "error" ? "text-rose-200" : "text-cyan-100"}`}>
          {registrationMessage}
        </p>
      )}
    </form>
  );

  return (
    <section className="relative isolate min-h-[calc(100dvh-3.5rem)] overflow-hidden bg-[#0e1023] px-4 py-4 text-white sm:px-6 lg:py-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(48,48,255,0.36),transparent_32rem),radial-gradient(circle_at_12%_84%,rgba(0,216,216,0.18),transparent_28rem)]" />
      <header className="mx-auto mb-4 max-w-5xl text-center lg:mb-6">
        <h1 className="text-2xl font-black leading-tight sm:text-3xl">لفّ واربح مع مدونتي</h1>
        <p className="mt-1 text-sm text-cyan-100/80">حتى {SPINS_PER_PHONE} لفّات لكل رقم جوال</p>
      </header>
      <div className="mx-auto grid w-full max-w-5xl items-center gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        <div className="order-2 mx-auto w-full max-w-sm lg:order-1 lg:mx-0">
          {/* الديسكتوب: النموذجُ بجانب العجلة، فالمساحةُ تتّسع للاثنين. */}
          <div className="hidden lg:block">{renderForm()}</div>

          {/* الجوّال: الزرُّ تحت العجلة مباشرةً، والنموذجُ في نافذةٍ من الأسفل (خالد ٢٣ سبتمبر
              ٢٠٢٦). كان النموذجُ تحت العجلة، فيدفعها الكيبوردُ خارج الشاشة وتلفّ بلا مشاهد. */}
          <button
            type="button"
            onClick={() => setFormSheetOpen(true)}
            disabled={!isReady || played || registrationState === "submitting"}
            className={`${SPIN_BUTTON} lg:hidden`}
          >
            <IconRefresh className={isSpinning ? "size-5 animate-spin" : "size-5"} aria-hidden />
            {spinLabel}
          </button>

          {registrationMessage && !formSheetOpen && (
            <p role={registrationState === "error" ? "alert" : "status"} className={`mt-3 text-center text-sm lg:hidden ${registrationState === "error" ? "text-rose-200" : "text-cyan-100"}`}>
              {registrationMessage}
            </p>
          )}

          <Sheet open={formSheetOpen} onOpenChange={setFormSheetOpen}>
            <SheetContent side="bottom" dir="rtl" className="rounded-t-2xl border-white/15 bg-[#101a3b] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-white lg:hidden">
              <SheetTitle className="text-lg font-black text-white">سجّل ولفّ العجلة</SheetTitle>
              <SheetDescription className="mb-3 text-sm text-cyan-50/80">حتى {SPINS_PER_PHONE} لفّات لكل رقم جوال — ونتواصل معك على الرقم لتسليم جائزتك.</SheetDescription>
              {renderForm()}
            </SheetContent>
          </Sheet>

          <div aria-live="polite" className="mt-3 text-center lg:text-right">
            {won && (
              <div className="rounded-2xl border border-cyan-200/35 bg-cyan-200/15 px-4 py-3 shadow-[0_10px_25px_rgba(0,216,216,0.12)]">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-cyan-100">{code ? "مبروك، ربحت" : "هذه المرة"}</p>
                    <p className="truncate text-xl font-black">{wonModontyOffer ? "خصم 35% + 30% محتوى إضافي" : won.label}</p>
                  </div>
                  {code && <p className="shrink-0 select-all rounded-lg bg-black/20 px-3 py-1.5 text-center font-mono text-sm tracking-wider text-cyan-100">{code}</p>}
                </div>
                {wonModontyOffer && <p className="mt-1 text-sm text-cyan-100">كل 10 مقالات تصبح 13 مقالًا.</p>}
              </div>
            )}
          </div>

          <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
            <DialogContent dir="rtl" className="overflow-hidden border border-cyan-300/35 bg-[#101a3b] p-0 text-white shadow-[0_24px_80px_rgba(0,216,216,0.22)] sm:max-w-md">
              <div className="relative px-6 pb-6 pt-8 text-center">
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(0,216,216,0.32),transparent_70%)]" />
                <DialogHeader className="relative items-center text-center">
                  <div className="mb-4 grid size-16 place-items-center rounded-2xl border border-cyan-100/30 bg-cyan-300/15 text-cyan-200 shadow-[0_0_32px_rgba(0,216,216,0.32)]">
                    <IconCheckCircle className="size-9" aria-hidden />
                  </div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white">أهلًا بك في منظومة مدونتي</DialogTitle>
                  <DialogDescription className="mx-auto mt-2 flex w-full flex-col items-center gap-1 text-center text-sm leading-6 text-cyan-50/85">
                    <span className="block w-full text-center">تم تسجيل جائزتك بنجاح.</span>
                    <span className="block w-full text-center">سيتواصل معك فريق مدونتي</span>
                    <span className="block w-full text-center">لتفاصيل الاستفادة من الجائزة.</span>
                  </DialogDescription>
                </DialogHeader>

                <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-100"><IconGift className="size-4" aria-hidden /> جائزتك</span>
                    <span className="font-black text-white">{wonModontyOffer ? "هدية مدونتي" : won?.label}</span>
                  </div>
                  {code && <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-center font-mono text-sm tracking-wider text-cyan-100">{code}</p>}
                </div>

                <button type="button" onClick={() => setSuccessDialogOpen(false)} className="relative mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#00d8d8] px-4 font-black text-[#0e065a] transition hover:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-100">
                  ممتاز، شكرًا
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="order-1 mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:order-2 lg:max-w-[420px]">
          <div className="relative aspect-square w-full rounded-full border-[10px] border-white/15 bg-[#111a37] p-2 shadow-[0_0_60px_rgba(0,216,216,0.22)]">
            <div ref={containerRef} className="size-full" aria-label="عجلة الحظ" />
            <span className="pointer-events-none absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 -translate-y-1 border-x-[15px] border-b-[26px] border-x-transparent border-b-white drop-shadow-lg" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
