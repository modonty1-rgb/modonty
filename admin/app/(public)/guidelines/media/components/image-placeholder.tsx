import type { CSSProperties } from "react";

export interface ImagePlaceholderProps {
  label: string;
  sublabel?: string;
  width: number;
  height: number;
  ratio: string;
  note?: string;
  className?: string;
  shape?: "rect" | "circle";
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

export function ImagePlaceholder({
  label,
  sublabel,
  width,
  height,
  ratio,
  note,
  className = "",
  shape = "rect",
  size = "md",
  style,
}: ImagePlaceholderProps) {
  const isCircle = shape === "circle";

  if (isCircle) {
    const dimText = size === "sm" ? "text-[9px]" : size === "lg" ? "text-sm" : "text-xs";
    const labelText = size === "sm" ? "text-[8px]" : "text-[10px]";
    return (
      <div
        className={`relative border-2 border-dashed border-primary/40 bg-primary/[0.06] rounded-full flex flex-col items-center justify-center gap-0.5 ${className}`}
        style={style}
      >
        <span className={`font-black text-primary/70 leading-none ${dimText}`}>{width}×{height}</span>
        <span className={`font-bold text-primary/50 leading-none ${labelText}`}>{ratio}</span>
        {size !== "sm" && <span className={`text-primary/40 text-center leading-tight ${labelText}`}>{label}</span>}
      </div>
    );
  }

  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div
      className={`relative border-2 border-dashed border-primary/40 bg-primary/[0.06] rounded-lg flex flex-col items-center justify-center gap-1.5 overflow-hidden ${className}`}
      style={style}
    >
      <span className={`absolute top-2 start-2 bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded ${isSm ? "text-[8px]" : "text-[10px]"}`}>
        {sublabel || label}
      </span>
      <span className={`font-black text-primary/70 tracking-tight leading-none ${isLg ? "text-2xl" : isSm ? "text-sm" : "text-xl"}`}>
        {width} × {height}
      </span>
      <span className={`font-bold text-primary/60 bg-primary/10 border border-primary/30 px-3 py-0.5 rounded-full ${isLg ? "text-sm" : isSm ? "text-[9px]" : "text-xs"}`}>
        نسبة {ratio}
      </span>
      {note && (
        <span className={`text-amber-600 font-medium text-center px-4 leading-snug ${isSm ? "text-[8px]" : "text-[10px]"}`}>
          {note}
        </span>
      )}
    </div>
  );
}
