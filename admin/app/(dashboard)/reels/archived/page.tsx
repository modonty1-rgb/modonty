import { getReelsByView, getReelStatusCounts, REEL_VIEW_CONFIG } from "../helpers/load-reels";
import { ReelRecordList } from "../components/reel-record-list";
import { ReelViewNav } from "../components/reel-view-nav";

// المؤرشف — ما خرج من الواجهة العامّة وبقي صفّه. يصل إليه الريل من طريقين: العميل
// يسحب ريله المنشور من الكونسول، أو يُؤرشَف من هنا لاحقاً. وكان لا يُرى إطلاقاً، فسحبُ
// العميل لريل حيّ كان يحدث بلا أثر يظهر لأحد.

const VIEW = "archived" as const;

export default async function ArchivedReelsPage() {
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
