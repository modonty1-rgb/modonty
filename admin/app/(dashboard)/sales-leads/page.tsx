import { LeadsTable } from "./components/leads-table";
import { formatCount } from "./helpers/format-count";
import { getLeadSourceLabels } from "./helpers/get-lead-source-labels";
import { getLeadSources } from "./helpers/get-lead-sources";
import { getSalesLeads } from "./helpers/get-sales-leads";

/**
 * The table reads the newest 2,000; a lead due today but older than that would vanish from
 * «عليّ اليوم». The due query is uncapped by age, so its rows are added when missing.
 */
function withDue<T extends { id: string }>(rows: T[], due: T[]): T[] {
  const seen = new Set(rows.map((r) => r.id));
  return [...rows, ...due.filter((r) => !seen.has(r.id))];
}

export const metadata = { title: "العملاء المحتملون — أدمن مدونتي" };

export default async function SalesLeadsPage() {
  /**
   * ثلاثة متوازية — ولا واحدة تتوقّف على الأخرى، وتسلسلها يضيف رحلتين إلى القاعدة بلا سبب.
   *
   * و`getLeadSources` (المفعَّلة وحدها) غير `getLeadSourceLabels` (الكل): الأولى تبني
   * **الحبّات** فتُعرض كل قناةٍ متاحة ولو بصفر، والثانية تترجم قيمةً مخزَّنةً لمصدرٍ أُقفل.
   */
  const [{ due, rows, total, truncated }, sourceLabels, activeSources] = await Promise.all([
    getSalesLeads(),
    getLeadSourceLabels(),
    getLeadSources(),
  ]);

  return (
    <div dir="rtl" className="space-y-3 px-4 pb-6 sm:px-5">
      <LeadsTable rows={withDue(rows, due)} sourceLabels={sourceLabels} activeSources={activeSources} />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أحدث <span className="tabular-nums">{formatCount(rows.length)}</span> من{" "}
          <span className="tabular-nums">{formatCount(total)}</span> — الباقي في القاعدة ولم يُحذف.
        </p>
      )}
    </div>
  );
}
