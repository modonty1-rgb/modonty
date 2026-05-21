"use client";

import { motion } from "framer-motion";
import type { Hotspot as HotspotType } from "../data/sections";

interface HotspotProps extends HotspotType {
  delay?: number;
  /** DOM id used as anchor for driver.js tour. */
  anchorId?: string;
}

export function Hotspot({ top, right, left, n, delay = 0, anchorId }: HotspotProps) {
  const style: React.CSSProperties = { top: `${top}%` };
  if (right !== undefined) style.right = `${right}%`;
  if (left !== undefined) style.left = `${left}%`;

  return (
    <motion.div
      id={anchorId}
      initial={{ opacity: 0, scale: 0.4 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm shadow-lg z-10"
      style={style}
    >
      <span className="absolute -inset-2 rounded-full border-2 border-dashed border-amber-500 opacity-50 animate-[pulse_2s_ease-in-out_infinite]" />
      {n}
    </motion.div>
  );
}
