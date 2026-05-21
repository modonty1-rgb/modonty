"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, MousePointerClick, ArrowLeft, Clock, Sparkles } from "lucide-react";

export function HelpLanding() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3 h-3" />
            مركز المساعدة — مودونتي
          </span>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3 text-foreground">
            أهلاً بك، اختار طريقتك
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            عندك خيارين للتعلّم — قراءة سريعة عن المنصة، أو جولة تفاعلية حقيقية داخل الكونسول.
            اختار اللي يناسبك.
          </p>
        </motion.section>

        {/* 2 cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* General Guide Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Link
              href="/help/general"
              className="group relative block h-full bg-card border border-border rounded-2xl p-7 md:p-8 hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute -top-12 -end-12 w-40 h-40 bg-gradient-to-bl from-blue-500/10 to-violet-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 ring-1 ring-primary/20 flex items-center justify-center mb-5">
                  <BookOpen className="w-7 h-7 text-primary" strokeWidth={1.75} />
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-2">
                  اعرف منصة مودونتي
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  دليل شامل عن إيش modonty يقدّم لك — ٢١ قدرة، ٢٥ نوع تفاعل، صفحتك الرسمية،
                  والـ workflows الكاملة.
                </p>

                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-muted text-foreground/85 text-xs font-medium px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    ١٠ دقايق قراءة
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    Visual + Screenshots
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-3 transition-all">
                  ابدأ القراءة
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Console Tour Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/help/console"
              className="group relative block h-full bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-7 md:p-8 hover:shadow-2xl transition-all overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute -bottom-16 -start-16 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center mb-5">
                  <MousePointerClick className="w-7 h-7" strokeWidth={1.75} />
                </div>

                <span className="inline-block bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  جديد
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold mb-2">
                  جولة تفاعلية في الكونسول
                </h2>
                <p className="text-sm opacity-95 leading-relaxed mb-5">
                  جولة حقيقية تأخذك عبر كل صفحات الكونسول — تشوف الأزرار الفعلية، نشرحها لك واحدة
                  وحدة. أسرع طريقة تتعلّم منها.
                </p>

                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-xs font-medium px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    ٥ دقايق
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    تجربة عملية
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 font-bold text-sm group-hover:gap-3 transition-all">
                  ابدأ الجولة
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-10"
        >
          محتاج مساعدة شخصية؟ كلّمنا على Telegram أو من قسم رسائل الدعم في الكونسول.
        </motion.p>
      </div>
    </div>
  );
}
