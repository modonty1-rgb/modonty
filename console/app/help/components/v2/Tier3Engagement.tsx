"use client";

import { Star } from "lucide-react";
import { tier3EngagementCards } from "../../data/guide-v2";
import { EngagementCard } from "./EngagementCard";

interface Props {
  onImageClick: (src: string, alt: string) => void;
}

export function Tier3Engagement({ onImageClick }: Props) {
  return (
    <section id="t3" className="scroll-mt-6 mb-8">
      <header className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 mb-2 flex-wrap justify-center">
          <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-4 bg-primary text-primary-foreground rounded-full text-sm font-bold">
            ٣
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            كيف يتفاعل زوارك معك
          </h2>
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3 fill-current" />
            القلب
          </span>
        </div>
        <p className="text-muted-foreground text-base max-w-3xl mx-auto leading-relaxed">
          كل تفاعل من زائر على موقعك = ينعكس عندك في الكونسول. لا تحتاج تتابع شي يدوياً، النظام يجيب لك كل شي تلقائياً.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-4">
        {tier3EngagementCards.map((card, i) => (
          <EngagementCard
            key={card.id}
            card={card}
            index={i}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </section>
  );
}
