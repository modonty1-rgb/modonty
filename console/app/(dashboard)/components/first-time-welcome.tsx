"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, BookOpen, Sparkles } from "lucide-react";

const STORAGE_KEY = "modonty.help.welcomeSeen.v1";

export function FirstTimeWelcome() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // localStorage might be unavailable — ignore
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative max-w-lg w-full bg-card rounded-2xl shadow-2xl overflow-hidden"
            dir="rtl"
          >
            <button
              type="button"
              onClick={dismiss}
              className="absolute top-3 left-3 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors z-10"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className="px-6 pt-8 pb-6 text-white"
              style={{ background: "linear-gradient(135deg, #1e58c8 0%, #3b82f6 100%)" }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 240 }}
                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4"
              >
                <Sparkles className="w-7 h-7" />
              </motion.div>
              <h2 className="text-2xl font-extrabold mb-1.5">أهلاً بك في بوابتك ✨</h2>
              <p className="text-sm opacity-95 leading-relaxed">
                هذي أول زيارة لك. حضّرنا لك دليل بسيط يشرح كل صفحة بكلام واضح — وقتك ٥ دقايق بس.
              </p>
            </div>

            <div className="px-6 py-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <b className="block text-foreground mb-0.5">دليل مرئي بلقطات شاشة</b>
                  <span className="text-muted-foreground">١٨ قسم يشرحون لك كل شي بدون مصطلحات.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <b className="block text-foreground mb-0.5">تفتحه أي وقت من بعدين</b>
                  <span className="text-muted-foreground">
                    موجود دايماً على رابط <code className="text-xs">/help</code> — ما يضيع.
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <a
                  href="/help"
                  onClick={() => {
                    try {
                      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
                    } catch {}
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  ابدأ الجولة
                  <ArrowLeft className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={dismiss}
                  className="px-5 h-11 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
