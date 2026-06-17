import { Badge } from "@/components/ui/badge";
import { Newspaper, Star } from "lucide-react";
import { formatPrice } from "../lib/pricing";

// One card per plan, built in page.tsx by merging jbrseo's per-country Plan rows.
// mo = monthly price · yr = monthly equivalent on the annual plan.
export interface DisplayPlan {
  slug: string;
  name: string;
  displayOrder: number;
  articlesLabel: string;
  badge: string | null;
  featuredBadge: string | null;
  SA: { mo: number; yr: number } | null;
  EG: { mo: number; yr: number } | null;
}

interface Props {
  plans: DisplayPlan[];
}

export function PlanCards({ plans }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {plans.map((plan) => {
        const isFeatured = Boolean(plan.featuredBadge);
        const cardTone = isFeatured
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card";

        return (
          <div
            key={plan.slug}
            className={`rounded-xl border ${cardTone} p-4 flex flex-col gap-4 transition-shadow hover:shadow-md`}
          >
            {/* Header — name + badge */}
            <div className="flex items-start justify-between gap-2 min-h-[28px]">
              <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
              {(plan.featuredBadge || plan.badge) && (
                <Badge
                  variant={isFeatured ? "default" : "secondary"}
                  className="gap-1 text-[10px] shrink-0"
                >
                  {isFeatured && <Star className="h-3 w-3" />}
                  {plan.featuredBadge || plan.badge}
                </Badge>
              )}
            </div>

            {/* Dual-country pricing — monthly + yearly */}
            <div className="space-y-3 py-2 border-y">
              <CountryPrice flag="🇸🇦" label="Saudi Arabia" price={plan.SA} currency="SA" />
              <CountryPrice flag="🇪🇬" label="Egypt" price={plan.EG} currency="EG" />
            </div>

            {/* Articles per month */}
            {plan.articlesLabel && (
              <div className="flex items-center gap-2 text-sm font-medium mt-auto">
                <Newspaper className="h-4 w-4 text-primary shrink-0" />
                <span>{plan.articlesLabel}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// One country block: monthly price + yearly price (per-month discounted, with annual total).
function CountryPrice({
  flag,
  label,
  price,
  currency,
}: {
  flag: string;
  label: string;
  price: { mo: number; yr: number } | null;
  currency: "SA" | "EG";
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{flag}</span>
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      {price ? (
        <div className="mt-1 flex items-stretch gap-2">
          <PlanRate
            label="Monthly"
            value={formatPrice(price.mo, currency)}
            suffix="/ mo"
          />
          <PlanRate
            label="Yearly"
            value={formatPrice(price.yr, currency)}
            suffix="/ mo"
            note={price.yr > 0 ? `${formatPrice(price.yr * 12, currency)} / yr` : undefined}
            highlight
          />
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground">—</p>
      )}
    </div>
  );
}

function PlanRate({
  label,
  value,
  suffix,
  note,
  highlight,
}: {
  label: string;
  value: string;
  suffix: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-md border px-2 py-1.5 ${
        highlight ? "border-primary/40 bg-primary/5" : "border-border bg-muted/30"
      }`}
    >
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-bold tabular-nums leading-tight">
        {value}
        <span className="text-[10px] font-normal text-muted-foreground ms-1">{suffix}</span>
      </p>
      {note && <p className="text-[10px] text-muted-foreground tabular-nums">{note}</p>}
    </div>
  );
}
