import { getAssignableStaff, getBoardTasks } from "./helpers/queries";
import { TaskBoard } from "./components/task-board";

/**
 * The board. A thin server component: fetch, then hand the data to the one
 * client island that needs it — the drag layer.
 *
 * Both reads are awaited in parallel; they are independent, and awaiting them
 * in sequence would make the page wait for the sum instead of the slower one.
 */
export default async function TasksPage() {
  const [board, staff] = await Promise.all([getBoardTasks(), getAssignableStaff()]);

  return <TaskBoard initialBoard={board} staff={staff} />;
}
