"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";

import { saveAlternateLanguages } from "../../actions/save-alternate-languages";

/**
 * The hreflang market list, editable.
 *
 * This column drives `alternates.languages` on every page modonty serves, and it had no
 * screen: it was seeded by a maintenance button carrying nine locales written into the code,
 * so adding a market meant a deploy. Now it is data, like everything else that reaches Google.
 *
 * Read-only elsewhere on this page is deliberate — the other rows are thresholds a maintenance
 * job seeds. This one is a business decision (which markets we claim), so it is the one that
 * gets inputs.
 */

/** Same rule the server enforces — see `save-alternate-languages.ts` for Google's wording. */
const LOCALE = /^(x-default|[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|\d{3}))?)$/;

/** The markets modonty writes for. Offered as one click each, not typed from memory. */
const SUGGESTIONS = [
  "ar-SA",
  "ar-EG",
  "ar-AE",
  "ar-KW",
  "ar-QA",
  "ar-BH",
  "ar-OM",
  "ar-JO",
  "ar-IQ",
  "ar",
  "x-default",
] as const;

function readLocales(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Array<{ hreflang?: unknown }>)
    .map((entry) => (typeof entry?.hreflang === "string" ? entry.hreflang.trim() : ""))
    .filter(Boolean);
}

export function HreflangLocalesEditor({ initial }: { initial: unknown }) {
  const { toast } = useToast();
  const [locales, setLocales] = useState<string[]>(() => readLocales(initial));
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string[]>(() => readLocales(initial));
  const [isSaving, startSaving] = useTransition();

  const dirty =
    locales.length !== saved.length || locales.some((l, i) => l !== saved[i]);

  function add(value: string) {
    const tag = value.trim();
    if (!tag) return;
    if (!LOCALE.test(tag)) {
      toast({
        title: "رمز غير صالح",
        description: `«${tag}» مو على الصيغة — المطلوب ar أو ar-SA أو x-default. جوجل تتجاهل الوسم كله لو الرمز غلط.`,
        variant: "destructive",
      });
      return;
    }
    if (locales.includes(tag)) {
      toast({ title: "موجود أصلاً", description: `${tag} في القائمة.` });
      return;
    }
    setLocales((prev) => [...prev, tag]);
    setDraft("");
  }

  function remove(tag: string) {
    setLocales((prev) => prev.filter((l) => l !== tag));
  }

  function save() {
    startSaving(async () => {
      const result = await saveAlternateLanguages(locales);
      if (result.success) {
        const next = locales.includes("x-default") ? locales : [...locales, "x-default"];
        setLocales(next);
        setSaved(next);
        toast({
          title: messages.success.updated,
          description: `${result.count} لغة محفوظة. الصفحات المخزَّنة تحمل نسخة قديمة — شغّل «Full Rebuild» في صفحة SEO عشان توصل كل صفحة.`,
          variant: "success",
        });
      } else {
        toast({
          title: messages.error.operation_failed,
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }

  const unused = SUGGESTIONS.filter((s) => !locales.includes(s));

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        كل صفحة على مدونتي تبني وسوم <code className="font-mono">hreflang</code> من هذي القائمة،
        وتوجّه كل لغة إلى رابط الصفحة نفسها — نفس المحتوى العربي يخدم كل هذي الأسواق. القاعدة عند
        جوجل: كل نسخة تذكر نفسها وتذكر البقية.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {locales.length === 0 && (
          <span className="text-xs text-muted-foreground">
            القائمة فاضية — الصفحات بتشحن <code className="font-mono">x-default</code> وحده.
          </span>
        )}
        {locales.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md border bg-muted/30 py-1 pe-1 ps-2 font-mono text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              disabled={isSaving}
              aria-label={`احذف ${tag}`}
              className="grid h-4 w-4 place-items-center rounded hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder="ar-SA"
          disabled={isSaving}
          className="h-8 w-32 font-mono text-xs"
        />
        <Button size="sm" variant="outline" className="h-8" disabled={isSaving || !draft.trim()} onClick={() => add(draft)}>
          <Plus className="me-1 h-3.5 w-3.5" aria-hidden="true" />
          أضف
        </Button>

        {unused.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-muted-foreground">مقترحة:</span>
            {unused.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => add(tag)}
                disabled={isSaving}
                className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-solid hover:text-foreground disabled:opacity-40"
              >
                + {tag}
              </button>
            ))}
          </div>
        )}

        <Button size="sm" className="ms-auto h-8" disabled={isSaving || !dirty} onClick={save}>
          {isSaving ? (
            <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="me-1 h-3.5 w-3.5" aria-hidden="true" />
          )}
          احفظ
        </Button>
      </div>
    </div>
  );
}
