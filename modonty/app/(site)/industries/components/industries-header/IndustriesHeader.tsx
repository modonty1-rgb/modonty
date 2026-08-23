import { ModontyIndustriesMark } from "@/components/icons/modonty-industries-mark";

/**
 * The page opens with its identity, not a dry title (Khalid, 21 Aug: «ما في روح»): the
 * approved industries mark in its two-tone form (gateways = foreground, diamond = accent,
 * per shared/assets/brand/README.md) beside the visitor-intent line. Mobile only — the
 * caller hides it ≥1240px where the rail carries the identity.
 */
export function IndustriesHeader() {
  return (
    <div className="flex items-center gap-3">
      <ModontyIndustriesMark className="size-11 shrink-0 text-foreground" aria-hidden />
      <div>
        <p className="text-lg font-black leading-tight text-foreground">المجالات</p>
        <p className="mt-0.5 text-xs text-muted-foreground">اختر مجالك — مقالات وشركاء موثوقون فيه</p>
      </div>
    </div>
  );
}
