import { getBriefRows } from "./helpers/load-briefs";
import { BriefsTable } from "./components/briefs-table";

// The content team's entry point: every client, how complete their brief is, and the two
// doors a writer needs — read the brief, or step into the client's own console.
//
// Financials are absent by construction, not by hiding: the query never selects a price,
// a payment state or a subscription status, and the client page this links to renders
// none of them either.

export default async function BriefsPage() {
  const rows = await getBriefRows();

  const ready = rows.filter((r) => r.completeness >= 80).length;
  const thin = rows.filter((r) => r.completeness < 50).length;

  return (
    <div className="mx-auto max-w-[1080px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Content Briefs</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            بيانات كل عميل كما عبّاها بنفسه — اقرأ الملخّص قبل ما تكتب له، أو ادخل كونسوله
            وشوف شغله من عينه.
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <Pill label="جاهز للكتابة" value={ready} tone="emerald" />
          <Pill label="بياناته ناقصة" value={thin} tone="amber" />
          <Pill label="الإجمالي" value={rows.length} tone="muted" />
        </div>
      </div>

      <BriefsTable rows={rows} />
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "muted" }) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span className={`rounded-full px-2.5 py-1 font-medium ${tones[tone]}`}>
      {label} <b>{value}</b>
    </span>
  );
}
