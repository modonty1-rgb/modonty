"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ZoomIn } from "lucide-react";
import { tier4ConsoleGroups } from "../../data/guide-v2";

interface Props {
  onImageClick: (src: string, alt: string) => void;
}

export function Tier4ConsolePages({ onImageClick }: Props) {
  return (
    <section
      id="t4"
      className="scroll-mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm"
    >
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-4 bg-primary text-primary-foreground rounded-full text-sm font-bold">
            ٤
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            صفحات الكونسول
          </h2>
        </div>
        <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
          كل صفحة في الكونسول مع شرح سريع. اضغط على أي صورة لتكبيرها وتشوف التفاصيل.
        </p>
      </header>

      <div className="space-y-8">
        {tier4ConsoleGroups.map((group, gi) => (
          <div key={group.title}>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-foreground mb-3">
              <span className="text-2xl">{group.emoji}</span>
              {group.title}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.pages.map((page, i) => (
                <motion.button
                  key={page.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: (gi * 3 + i) * 0.04, duration: 0.3 }}
                  onClick={() => onImageClick(page.image, page.title)}
                  className="group bg-gradient-to-br from-background to-muted/20 border border-border rounded-xl overflow-hidden text-start hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video bg-muted/30 overflow-hidden">
                    <Image
                      src={page.image}
                      alt={page.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-extrabold text-foreground text-sm mb-1">
                      {page.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {page.body}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
