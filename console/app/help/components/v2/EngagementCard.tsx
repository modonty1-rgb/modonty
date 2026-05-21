"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import type { EngagementCard as EngagementCardData } from "../../data/guide-v2";

interface Props {
  card: EngagementCardData;
  index: number;
  onImageClick: (src: string, alt: string) => void;
}

export function EngagementCard({ card, index, onImageClick }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <header className="flex items-center gap-3 mb-5">
        <div className="text-3xl">{card.emoji}</div>
        <h3 className="text-lg md:text-xl font-extrabold text-foreground flex-1">
          {card.title}
        </h3>
      </header>

      {/* Before / After visual flow */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-start">
        {/* BEFORE — on modonty.com */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded">
              في موقعك
            </span>
          </div>
          <button
            type="button"
            onClick={() => onImageClick(card.before.image, card.title + " — في موقعك")}
            className="group relative rounded-lg overflow-hidden border border-border bg-muted/30 cursor-zoom-in"
          >
            <Image
              src={card.before.image}
              alt={card.title}
              width={800}
              height={500}
              className="w-full h-auto block max-h-64 object-cover object-top"
            />
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {card.before.caption}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center justify-center pt-12">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="md:hidden flex items-center justify-center py-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center rotate-90">
            <ArrowLeft className="w-4 h-4 text-primary" />
          </div>
        </div>

        {/* AFTER — in console */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
              يجيك في الكونسول
            </span>
          </div>
          <button
            type="button"
            onClick={() => onImageClick(card.after.image, card.title + " — في الكونسول")}
            className="group relative rounded-lg overflow-hidden border border-border bg-muted/30 cursor-zoom-in"
          >
            <Image
              src={card.after.image}
              alt={card.title + " in console"}
              width={800}
              height={500}
              className="w-full h-auto block max-h-64 object-cover object-top"
            />
          </button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {card.after.caption}
          </p>
        </div>
      </div>

      {/* Insight bar */}
      <div className="mt-4 flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3">
        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed text-foreground/90">{card.insight}</p>
      </div>
    </motion.article>
  );
}
