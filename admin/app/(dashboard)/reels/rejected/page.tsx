import { getReelsByView, getReelStatusCounts, REEL_VIEW_CONFIG } from "../helpers/load-reels";
import { ReelRecordList } from "../components/reel-record-list";
import { ReelViewNav } from "../components/reel-view-nav";

// المرفوض بسببه المكتوب. الشاشة تعرض السبب نصّاً كما قرأه العميل — لا «مرفوض» مجرّدة:
// حين يسأل العميل «ليش؟» يكون الجواب أمام المسؤول لا في سجلٍّ يُنقَّب فيه.

const VIEW = "rejected" as const;

export default async function RejectedReelsPage() {
  const [reels, counts] = await Promise.all([getReelsByView(VIEW), getReelStatusCounts()]);
  const cfg = REEL_VIEW_CONFIG[VIEW];

  return (
    <div className="space-y-4">
      <ReelViewNav active={VIEW} counts={counts} />
      <div>
        <h2 className="text-base font-semibold">{cfg.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{cfg.lede}</p>
      </div>
      <ReelRecordList reels={reels} view={VIEW} />
    </div>
  );
}
