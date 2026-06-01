import Link from "next/link";
import { ClipboardList, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIntakeForm } from "./actions/intake-admin-actions";
import { IntakeManager } from "./components/intake-manager";

export const dynamic = "force-dynamic";

export default async function IntakeQuestionsPage() {
  const form = await getIntakeForm();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Intake Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The questionnaire your clients answer in their console. Add a question, edit it, reorder,
            hide or delete — changes appear for clients immediately.
          </p>
        </div>
      </header>

      {form ? (
        <IntakeManager form={form} />
      ) : (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <Database className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold">No questionnaire in the database yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Run the one-click bootstrap to load the current intake questions into the database. Open
            Database → Auto-Maintenance and run it — the “Intake Questionnaire” step seeds everything
            (create-only, safe to re-run).
          </p>
          <Button asChild className="mt-4">
            <Link href="/database">Go to Database</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
