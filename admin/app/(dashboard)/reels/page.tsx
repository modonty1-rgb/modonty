import { getPendingReels, getReelStatusCounts } from "./helpers/load-reels";
import { ReelsApprovalList } from "./components/reels-approval-list";

// أ٥ — the missing exit of the reels flow: everything a client uploads sits at
// PENDING_APPROVAL until this screen says yes. Approval publishes straight to the
// public feed; rejection sends a reason back to the client's card.

export default async function ReelsApprovalPage() {
  const [reels, counts] = await Promise.all([getPendingReels(), getReelStatusCounts()]);

  return (
    <div className="mx-auto max-w-[880px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Reels Approval</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            ريلز رفعها العملاء من الكونسول وتستنى قرارك — الاعتماد ينشرها فوراً على مودونتي.
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <CountPill label="بالانتظار" value={counts.PENDING_APPROVAL ?? 0} tone="amber" />
          <CountPill label="منشور" value={counts.PUBLISHED ?? 0} tone="emerald" />
          <CountPill label="مرفوض" value={counts.REJECTED ?? 0} tone="red" />
        </div>
      </div>

      <ReelsApprovalList reels={reels} />
    </div>
  );
}

function CountPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "red";
}) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-500/10 text-red-700 dark:text-red-400",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 font-medium ${tones[tone]}`}>
      {label} <b>{value}</b>
    </span>
  );
}
