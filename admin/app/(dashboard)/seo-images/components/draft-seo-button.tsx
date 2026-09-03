"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { draftImageSeoBatch } from "@/lib/seo-images/draft-image-seo-batch";
import { getDraftTargets } from "@/lib/seo-images/get-draft-targets";

/** Matches MAX_PER_CALL on the action. Small on purpose: each slice is one round trip,
 *  and the bar has to move often enough to read as progress rather than a frozen page. */
const CHUNK = 5;

interface Props {
  groupKey: string;
  groupName: string;
  /** How many images have no alt text — the number the button promises to write. */
  count: number;
}

type Phase = "idle" | "confirm" | "running" | "done";

export function DraftSeoButton({ groupKey, groupName, count }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(count);
  const [written, setWritten] = useState(0);
  const [failed, setFailed] = useState<{ id: string; error: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setPhase("running");
    setDone(0);
    setWritten(0);
    setFailed([]);
    setError(null);

    const targets = await getDraftTargets(groupKey);
    if (!targets.success) {
      setError(targets.error);
      setPhase("confirm");
      return;
    }
    const ids = targets.ids;
    setTotal(ids.length);
    if (ids.length === 0) {
      setPhase("done");
      return;
    }

    // Sequential, not Promise.all: the slices exist to pace the model and to let the
    // bar move. Firing them together would be one burst and a bar that jumps 0 → 100.
    for (let i = 0; i < ids.length; i += CHUNK) {
      const slice = ids.slice(i, i + CHUNK);
      const res = await draftImageSeoBatch(slice);
      if (!res.success) {
        setError(res.error);
        break;
      }
      setWritten((w) => w + res.result.written);
      setFailed((f) => [...f, ...res.result.failed]);
      setDone(Math.min(i + slice.length, ids.length));
    }

    setPhase("done");
    // Refresh so the row's state (and its badge counts) reflect what was just written.
    router.refresh();
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <Button size="sm" className="h-7 gap-1.5" onClick={() => setPhase("confirm")}>
        <span aria-hidden className="text-sm leading-none">🤖</span>
        اكتب وصف {count} صورة
      </Button>

      <Dialog
        open={phase !== "idle"}
        // Not closeable mid-run: half a client drafted with the dialog gone leaves no
        // report of what was written and what failed.
        onOpenChange={(open) => {
          if (!open && phase !== "running") setPhase("idle");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-start">
              {phase === "done" ? "تمّت الكتابة" : `اكتب الوصف بالذكاء — ${groupName}`}
            </DialogTitle>
            <DialogDescription className="text-start">
              {phase === "done" ? "راجع النصوص من صفحة العميل قبل التسمية." : "المرحلة الأولى من اثنتين"}
            </DialogDescription>
          </DialogHeader>

          {phase === "confirm" && (
            <div className="space-y-3 text-sm">
              <p>
                الذكاء هيكتب <b className="tabular-nums">{count}</b> نصّاً بديلاً ووصفاً، من نشاط العميل —
                تخصّصه ومدينته وخدماته، مش من تحليل الصورة.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>✅ ولا ملف هيتحرّك على بني — كتابة في القاعدة بس</li>
                <li>✅ الصورة اللي عندها وصف مكتوب مش هتتلمس</li>
                <li>⚠️ كل نصّ هيتعلّم عليه 🤖 لحد ما تعيد صياغته</li>
              </ul>
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <b className="text-foreground">المرحلة الثانية:</b> تحويل النصّ لاسم ملف — بتحرّك ملفات على
                بني، وبتتعمل بعد مراجعتك.
              </p>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}

          {phase === "running" && (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs tabular-nums text-muted-foreground">
                {done} من {total}
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-2 text-sm">
              <p>
                <b className="tabular-nums text-emerald-600 dark:text-emerald-400">{written}</b> صورة اتكتبت.
              </p>
              {failed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    {failed.length} فشلت — السبب لكل واحدة:
                  </p>
                  <ul className="max-h-28 space-y-0.5 overflow-y-auto text-[11px] text-muted-foreground">
                    {failed.slice(0, 8).map((f) => (
                      <li key={f.id}>• {f.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-start">
            {phase === "confirm" && (
              <>
                <Button onClick={run}>ابدأ</Button>
                <Button variant="outline" onClick={() => setPhase("idle")}>
                  إلغاء
                </Button>
              </>
            )}
            {phase === "done" && <Button onClick={() => setPhase("idle")}>تمام</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
