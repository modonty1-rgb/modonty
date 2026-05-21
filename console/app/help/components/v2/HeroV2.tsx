"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, ImageIcon, MessageCircleQuestion } from "lucide-react";

export function HeroV2() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl p-8 md:p-12 mb-8 text-white"
      style={{ background: "linear-gradient(135deg, #1e58c8 0%, #3b82f6 100%)" }}
    >
      <motion.div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/8"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/6"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur px-3 py-1 rounded-full mb-3">
          دليل الاستخدام · مودونتي
        </span>
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
          أهلاً بك في بوابتك
        </h1>
        <p className="text-base md:text-lg opacity-95 max-w-2xl leading-relaxed mb-6">
          خلاص العمل عندنا، أنت تتابع من هنا. هذا الدليل يوريك:
          إيش نسوي لك، كيف يتفاعل زوار موقعك، وإيش دورك.
          بدون مصطلحات، صفر تعقيد.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            ١٠ دقائق قراءة
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium">
            <ImageIcon className="w-3.5 h-3.5" />
            من موقعك الحقيقي
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs font-medium">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            بدون أي مصطلحات تقنية
          </span>
        </div>

        <a
          href="#t0"
          className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all"
        >
          اعرف منصة مودونتي
          <ArrowLeft className="w-4 h-4" />
        </a>
      </div>
    </motion.section>
  );
}
