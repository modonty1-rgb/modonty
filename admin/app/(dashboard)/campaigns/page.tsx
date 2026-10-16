import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { CampaignAlerts } from "./components/campaign-alerts";
import { CampaignsTable } from "./components/campaigns-table";
import { buildCampaignBoard } from "./helpers/build-campaign-board";
import { buildCampaignTableRows } from "./helpers/build-campaign-table-rows";
import { countBriefSubmissions } from "./helpers/count-brief-submissions";
import { getCampaigns } from "./helpers/get-campaigns";
import { getSalesResults } from "./helpers/get-sales-results";

export const metadata = { title: "الحملات" };

/**
 * الحملات — بريفات الميديا باير وموافقة الأدمن، وأرقام ميتا بجانب كلّ بريف (خالد ٢٩ سبتمبر ٢٠٢٦)،
 * في جدولٍ واحد (١٦ أكتوبر ٢٠٢٦). «بريف جديد» من قائمة الحملات في الهيدر وحدها — لا زرّ ثانٍ هنا.
 *
 * تنبيهات البريف صارت شارات في صفّه؛ يبقى فوق الجدول ما لا صفّ له: حملةٌ شغّالة في ميتا بلا بريف،
 * وتعذّر الوصول إلى ميتا.
 */
export default async function CampaignsPage() {
  const [rows, admin] = await Promise.all([getCampaigns(), checkFinanceAdmin()]);
  const [{ metaByBrief, alerts, metaErrors }, salesByBrief, submissionsByBrief] = await Promise.all([
    buildCampaignBoard(rows),
    getSalesResults(rows.filter((r) => r._count.leads > 0).map((r) => r.id)),
    countBriefSubmissions(rows),
  ]);
  const tableRows = buildCampaignTableRows(rows, metaByBrief, alerts, salesByBrief, submissionsByBrief);

  return (
    <div dir="rtl" className="space-y-3">
      <h1 className="text-lg font-semibold tracking-[-0.01em]">الحملات</h1>
      <CampaignAlerts alerts={alerts.filter((a) => a.kind === "unapproved")} metaErrors={metaErrors} />
      <CampaignsTable rows={tableRows} canDecide={admin.status === "ok"} />
    </div>
  );
}
