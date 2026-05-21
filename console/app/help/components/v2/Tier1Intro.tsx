"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { tier1IntroSteps } from "../../data/guide-v2";

export function Tier1Intro() {
  return (
    <section
      id="t1"
      className="scroll-mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm"
    >
      <header className="text-center mb-8">
        <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-4 bg-primary text-primary-foreground rounded-full text-sm font-bold mb-3">
          ١
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight mb-2">
          إيش هو مودونتي؟
        </h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          ٣ خطوات بس، وموقعك يبدأ يجيب لك عملاء من جوجل بدون ما تكتب حرف.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 md:gap-3 relative">
        {tier1IntroSteps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-background to-muted/30 border border-border rounded-xl p-6 h-full flex flex-col items-center text-center">
              <div className="absolute -top-3 -end-3 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
              <div className="text-5xl mb-3">{step.emoji}</div>
              <h3 className="font-extrabold text-foreground text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.body}
              </p>
            </div>
            {i < tier1IntroSteps.length - 1 && (
              <div className="hidden md:flex absolute -end-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border items-center justify-center shadow-sm">
                <ArrowLeft className="w-4 h-4 text-primary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-primary/5 border border-primary/15 rounded-xl p-4 text-center">
        <p className="text-sm text-foreground/85 leading-relaxed">
          <span className="font-semibold text-primary">الـ console</span> ده مكان واحد، تتابع منه كل شي:
          مقالاتك، زوارك، نتائج موقعك، ومين قريب يصير عميلك.
        </p>
      </div>
    </section>
  );
}
