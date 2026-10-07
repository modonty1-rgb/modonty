/** The promises above the player: five minutes · no sales call · no PDF · listen, judge, decide. */
export function PlayerBadges() {
  return (
    <div className="flex items-center gap-x-3 gap-y-1 text-xs md:text-xs text-foreground/75 flex-wrap">
      <span className="inline-flex items-center gap-1">
        <span aria-hidden className="text-amber-500">⏱</span>
        <span>خمس دقائق فقط</span>
      </span>
      <span aria-hidden className="text-foreground/30">·</span>
      <span className="inline-flex items-center gap-1">
        <span aria-hidden className="text-amber-500">🚫</span>
        <span>بدون اتصال بيع</span>
      </span>
      <span aria-hidden className="hidden md:inline text-foreground/30">·</span>
      <span className="hidden md:inline-flex items-center gap-1">
        <span aria-hidden className="text-amber-500">🚫</span>
        <span>بدون PDF</span>
      </span>
      <span aria-hidden className="hidden md:inline text-foreground/30">·</span>
      <span className="hidden md:inline-flex items-center gap-1">
        <span aria-hidden className="text-amber-500">👂</span>
        <span>اسمع · احكم · قرّر</span>
      </span>
    </div>
  );
}
