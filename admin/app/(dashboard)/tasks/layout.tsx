import type { ReactNode } from "react";

export const metadata = { title: "Tasks" };

/**
 * The frame every screen under `/tasks` shares — padding and gap, nothing else.
 *
 * It used to print "Tasks · N tasks · M done" here, which is the signed-in person's
 * OWN board count. On Assign Task and Reviews that line read as the page's summary
 * («No tasks yet» above a list of tasks you assigned — خالد ٢٣ سبتمبر ٢٠٢٦), so it
 * moved to the board page, the only screen it describes. Archive, Reviews and
 * Assign Task each carry their own title.
 */
export default function TasksLayout({ children }: { children: ReactNode }) {
  return <div className="flex h-full min-h-0 flex-col gap-3 p-4 sm:p-6">{children}</div>;
}
