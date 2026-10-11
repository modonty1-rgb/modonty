import { getCalendarDesigners } from "../helpers/queries";
import { requireSocialActor } from "../helpers/require-social-actor";
import { NewCalendarForm } from "../components/new-calendar-form";

/**
 * Social Calendar › New Calendar — تأسيس كاليندر محتوى أو سوشيال لأيّ براند (خالد ١١ أكتوبر ٢٠٢٦).
 * كاليندر عميل مدونتي لا يُؤسَّس هنا: يفتحه تفعيله.
 */
export default async function NewSocialCalendarPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const actor = await requireSocialActor("editBrief");
  if ("error" in actor) return <p className="p-6 text-sm text-destructive">{actor.error}</p>;

  const [{ kind }, designers] = await Promise.all([searchParams, getCalendarDesigners()]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">كاليندر جديد</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">اختر نوعه، واكتب اسم البراند، وحدّد المصمم.</p>
      </header>
      <NewCalendarForm initialKind={kind === "social" ? "SOCIAL" : "CONTENT"} designers={designers} />
    </div>
  );
}
