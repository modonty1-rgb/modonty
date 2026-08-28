"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, Database, FileCode2, RotateCcw, Variable } from "lucide-react";
import { saveAiPrompt, resetAiPromptToCode, type PromptRow } from "../actions/modo-prompt-actions";

/**
 * بطاقة برومبت واحد.
 *
 * أهمّ ما فيها ليس مربّع النصّ — هو **وسم المصدر**: «من القاعدة» أو «من الكود».
 * بدونه تعدّل وتحفظ وتظنّ التغيير وصل، بينما البرومبت معطَّل ويقرأ نصّ الكود. وسم
 * المصدر هو ما يحوّل الاحتياط من غطاءٍ صامت إلى شبكة أمانٍ ظاهرة.
 */
export function PromptCard({ prompt }: { prompt: PromptRow }) {
  const [body, setBody] = useState(prompt.body);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = body !== prompt.body;
  const usedVars = new Set([...body.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((m) => m[1]));

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setMsg(null);
      const r = await fn();
      setMsg(r.ok ? { ok: true, text: "حُفظ. مودو صار يقرأ النصّ الجديد." } : { ok: false, text: r.error ?? "تعذّر الحفظ." });
    });

  return (
    <section className="rounded-xl border bg-card p-4">
      <header className="mb-2 flex flex-wrap items-center gap-2">
        {/* `dir="ltr"` لأن المفتاح لاتيني داخل تدفّق عربي — بدونه انقصّ أوّل حرف منه
            («odo.identity» بدل «modo.identity»)، مقيساً حيّاً ٢٨ أغسطس. */}
        <code dir="ltr" className="inline-block rounded bg-muted px-2 py-0.5 text-xs font-bold text-primary">
          {prompt.key}
        </code>
        <h2 className="text-sm font-semibold">{prompt.title}</h2>
        <Badge variant="outline" className="text-[11px]">{prompt.provider}</Badge>
        {prompt.source === "db" ? (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-600">
            <Database className="h-3 w-3" /> من القاعدة
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-yellow-500/30 bg-yellow-500/10 text-[11px] text-yellow-600">
            <FileCode2 className="h-3 w-3" /> من الكود — لم يُحفظ بعد
          </Badge>
        )}
      </header>

      <p className="mb-1 text-xs text-muted-foreground">{prompt.surface}</p>

      {prompt.requiredVars.length > 0 && (
        <p className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
          <Variable className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">متغيّرات إلزامية:</span>
          {prompt.requiredVars.map((v) => (
            <code
              key={v}
              className={`rounded px-1.5 py-0.5 text-[11px] ${
                usedVars.has(v) ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600 line-through"
              }`}
            >{`{${v}}`}</code>
          ))}
        </p>
      )}

      <Textarea
        dir="rtl"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={Math.min(22, Math.max(8, body.split("\n").length + 1))}
        className="font-mono text-[13px] leading-7"
        spellCheck={false}
      />

      <p className="mt-2 flex items-start gap-1.5 text-xs text-yellow-600">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span><b>لو غاب:</b> {prompt.onEmpty}</span>
      </p>

      <footer className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!dirty || pending} onClick={() => run(() => saveAiPrompt(prompt.key, body))}>
          {pending ? "…" : "حفظ"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending || body === prompt.codeBody}
          onClick={() => run(() => resetAiPromptToCode(prompt.key))}
        >
          <RotateCcw className="me-1 h-3.5 w-3.5" /> ارجع لنصّ الكود
        </Button>
        {prompt.updatedAt && (
          <span className="text-[11px] text-muted-foreground">
            آخر تعديل: {new Date(prompt.updatedAt).toLocaleString("ar-SA")}
          </span>
        )}
        {msg && (
          <span className={`flex items-center gap-1 text-xs ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>
            {msg.ok ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {msg.text}
          </span>
        )}
      </footer>
    </section>
  );
}
