import { FeedbackDialog } from "./components/feedback-dialog";
import { FeedbackList } from "./components/feedback-list";
import { getFeedback } from "./helpers/get-feedback";

export const metadata = { title: "Feedback" };

/**
 * Feedback moved out of the top bar and into System (Khalid, 2026-09-04): «شيل لي بس
 * الـlink تبع الـfeedback وحط لي إياه في الـsystem… نستفيد منها لو أي فيه feedback موجود».
 *
 * The button in the bar could only SEND. Every report was already being stored as an
 * `AdminNote`, but nothing read it back — so the reports existed and no one could open
 * them. A page can do both, and the sidebar is where you go looking for a record.
 *
 * The Beta pill went with it: the system is past the point where every screen needs to
 * announce it is unfinished.
 */
export default async function FeedbackPage() {
  const { rows, total, truncated } = await getFeedback();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? "Bugs and ideas the team sends land here."
              : `${total} report${total === 1 ? "" : "s"} from the team — newest first.`}
          </p>
        </div>
        <FeedbackDialog />
      </div>

      <FeedbackList rows={rows} />

      {truncated && (
        <p className="text-xs text-muted-foreground">
          Showing the newest {rows.length} of {total}.
        </p>
      )}
    </div>
  );
}
