import { getReelsByView, getReelStatusCounts, REEL_VIEW_CONFIG } from "../helpers/load-reels";
import { ReelsApprovalList } from "../components/reels-approval-list";
import { ReelViewNav } from "../components/reel-view-nav";

// أ٥ — the missing exit of the reels flow: everything a client uploads sits at
// PENDING_APPROVAL until this screen says yes. Approval publishes straight to the
// public feed; rejection sends a reason back to the client's card.
//
// الشاشة نفسها لم تتغيّر — انتقلت من `/reels` إلى `/reels/pending` كي تصير الحالة
// في المسار، ويصير لأخواتها الثلاث عناوين تُفتح وتُنسخ مثلها.

const VIEW = "pending" as const;

export default async function PendingReelsPage() {
  // مستقلّان — فيُطلبان معاً لا بالتتابع (`async-parallel`).
  const [reels, counts] = await Promise.all([getReelsByView(VIEW), getReelStatusCounts()]);
  const cfg = REEL_VIEW_CONFIG[VIEW];

  return (
    <div className="space-y-4">
      <ReelViewNav active={VIEW} counts={counts} />
      <div>
        <h2 className="text-base font-semibold">{cfg.title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{cfg.lede}</p>
      </div>
      <ReelsApprovalList reels={reels} />
    </div>
  );
}
