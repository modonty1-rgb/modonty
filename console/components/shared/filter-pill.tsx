import { Button } from "@/components/ui/button";

export function FilterPill({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "primary" | "amber" | "emerald" | "red" | "slate";
}) {
  const accent =
    !active && tone
      ? {
          primary: "border-primary/30 text-primary",
          amber: "border-amber-200 text-amber-700",
          emerald: "border-emerald-200 text-emerald-700",
          red: "border-red-200 text-red-700",
          slate: "border-slate-200 text-slate-600",
        }[tone]
      : "";
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick} className={`gap-2 whitespace-nowrap ${accent}`}>
      {label}
      <span
        className={`inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums ${
          active ? "bg-background/20 text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Button>
  );
}
