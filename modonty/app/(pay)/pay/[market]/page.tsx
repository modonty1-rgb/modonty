import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, ChevronLeft, CreditCard, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";

import { LogoNav } from "@/app/layout/components/nav/LogoNav";

const included = ["خطة محتوى شهرية من فريق متخصص", "مراجعة واعتماد قبل النشر", "صفحة نشاطك على منصة مدونتي", "تقارير أداء واضحة من جوجل"];

const MARKETS = {
  sa: { eyebrow: "أهلًا بك في مدونتي السعودية", currency: "ر.س", total: "٢٬٣٩٤ ر.س", effective: "٣٤٢ ر.س شهريًا فعليًا", phone: "05xxxxxxxx", payment: "بطاقة مدى / فيزا / ماستركارد وتمارا" },
  eg: { eyebrow: "أهلًا بيك في مدونتي مصر", currency: "ج.م", total: "١٢٬٩٩٤ ج.م", effective: "١٬٨٥٦ ج.م شهريًا فعليًا", phone: "01xxxxxxxxx", payment: "فيزا / ماستركارد ووسائل الدفع المتاحة في مصر" },
} as const;

type Market = keyof typeof MARKETS;

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }): Promise<Metadata> {
  const { market } = await params;
  const config = MARKETS[market as Market];
  return { title: config ? `ابدأ اشتراكك — ${config.currency}` : "ابدأ اشتراكك", description: "اختر باقة مدونتي وأكمل طلبك بأمان.", robots: { index: false, follow: false } };
}

/** Presentation only: pricing is intentionally mock data until the commerce catalog is built. */
export default async function MarketPayPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const config = MARKETS[market as Market];
  if (!config) notFound();

  return <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-foreground">
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-border dark:bg-card/90"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6"><LogoNav /><div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-muted-foreground"><LockKeyhole className="size-4 text-primary" aria-hidden />طلب آمن ومحمي</div></div></header>
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:py-12">
      <section aria-labelledby="checkout-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-border dark:bg-card">
        <p className="mb-2 text-sm font-semibold text-primary">{config.eyebrow}</p><h1 id="checkout-title" className="text-2xl font-bold tracking-tight sm:text-3xl">اختر باقتك ثم أكمل طلبك</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">كل ما تحتاجه لبناء حضور نشاطك على جوجل، من المحتوى إلى النشر والمتابعة.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="مدة الاشتراك">{["٣ أشهر", "٦ أشهر", "١٢ شهرًا"].map((duration) => <button key={duration} type="button" className={`min-h-12 rounded-xl border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${duration === "٦ أشهر" ? "border-primary bg-primary text-primary-foreground" : "border-slate-200 hover:border-primary/50 dark:border-border"}`}>{duration}{duration === "٦ أشهر" && <span className="me-1 text-[10px] font-medium opacity-90">+ شهر مجانًا</span>}</button>)}</div>
        <fieldset className="mt-7 space-y-3"><legend className="text-sm font-bold">بيانات التواصل</legend><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-medium">الاسم الكامل<input className="h-11 rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border" placeholder="اكتب اسمك" /></label><label className="grid gap-1.5 text-sm font-medium">رقم الجوال<input className="h-11 rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border" inputMode="tel" placeholder={config.phone} /></label></div><label className="grid gap-1.5 text-sm font-medium">البريد الإلكتروني<input className="h-11 rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border" type="email" placeholder="name@company.com" /></label><label className="grid gap-1.5 text-sm font-medium">اسم النشاط<input className="h-11 rounded-lg border border-slate-300 bg-transparent px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border" placeholder="اسم شركتك أو نشاطك" /></label></fieldset>
        <div className="mt-7 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"><div className="flex items-start gap-3"><CreditCard className="mt-0.5 size-5 text-primary" aria-hidden /><div><p className="text-sm font-bold">وسائل الدفع ستظهر هنا</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-muted-foreground">{config.payment}. لن يتم تحصيل أي مبلغ في النسخة التجريبية.</p></div></div></div>
      </section>
      <aside aria-label="ملخص الطلب" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5 dark:border-border dark:bg-card"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-primary">باقة الانطلاقة</p><h2 className="mt-1 text-lg font-bold">ابدأ الظهور بثبات</h2></div><BadgeCheck className="size-6 text-primary" aria-hidden /></div><div className="my-5 border-y border-slate-100 py-4 dark:border-border"><div className="flex items-end justify-between"><span className="text-sm text-muted-foreground">٦ أشهر + شهر مجانًا</span><strong className="text-xl">{config.total}</strong></div><p className="mt-1 text-xs text-muted-foreground">{config.effective}</p></div><ul className="space-y-3">{included.map((item) => <li key={item} className="flex gap-2 text-sm leading-5"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{item}</li>)}</ul><button type="button" disabled className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground opacity-70"><LockKeyhole className="size-4" aria-hidden />الدفع قريبًا</button><p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">بالإكمال لاحقًا ستوافق على شروط الخدمة وسياسة الاسترداد.</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-border"><Link href="/" className="inline-flex items-center gap-1 font-medium hover:text-primary"><ChevronLeft className="size-3.5" />العودة لمدونتي</Link><a href="https://wa.me/" className="inline-flex items-center gap-1 font-medium hover:text-primary"><MessageCircle className="size-3.5" />تحتاج مساعدة؟</a></div></aside>
    </div>
    <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-border"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden />استرداد خلال ١٤ يومًا إذا لم يتم تفعيل حسابك.</span></footer>
  </main>;
}
