"use client";

import { motion } from "framer-motion";
import { allEngagementEvents } from "../../data/platform-capabilities";

export function AllEngagementSummary() {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 md:p-7 mt-6 mb-8 shadow-sm">
      <header className="mb-5">
        <h3 className="text-xl md:text-2xl font-extrabold text-foreground mb-1">
          + ١٨ نوع تفاعل آخر يُحتسب تلقائياً
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          الـ ٧ بطاقات اللي شفتها فوق هي الأكثر شيوعاً. لكن مودونتي تتعقّب فعلياً ٢٥ نوع تفاعل، كلها تظهر في
          تقارير الإحصائيات. هنا الباقي بشكل سريع:
        </p>
      </header>

      <div className="space-y-5">
        {allEngagementEvents.map((group, gi) => (
          <motion.div
            key={group.groupTitle}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: gi * 0.06, duration: 0.3 }}
          >
            <h4 className="flex items-center gap-2 text-base font-extrabold text-foreground mb-2">
              <span className="text-xl">{group.emoji}</span>
              {group.groupTitle}
              <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {group.events.length}
              </span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {group.events.map((event) => (
                <div
                  key={event.name}
                  className="bg-muted/30 border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="text-sm font-bold text-foreground mb-0.5">
                    {event.name}
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-4">
        <p className="text-sm leading-relaxed text-foreground/90">
          <b className="text-amber-700 dark:text-amber-400">ملاحظة مهمة: </b>
          كل تفاعل يدخل في حساب الـ Lead Score للزائر. كل ما تجمّع تفاعلات، تقدر تعرف مين من زوارك
          قريب يصير عميل فعلي.
        </p>
      </div>
    </section>
  );
}
