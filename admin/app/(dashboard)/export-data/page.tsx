import { getExportCounts } from "./actions/export-counts";
import { ExportCards } from "./components/export-cards";

export default async function ExportDataPage() {
  const counts = await getExportCounts();

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">Export Data</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Download your data as spreadsheet files for reports or backups
        </p>
      </div>
      <ExportCards counts={counts} />
    </div>
  );
}
