"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { tier5AccountSettings } from "../../data/guide-v2";

interface Props {
  onImageClick: (src: string, alt: string) => void;
}

export function Tier5Account({ onImageClick }: Props) {
  return (
    <section
      id="t5"
      className="scroll-mt-6 bg-card border border-border rounded-2xl p-6 md:p-10 mb-8 shadow-sm"
    >
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-4 bg-primary text-primary-foreground rounded-full text-sm font-bold">
            ٥
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            حسابك
          </h2>
        </div>
        <p className="text-muted-foreground text-base max-w-3xl leading-relaxed">
          كل اللي يخص حسابك في صفحة الإعدادات. صفحة واحدة بسيطة، تدخلها مرة وحدة وتظبط فيها كل شي.
        </p>
      </header>

      <button
        type="button"
        onClick={() => onImageClick("/help/12-settings.png", "صفحة الإعدادات")}
        className="group relative block w-full mb-6 rounded-xl overflow-hidden border border-border bg-muted/30 cursor-zoom-in"
      >
        <Image
          src="/help/12-settings.png"
          alt="صفحة الإعدادات"
          width={1366}
          height={768}
          className="w-full h-auto block"
        />
      </button>

      <div className="grid sm:grid-cols-2 gap-3">
        {tier5AccountSettings.map((setting, i) => (
          <motion.div
            key={setting.title}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="bg-gradient-to-br from-background to-muted/20 border border-border rounded-xl p-4 flex items-start gap-3"
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 ring-1 ring-primary/15 flex items-center justify-center">
              <setting.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-extrabold text-foreground text-sm mb-1">
                {setting.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {setting.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
