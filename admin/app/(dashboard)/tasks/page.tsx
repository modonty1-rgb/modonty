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
    // عربيّةٌ ومن اليمين كنافذة المهمّة وصفحة الإسناد (خالد ٣ أكتوبر ٢٠٢٦) — المهامُّ تُكتب بالعربيّة،
    // وفي لوحةٍ يساريّة كان «[تجربة]» يقفز لآخر العنوان. `contents` كي يبقى تخطيطُ الـlayout كما هو.
    <div dir="rtl" className="contents">
      <TaskBoard initialBoard={board} total={counts.total} done={counts.DONE} />
      <ArchivedTasksTable tasks={archivedTasks} />
    </div>
  );
}
