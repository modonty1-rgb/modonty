"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, CloudUpload, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { migrateMediaBatch, type BunnyMigrationStats } from "../../actions/migrate-media-to-bunny";

const BATCH = 5; // small batches — stay well under the shared Cloudinary bandwidth

interface MigrationError {
  id: string;
  filename: string;
  error: string;
}

export function BunnyMigrationSection({ stats }: { stats: BunnyMigrationStats }) {
  const router = useRouter();
  const [migrated, setMigrated] = useState(stats.migrated);
  const [running, setRunning] = useState(false);
  const [errors, setErrors] = useState<MigrationError[]>([]);
  const [finished, setFinished] = useState(false);

  const total = stats.total;
  const pending = Math.max(total - migrated, 0);
  const pct = total > 0 ? Math.round((migrated / total) * 100) : 100;

  async function run() {
    setRunning(true);
    setFinished(false);
    setErrors([]);
    let done = migrated;
    const collected: MigrationError[] = [];

    while (true) {
      const res = await migrateMediaBatch(BATCH);
      if ("error" in res) {
        collected.push({ id: "-", filename: "-", error: res.error });
        break;
      }
      done += res.migrated;
      collected.push(...res.errors);
      setMigrated(done);
      setErrors([...collected]);
      if (res.attempted === 0) break; // nothing left → done
      if (res.migrated === 0) break; // batch made no progress (all failed) → stop, don't loop
    }

    setRunning(false);
    setFinished(true);
    router.refresh();
  }

  const allDone = pending === 0 && !running;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Numbers */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold">
          {migrated} <span className="text-muted-foreground">/ {total} صورة على Bunny</span>
        </span>
        <span className={pending > 0 ? "text-amber-600 dark:text-amber-500" : "text-green-600 dark:text-green-500"}>
          {pending > 0 ? `${pending} باقية` : "الكل مُرحّل ✓"}
        </span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${allDone ? "bg-green-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Action */}
      <div className="flex items-center gap-3">
        {allDone ? (
          <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            اكتمل الترحيل
          </span>
        ) : (
          <Button size="sm" className="h-9 gap-1.5" disabled={running} onClick={run}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            {running ? `جارٍ الترحيل… (${migrated}/${total})` : "ابدأ الترحيل"}
          </Button>
        )}
        {finished && !running && (
          <span className="text-xs text-muted-foreground">
            {errors.length > 0 ? `توقف — ${errors.length} فشلت` : "دفعة اكتملت"}
          </span>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            {errors.length} فشلت (تبقى على Cloudinary — أعد المحاولة لاحقاً)
          </p>
          <ul className="max-h-40 space-y-0.5 overflow-auto text-[11px] text-muted-foreground">
            {errors.slice(0, 20).map((e, i) => (
              <li key={`${e.id}-${i}`} className="truncate" title={`${e.filename}: ${e.error}`}>
                {e.filename} — {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
