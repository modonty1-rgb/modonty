import { getSystemErrors } from "./actions/system-errors-actions";
import { SystemErrorsTable } from "./components/system-errors-table";
import { ShieldAlert } from "lucide-react";

export default async function SystemErrorsPage() {
  const errors = await getSystemErrors();

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <div>
          <h1 className="text-xl font-semibold">Error Logs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Server errors captured automatically from all admin routes
          </p>
        </div>
      </div>

      <SystemErrorsTable errors={errors} />
    </div>
  );
}
