"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { platformCapabilities, engagementStats } from "../../data/platform-capabilities";

export function Tier0Platform() {
  return (
    <section
      id="t0"
      className="scroll-mt-6 mb-8"
    >
      {/* Powerful header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white rounded-2xl p-8 md:p-10 mb-6 shadow-xl">
        <motion.div
          className="absolute top-0 end-0 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 start-0 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3 h-3" />
            مودونتي ليست مدونة عادية
          </span>
          <h2 className="text-3xl md:text-4xl font-black leading-tight mb-3">
            منصة كاملة <span className="text-amber-300">تشتغل بدالك</span>
          </h2>
          <p className="text-base md:text-lg opacity-90 max-w-3xl leading-relaxed">
            تصميم كرياتيف · Copywriting احترافي · Local & Geo SEO · ٢٠+ schema · ٢٥ نوع تفاعل مرصود ·
            بوابة جودة قبل النشر · مساعد ذكي · Lead Scoring تلقائي. كل شي مغطّى. دورك فقط أن توافق.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Stat number={engagementStats.totalEvents.toString()} label="نوع تفاعل مرصود" />
            <Stat number={`${engagementStats.schemaTypes}+`} label="Schema لجوجل" />
            <Stat number={engagementStats.conversionTypes.toString()} label="أنواع تحويل" />
            <Stat number="100%" label="بيانات حقيقية" />
          </div>
        </div>
      </div>

      {/* Capabilities grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {platformCapabilities.map((cap, i) => (
          <motion.article
            key={cap.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className="group relative bg-card border border-border rounded-2xl p-5 pt-7 hover:border-primary/30 hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Eye-catching number badge — top-end corner */}
            <div className="absolute top-0 end-0 w-14 h-14 overflow-hidden pointer-events-none">
              <div className="absolute -top-1 -end-1 w-14 h-14 bg-gradient-to-bl from-blue-600 via-blue-500 to-violet-500 rotate-[15deg] origin-bottom-left rounded-bl-2xl shadow-md flex items-center justify-center">
                <span className="text-white font-black text-base -rotate-[15deg] drop-shadow-sm">
                  {i + 1}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-2">
              {cap.image ? (
                <div className="relative w-14 h-14 shrink-0 rounded-full bg-muted/40 overflow-hidden ring-2 ring-primary/10">
                  <Image
                    src={cap.image}
                    alt={cap.title}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
              ) : cap.icon ? (
                <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 ring-1 ring-primary/15 flex items-center justify-center">
                  <cap.icon className="w-7 h-7 text-primary" strokeWidth={1.75} />
                </div>
              ) : (
                <div className="text-4xl shrink-0 w-14 h-14 flex items-center justify-center">
                  {cap.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-extrabold text-foreground text-base mb-1 leading-snug">
                  {cap.title}
                </h3>
                {cap.highlight && (
                  <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {cap.highlight}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {cap.body}
            </p>
            {cap.brandLogos && cap.brandLogos.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-border">
                {cap.brandLogos.map((logo) => (
                  <Image
                    key={logo.name}
                    src={logo.url}
                    alt={logo.name}
                    title={logo.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>

      <div className="mt-5 bg-primary/5 border border-primary/15 rounded-xl p-4 text-center">
        <p className="text-sm text-foreground/90 leading-relaxed">
          <span className="font-extrabold text-primary">باختصار: </span>
          أنت ما تحتاج توظّف كاتب محتوى، ومصمم، وأخصائي SEO، ومحلل بيانات. مودونتي تعمل كل هذا — وأكثر.
        </p>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
      <div className="text-2xl md:text-3xl font-black text-amber-300 leading-tight">{number}</div>
      <div className="text-xs opacity-85 mt-1">{label}</div>
    </div>
  );
}
