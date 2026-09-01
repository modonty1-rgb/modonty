import { loadSiteUrl } from "@/lib/seo/site-url";

import { getReelsByView, getReelStatusCounts, REEL_VIEW_CONFIG } from "../helpers/load-reels";
import { ReelRecordList } from "../components/reel-record-list";
import { ReelViewNav } from "../components/reel-view-nav";

// الريلز الحيّة على مودونتي. الأدمن كان يرى عددها ولا يصل إليها — فلا يعرف ما هو
// منشور باسمه الآن، ولا يملك نقطة يبدأ منها أيّ تحكّم (إيقاف · حذف) في المراحل التالية.

const VIEW = "published" as const;

export default async function PublishedReelsPage() {
  // ثلاثتها مستقلّة (`async-parallel`). و`loadSiteUrl` ترمي حين لا رابط في القاعدة ولا في
  // البيئة — وهذا صحيح لمن يبني رابطاً قانونياً، أمّا هنا فالرابط تسهيل: تُلتقط الرمية
  // ويسقط زرّ المعاينة وحده بدل أن تسقط شاشة السجلّ كلّها.
  const [reels, counts, siteUrl] = await Promise.all([
    getReelsByView(VIEW),
    getReelStatusCounts(),
    loadSiteUrl().catch(() => null),
  ]);
  const cfg = REEL_VIEW_CONFIG[VIEW];

  return (
    <div className="space-y-4">
      <ReelViewNav active={VIEW} counts={counts} />
      <div>
        <h2 className="text-base font-semibold">{cfg.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{cfg.lede}</p>
      </div>
      <ReelRecordList reels={reels} view={VIEW} siteUrl={siteUrl} />
    </div>
  );
}
