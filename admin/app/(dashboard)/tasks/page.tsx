import { getBoardTasks } from "./helpers/queries";
import { TaskBoard } from "./components/task-board";

/**
 * The board. A thin server component: fetch, then hand the data to the one
 * client island that needs it — the drag layer.
 */
export default async function TasksPage() {
  const board = await getBoardTasks();

  return <TaskBoard initialBoard={board} />;
}
