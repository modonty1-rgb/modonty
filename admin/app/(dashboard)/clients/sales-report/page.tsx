import { getSalesReport, type Period } from "./actions/get-sales-report";
import { SalesReportView } from "./components/sales-report-view";

export const metadata = {
  title: "Sales Report - Modonty",
};

export default async function SalesReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: raw } = await searchParams;
  const m = Number(raw);
  const period: Period = Number.isInteger(m) && m >= 1 && m <= 12 ? m : "all";
  const report = await getSalesReport(period);

  return <SalesReportView report={report} period={period} />;
}
