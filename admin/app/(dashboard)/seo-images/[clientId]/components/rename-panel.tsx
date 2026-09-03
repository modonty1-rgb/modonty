"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { renameImageBatch } from "@/lib/seo-images/rename-image-batch";
import type { SeoImageRow } from "../../helpers/load-groups";

/** Matches MAX_PER_CALL on the action; each slice is one round trip and one bar step. */
const CHUNK = 5;

/**
 * Stage two, in the screen the team already works in.
 *
 * It executes nothing the eye has not passed: an image still carrying the 🤖 mark is
 * excluded from the count and from the run, because its name would come from a sentence
 * nobody has read. The gate is the mark itself, not a checkbox — a checkbox pre-ticked
 * across twenty rows is bulk approval wearing the costume of a review.
 */
export function RenamePanel({
  images,
  onEdit,
}: {
  images: SeoImageRow[];
  /** Opens the existing per-image dialog — the one place a text is edited. */
  onEdit: (id: string) => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [done, setDone] = useState(0);
  const [renamed, setRenamed] = useState(0);
  const [failed, setFailed] = useState<{ id: string; error: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const eligible = useMemo(
    () => images.filter((i) => i.rename.status === "ready" && i.aiDraftedAt === null),
    [images],
  );
  const blocked = useMemo(() => images.filter((i) => i.aiDraftedAt !== null), [images]);

  async function run() {
    setPhase("running");
    setDone(0);
    setRenamed(0);
    setFailed([]);
    setError(null);

    const ids = eligible.map((i) => i.id);
    for (let i = 0; i < ids.length; i += CHUNK) {
      const slice = ids.slice(i, i + CHUNK);
      const res = await renameImageBatch(slice);
      if (!res.success) {
        setError(res.error);
        break;
      }
      setRenamed((r) => r + res.result.renamed);
      setFailed((f) => [...f, ...res.result.failed]);
      setDone(Math.min(i + slice.length, ids.length));
    }
    setPhase("done");
    router.refresh();
  }

  if (eligible.length === 0 && blocked.length === 0) return null;

  const pct = eligible.length > 0 ? Math.round((done / eligible.length) * 100) : 0;

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5 text-xs">
          <p className="font-bold">تسمية الملفات</p>
          <p className="text-muted-foreground">
            الاسم يُشتقّ من النصّ البديل حسابياً — راجع النصّ، والاسم يتبعه.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {blocked.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded border border-violet-500/40 px-2 py-1 text-[11px] font-medium text-violet-600 dark:text-violet-400">
              <span aria-hidden>🤖</span>
              {blocked.length} مسوّدة مقفولة
            </span>
          )}
          <Button
            size="sm"
            className="h-8 gap-1.5"
            disabled={eligible.length === 0 || phase === "running"}
            onClick={run}
          >
            <Tag className="h-3.5 w-3.5" aria-hidden />
            سمّي {eligible.length} صورة
          </Button>
        </div>
      </div>

      {blocked.length > 0 && (
        <p className="text-[11px] text-muted-foreground">
          المسوّدات المقفولة مستثناة: افتح الصورة، أعد صياغة نصّها، وعندها تدخل الطابور.
        </p>
      )}

      {/* THE NAMES THEMSELVES, before anything runs. A count alone («سمّي 25 صورة») asks
          for consent to a change nobody has seen — and a rename is a copy then a delete,
          so the old URL is gone. Every row shows what dies and what replaces it, and the
          alt it was derived from, because that is the field you fix when a name is wrong. */}
      {(eligible.length > 0 || blocked.length > 0) && (
        <div className="max-h-72 overflow-y-auto rounded-md border">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-muted/60 backdrop-blur">
              <tr className="text-start">
                <th className="px-2.5 py-1.5 text-start font-medium text-muted-foreground">
                  النصّ البديل <span className="font-normal">— المصدر</span>
                </th>
                <th className="px-2.5 py-1.5 text-start font-medium text-muted-foreground">
                  اسم الملف <span className="font-normal">— الحالي ← الجديد</span>
                </th>
                <th className="px-2.5 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {[...eligible, ...blocked].map((img) => {
                const locked = img.aiDraftedAt !== null;
                // A one-word alt passes every gate and still names the file «0» — seen on
                // this very client, whose alt text is the digit ٥. The score marks it a
                // warning and lets it through; here it must be loud, because the name it
                // produces is what lands in the URL.
                const thin = !locked && (img.rename.newBase ?? "").length < 10;
                return (
                  <tr key={img.id} className="border-t align-top odd:bg-muted/20">
                    <td className="max-w-[340px] px-2.5 py-1.5">
                      <div className="flex items-start gap-1.5">
                        {locked && (
                          <span aria-hidden title="مسوّدة آلة" className="shrink-0">
                            🤖
                          </span>
                        )}
                        <span className="line-clamp-2 leading-relaxed" dir="auto">
                          {img.altText || "—"}
                        </span>
                      </div>
                    </td>
                    {/* Each line names itself. Two file names stacked with nothing but a
                        strike-through to tell them apart reads as one wrapped string — and
                        the reader has to guess which one is about to be written. */}
                    <td className="max-w-[340px] px-2.5 py-1.5" dir="auto">
                      <div className="flex items-baseline gap-1.5">
                        <span className="shrink-0 text-[9px] text-muted-foreground/70">الحالي</span>
                        <span className="truncate text-muted-foreground line-through" title={img.filename ?? ""}>
                          {img.filename || "—"}
                        </span>
                      </div>
                      {locked ? (
                        <div className="flex items-baseline gap-1.5 text-violet-600 dark:text-violet-400">
                          <span className="shrink-0 text-[9px] opacity-70">الجديد</span>
                          <span>🔒 مقفول — راجع النصّ أولاً</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`shrink-0 text-[9px] ${thin ? "text-amber-600/80" : "text-green-700/70 dark:text-green-400/70"}`}
                          >
                            الجديد
                          </span>
                          <span
                            className={`truncate font-bold ${thin ? "text-amber-600 dark:text-amber-500" : "text-green-700 dark:text-green-400"}`}
                            title={img.rename.newBase ?? ""}
                          >
                            {img.rename.newBase}
                            {thin && <span className="ms-1.5 font-normal">⚠ اسم قصير — وسّع النصّ</span>}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5 text-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => onEdit(img.id)}
                      >
                        عدّل
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {phase === "running" && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {done} من {eligible.length}
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-1 text-xs">
          <p>
            <b className="tabular-nums text-emerald-600 dark:text-emerald-400">{renamed}</b> صورة اتسمّت.
          </p>
          {failed.length > 0 && (
            <ul className="max-h-24 space-y-0.5 overflow-y-auto text-[11px] text-amber-600 dark:text-amber-500">
              {failed.slice(0, 6).map((f) => (
                <li key={f.id}>• {f.error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
