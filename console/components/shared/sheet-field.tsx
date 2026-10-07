export function SheetField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`break-all text-sm text-foreground ${mono ? "tabular-nums" : ""}`}>{value}</p>
    </div>
  );
}
