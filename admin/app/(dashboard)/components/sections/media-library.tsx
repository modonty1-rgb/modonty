import Link from "next/link";
import { AlertTriangle, Database, Image as ImageIcon } from "lucide-react";

import { getMediaCounts } from "../../actions/media-counts";
import { Ghost, SectionHead, TierCard, ZChip } from "../dashboard-ui";

/**
 * Media (contract: admin-dashboard-triage-v2-ui.html). Two questions only:
 * is it used, and can search read it. SEO gaps are amber — this week's work — and
 * unused files are plain: they cost storage, not clients (the tier system's whole point).
 */

export async function MediaLibrary() {
  const { total, used, unused, noAlt, failingSeo, noDimensions } = await getMediaCounts();

  return (
    <div>
      <SectionHead
        icon={ImageIcon}
        title="Media"
        subtitle="usage & search"
        right={
          <Link href="/media" className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline">
            <span
              className={`text-base font-bold tabular-nums ${
                failingSeo > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {failingSeo}
            </span>
            failing SEO
            <span className="text-muted-foreground/40">·</span>
            {used.toLocaleString("en-US")} of {total.toLocaleString("en-US")} in use
            <span className="text-primary">→</span>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2.5">
        <TierCard
          href="/media/segment/failing-seo"
          tier={failingSeo > 0 ? "warm" : "ok"}
          icon={AlertTriangle}
          value={failingSeo}
          label="Failing SEO"
          note="below 60 — alt text is the fix, 40 of 100 pts"
        />
        <TierCard
          href="/media/segment/no-alt"
          tier={noAlt > 0 ? "warm" : "ok"}
          icon={ImageIcon}
          value={noAlt}
          label="No alt text"
          note="invisible in Google Images"
        />
        <TierCard
          href="/media/segment/unused"
          tier="plain"
          icon={Database}
          value={unused}
          label="Unused"
          note="housekeeping — storage only, nothing breaks"
        />
        {noDimensions === 0 ? (
          <Ghost title="Healthy">
            <ZChip good>
              <b className="font-bold">0</b> no dimensions ✓
            </ZChip>
          </Ghost>
        ) : (
          <TierCard
            href="/media/segment/no-dimensions"
            tier="warm"
            icon={ImageIcon}
            value={noDimensions}
            label="No dimensions"
            note="cannot be a share image — the page jumps while it loads"
          />
        )}
      </div>
    </div>
  );
}
