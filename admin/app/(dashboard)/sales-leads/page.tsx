import { DueToday } from "./components/due-today";
import { LeadsBoard } from "./components/leads-board";
import { formatCount } from "./helpers/format-count";
import { getLeadSourceLabels } from "./helpers/get-lead-source-labels";
import { getLeadSources } from "./helpers/get-lead-sources";
import { getSalesLeads } from "./helpers/get-sales-leads";
import { summarizeLeads } from "./helpers/summarize-leads";

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

  // الحساب على السيرفر: الصفوف كلّها هنا أصلاً، وحسابها في المتصفّح يعيد المرور عليها في كل رسمة.
  const summary = summarizeLeads(rows);

  return (
    <div dir="rtl" className="space-y-4 p-4 sm:p-6">
      <DueToday leads={due} />

      {/* العنوان والزرّ يُمرَّران إلى اللوحة لأن الإشارات تجلس بينهما في صفٍّ واحد. */}
      <LeadsBoard
        rows={rows}
        summary={summary}
        sourceLabels={sourceLabels}
        activeSources={activeSources}
        title="العملاء المحتملون"
      />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          معروض أحدث <span className="tabular-nums">{formatCount(rows.length)}</span> من{" "}
          <span className="tabular-nums">{formatCount(total)}</span> — الباقي في القاعدة ولم يُحذف.
        </p>
      )}
    </div>
  );
}
