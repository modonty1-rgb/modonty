import { ModontyTrustMark } from "../../icons/modonty-trust-mark";
import { cn } from "../../../lib/utils/index";

/**
 * «شريك موثَّق في مدونتي» — ثابتة في كل موقع شريك، بلا حقل ولا شرط: لا أحد ينضمّ إلينا
 * إلا موثَّقاً (خالد ٣١ أغسطس). مكانها الشريط العلوي لا شريط الثقة، فهي عن علاقته بنا
 * لا عن شهاداته.
 *
 * العلامة من `ModontyTrustMark` (ألوانها مثبَّتة لأنها شارة لا أيقونة واجهة)، والنصّ
 * يظهر من `lg` فصاعداً — الشريط العلوي ينفق عرضه على الروابط والهاتف، وتحت ذلك تبقى
 * الشارة مقروءة لقارئ الشاشة عبر `sr-only`.
 */
export function VerifiedBadge({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span
      title="شريك موثَّق في مدونتي"
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium",
        light ? "border-white/25 text-white/85" : "border-border text-muted-foreground",
        className,
      )}
    >
      <ModontyTrustMark className="h-4 w-4 shrink-0" />
      <span className="sr-only lg:not-sr-only">شريك موثَّق في مدونتي</span>
    </span>
  );
}
