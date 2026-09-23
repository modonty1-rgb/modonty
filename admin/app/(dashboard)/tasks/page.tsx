import { getBoardTasks, getTaskCounts } from "./helpers/queries";
import { TaskBoard } from "./components/task-board";
import { ArchivedTasksTable } from "./components/archived-tasks-table";
import { getArchivedTasks } from "./helpers/queries/get-archived-tasks";
import { auth } from "@/lib/auth";

/**
 * The board. A thin server component: fetch, then hand the data to the one
 * client island that needs it — the drag layer.
 */
export default async function TasksPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const [board, archivedTasks, counts] = await Promise.all([
    getBoardTasks(userId),
    getArchivedTasks(userId),
    getTaskCounts(userId),
  ]);

  return (
    <>
      <header className="min-w-0">
        <h1 className="text-lg font-bold sm:text-xl">Tasks</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {counts.total === 0 ? "No tasks yet — start with one" : `${counts.total} tasks · ${counts.DONE} done`}
        </p>
      </header>
      <TaskBoard initialBoard={board} />
      <ArchivedTasksTable tasks={archivedTasks} />
    </>
  );
}
