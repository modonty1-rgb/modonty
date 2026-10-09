import { cn } from "@/lib/utils";

/**
 * هويّة العميل في الرؤوس والكروت. القديم كان يرسم الحرف الأول على `client.color`؛ في مدونتي
 * الهويّة من شعار العميل (`Client.logoMedia` — PRD §٣.٣)، والحرف الأول احتياط لمن لا شعار له.
 */
export function ClientAvatar({ name, logoUrl, className }: { name: string; logoUrl: string | null; className?: string }) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- شعار صغير من CDN؛ لا حاجة لمحسّن الصور هنا.
      <img
        src={logoUrl}
        alt={name}
        className={cn("h-8 w-8 shrink-0 rounded-lg border border-border bg-white object-contain p-0.5", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm",
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || "؟"}
    </div>
  );
}
