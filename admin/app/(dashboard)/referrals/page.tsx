import { ReferralLeadStatus } from "@prisma/client";

import { getReferrals, getReferralStats, getClientOptions } from "./actions/referral-actions";
import { ReferralsTable } from "./components/referrals-table";
import { STATUS_AR } from "./helpers/referral-status";

export const metadata = {
  title: "Referrals — Modonty Admin",
};

/** ترتيب البطاقات = ترتيب المسار، لا الأبجدية: الفريق يقرأ القمع من أعلاه إلى أسفله. */
const ORDER: ReferralLeadStatus[] = [
  "NEW", "CONTACTED", "SUBSCRIBED", "PAID", "REWARDED", "REJECTED", "LOST",
];

export default async function ReferralsPage() {
  const [rows, stats, clients] = await Promise.all([getReferrals(), getReferralStats(), getClientOptions()]);

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-6 sm:px-6">
      <header>
        <h1 className="text-xl font-semibold leading-tight">إحالات الشركاء</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          يرفعها العميل من تطبيق الشركاء بعد تأكيد موافقة صاحب الرقم. الفريق يتابعها من هنا —
          ولا تُنشأ إحالة من هذه الشاشة، فالموافقة لا يملكها موظّف.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ORDER.map((s) => (
          <div key={s} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-lg font-semibold tabular-nums">{stats.byStatus[s] ?? 0}</div>
            <div className="text-[11px] text-muted-foreground">{STATUS_AR[s]}</div>
          </div>
        ))}
      </div>

      <ReferralsTable rows={rows} clients={clients} />

      {rows.length === 300 && (
        <p className="text-xs text-muted-foreground">
          تُعرض آخر ٣٠٠ إحالة. الأقدم منها في القاعدة ولم تُحذف.
        </p>
      )}
    </div>
  );
}
