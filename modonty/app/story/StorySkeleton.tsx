export function StorySkeleton() {
  return (
    <div
      className="w-full min-h-[60vh] flex items-center justify-center bg-card rounded-3xl ring-2 ring-foreground/5 shadow-xl"
      aria-label="جارٍ تحميل قصة مدونتي"
      role="status"
      dir="rtl"
    >
      <div className="text-center space-y-4 px-6 py-12">
        <div
          aria-hidden
          className="w-14 h-14 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin"
        />
        <p className="text-base font-bold text-foreground/85">
          جاري تحميل القصة...
        </p>
        <p className="text-xs text-foreground/55">
          ٥ دقائق فقط · بصوت احترافي
        </p>
      </div>
    </div>
  );
}
