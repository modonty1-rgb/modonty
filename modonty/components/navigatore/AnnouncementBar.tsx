"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconClose } from "@/lib/icons";

const DISMISS_KEY = "modonty_announcement_v1";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="w-full bg-accent text-white">
      <div className="container mx-auto max-w-[1128px] flex items-center h-9 px-4 gap-2">
        {/* balance spacer */}
        <div className="w-6 shrink-0" aria-hidden />

        <Link
          href="https://www.jbrseo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 text-[12px] font-bold hover:opacity-90 transition-opacity"
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          عملاء بلا إعلانات — جبر SEO
        </Link>

        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="إغلاق الإعلان"
        >
          <IconClose className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
