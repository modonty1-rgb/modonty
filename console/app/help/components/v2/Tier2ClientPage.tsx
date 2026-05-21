"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ExternalLink, Settings2 } from "lucide-react";
import { tier2ClientPageBlocks } from "../../data/guide-v2";

interface Tier2ClientPageProps {
  onImageClick: (src: string, alt: string) => void;
}

export function Tier2ClientPage({ onImageClick }: Tier2ClientPageProps) {
  return (
    <section
      id="t2"
      className="scroll-mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm"
    >
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-4 bg-primary text-primary-foreground rounded-full text-sm font-bold">
            ٢
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            صفحتك على مودونتي
          </h2>
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-current" />
            الأهم
          </span>
        </div>
        <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
          كل عميل عندنا له صفحة رسمية على <span className="font-mono text-foreground">modonty.com/clients/[اسم شركتك]</span> —
          هذي «البيت الرسمي» اللي يلاقي فيه زوارك كل شي عن شركتك. خلينا نوريك إيش فيها.
        </p>
      </header>

      {/* Full preview screenshot — shows the FULL client page (top → bottom) */}
      <motion.button
        type="button"
        onClick={() =>
          onImageClick("/help/engagement/07-client-page-full.png?v=2", "صفحتك على مودونتي — الصفحة كاملة")
        }
        whileHover={{ scale: 1.005 }}
        className="group relative block w-full mb-8 rounded-xl overflow-hidden border border-border bg-muted/30 cursor-zoom-in shadow-lg"
      >
        <Image
          src="/help/engagement/07-client-page-full.png?v=2"
          alt="صفحة العميل على مودونتي — كاملة"
          width={1366}
          height={2401}
          unoptimized
          className="w-full h-auto block"
        />
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-foreground shadow-md">
          <ExternalLink className="w-3.5 h-3.5" />
          اضغط للتكبير الكامل
        </div>
      </motion.button>

      {/* 7 blocks grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {tier2ClientPageBlocks.map((block, i) => (
          <motion.article
            key={block.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="bg-gradient-to-br from-background to-muted/20 border border-border rounded-xl p-4 flex flex-col gap-2"
          >
            <h3 className="font-extrabold text-foreground text-base flex items-center gap-2">
              <span className="inline-flex w-6 h-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {block.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              {block.body}
            </p>
            <div className="flex items-start gap-1.5 text-[11px] text-primary/90 bg-primary/8 rounded-md px-2 py-1.5 mt-1">
              <Settings2 className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{block.managedFrom}</span>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4">
        <p className="text-sm leading-relaxed text-foreground/85">
          <b className="text-emerald-700 dark:text-emerald-400">المفتاح: </b>
          كل اللي يظهر في صفحتك يأتي من بيانات تدخلها أنت في الـ console. كل ما عبّيت بياناتك أكثر، كل ما ظهرت شركتك أحسن قدّام عملاء جدد.
        </p>
      </div>
    </section>
  );
}
