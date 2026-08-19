import Link from "next/link";

import { ReadingTimeCard } from "../reading-time-card/ReadingTimeCard";

import type { ArchiveState } from "../../helpers/build-archive-href";
import type { ReadingTimeBucket } from "../../helpers/reading-time-buckets";

interface DiscoverRailProps {
  readingTimeCounts: Record<ReadingTimeBucket, number>;
  current: ArchiveState;
}

/**
 * The left column, for the visitor who has no specific question — the one the filters on the right
 * cannot help, because he does not yet know what to filter by.
 *
 * It held «الأكثر قراءة» first, then a tag cloud, then modonty's own card. Khalid removed all
 * three (2026-08-19): «حضر عميل على حساب عميل» · «remove tag card no need» · «ابني كت خاص
 * بالarticle في الصفحة هاي». The measurements backed the first two — كيما زون held two of the top
 * five most-read, and nine of the top twelve tags were one partner's keyword set.
 *
 * What is left is the only axis that belongs to nobody and exists on no other page: how long the
 * read is. It describes the article, not who paid for it.
 */
export function DiscoverRail({ readingTimeCounts, current }: DiscoverRailProps) {
  return (
    <div className="space-y-3">
      <ReadingTimeCard counts={readingTimeCounts} current={current} />

      <section className="rounded-xl border border-border bg-card p-3">
        <h2 className="mb-1 text-sm font-bold text-foreground">ما لقيت جوابك؟</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          اسأل مودو — يجاوبك من محتوى مدونتي، وإذا ما لقى يوصّلك بالشريك المختصّ.
        </p>
        <Link href="/modo-chat" className="mt-2 inline-block text-xs font-medium text-link hover:underline">
          افتح مودو ←
        </Link>
      </section>
    </div>
  );
}
