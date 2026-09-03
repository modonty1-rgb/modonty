import { getBoardTasks } from "./helpers/queries";
import { TaskBoard } from "./components/task-board";
import { auth } from "@/lib/auth";

/**
 * The board. A thin server component: fetch, then hand the data to the one
 * client island that needs it — the drag layer.
 */
export default async function TasksPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;

  const board = await getBoardTasks(userId);

  return <TaskBoard initialBoard={board} />;
}
