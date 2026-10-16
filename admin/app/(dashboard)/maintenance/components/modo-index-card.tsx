"use client";

import { useRef, useState } from "react";
import { Bot, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { runModoIndexStep } from "../actions/run-modo-index-step";

const N = new Intl.NumberFormat("ar-EG");
/** The vendor's trial limit is per minute — wait one full window, then resume. */
const RATE_LIMIT_WAIT_S = 60;

/**
 * **فهرسة مودو** (خالد ١٦ أكتوبر ٢٠٢٦: «في الصيانة الفهرسة اللي ما تفهرست… شغّلها عشان أشوف
 * البروجرس») — كم مقالاً منشوراً لا يراه مودو، وزرٌّ يفهرسها خطوةً خطوة بشريط تقدّم.
 * المقال يُفهرس عادةً لحظة نشره؛ هذا لما فات، وللفهرسة الأولى.
 */
export function ModoIndexCard({ published, due: initialDue, error }: { published: number; due: number; error?: string }) {
  const [due, setDue] = useState(initialDue);
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [message, setMessage] = useState<string | null>(error ?? null);
  const stop = useRef(false);
  const total = done + due;

  async function run() {
    setRunning(true);
    setMessage(null);
    stop.current = false;
    let remaining = due;
    while (remaining > 0 && !stop.current) {
      const res = await runModoIndexStep();
      if (!res.ok) {
        setMessage(res.error);
        break;
      }
      setDone((d) => d + (res.indexed ?? 0));
      remaining = res.remaining ?? 0;
      setDue(remaining);
      if (res.rateLimited) {
        for (let s = RATE_LIMIT_WAIT_S; s > 0 && !stop.current; s--) {
          setWaiting(s);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setWaiting(0);
      }
    }
    setRunning(false);
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">فهرسة مودو</h3>
          <p className="text-xs text-muted-foreground">
            {N.format(published)} مقالاً منشوراً ·{" "}
            {due === 0 ? "كلها مفهرسة — مودو يقرأها كلها" : `${N.format(due)} لا يراها مودو بعد`}
          </p>
        </div>
        {due === 0 && !running ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : running ? (
          <Button size="sm" variant="outline" onClick={() => (stop.current = true)}>
            إيقاف
          </Button>
        ) : (
          <Button size="sm" onClick={run}>
            فهرس الآن
          </Button>
        )}
      </div>

      {total > 0 && (running || done > 0) ? (
        <div className="space-y-1.5">
          <Progress value={total ? (done / total) * 100 : 0} />
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground tabular-nums">
            {running ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {N.format(done)} من {N.format(total)}
            {waiting > 0 ? ` · حدّ الدقيقة عند مزوّد الفهرسة — يكمل بعد ${N.format(waiting)} ث` : ""}
          </p>
        </div>
      ) : null}

      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}
