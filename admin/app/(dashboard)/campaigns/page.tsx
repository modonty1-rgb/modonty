import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CampaignCard } from "./components/campaign-card";
import { getCampaigns } from "./helpers/get-campaigns";

export const metadata = { title: "الحملات" };

export default async function CampaignsPage() {
  const rows = await getCampaigns();

  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold tracking-[-0.01em]">الحملات</h1>
        <span className="text-xs text-muted-foreground">
          {rows.length > 0 ? `${new Intl.NumberFormat("ar-EG").format(rows.length)} حملة` : null}
        </span>
        <Button asChild size="sm" className="ms-auto h-8 gap-1.5 rounded">
          <Link href="/campaigns/new">
            <Plus className="size-4" aria-hidden /> حملة جديدة
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">لا توجد حملات بعد</p>
          {/* الحالة الفارغة تقول ما تكسبه بالفعل التالي، لا «لا يوجد شيء» وحدها. */}
          <p className="mt-1 text-xs text-muted-foreground">
            أسّس أوّل حملة، ومنها يُعرف مَن جاء بها وبكم.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id}>
              <CampaignCard row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
