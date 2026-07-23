"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CharacterCounter } from "@/components/shared/character-counter";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { useToast } from "@/hooks/use-toast";
import { saveImageSeo } from "@/app/(dashboard)/media/actions/save-image-seo";
import { generateImageSeoAi } from "@/app/(dashboard)/media/actions/generate-image-seo-ai";
import type { MediaCheckStatus } from "@modonty/database/lib/seo/media/seo-score";
import type { SeoImageRow } from "../helpers/load-groups";

const CHECK_ICON: Record<MediaCheckStatus, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};
const CHECK_CLS: Record<MediaCheckStatus, string> = {
  good: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-500",
  error: "text-red-600 dark:text-red-400",
};

// Isolate LTR technical tokens (dimensions like 1200×630, comparisons like <50) inside the
// Arabic hint so RTL doesn't visually reverse them (630×1200 / >50).
const TECH_TOKEN = /([<>]=?\s?\d+|\d+(?:[.,×xX:/\-]\d+)+|\d+)/g;
const IS_TECH = /\d/;
function renderHint(hint: string) {
  return hint.split(TECH_TOKEN).map((part, i) =>
    IS_TECH.test(part) ? (
      <bdi key={i} dir="ltr">
        {part}
      </bdi>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface Props {
  image: SeoImageRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save. Callers that hold their own copy of the row (e.g. the
   *  article editor) use this to re-fetch it; when omitted the dialog just refreshes the route. */
  onSaved?: () => void;
}

export function ImageSeoDialog({ image, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [alt, setAlt] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [genAlt, setGenAlt] = useState(false);
  const [genDesc, setGenDesc] = useState(false);

  useEffect(() => {
    if (image) {
      setAlt(image.altText ?? "");
      setDesc(image.description ?? "");
    }
  }, [image]);

  if (!image) return null;

  async function handleGenerateField(field: "altText" | "description") {
    if (!image) return;
    const setBusy = field === "altText" ? setGenAlt : setGenDesc;
    setBusy(true);
    const res = await generateImageSeoAi(image.id, field);
    setBusy(false);
    if (res.success) {
      if (field === "altText") setAlt(res.text);
      else setDesc(res.text);
      toast({ title: "تم التوليد — راجع وعدّل ثم احفظ", variant: "success" });
    } else {
      toast({ title: "فشل التوليد بالذكاء", description: res.error, variant: "destructive" });
    }
  }

  async function handleSave() {
    if (!image) return;
    setSaving(true);
    // Filename is automatic: on save the file is synced to the generated SEO name (server
    // sanitizes + renames only if it actually differs, and skips images embedded in article text).
    const res = await saveImageSeo({
      mediaId: image.id,
      altText: alt.trim() || null,
      description: desc.trim() || null,
      ...(image.autoName ? { filename: image.autoName } : {}),
    });
    setSaving(false);
    if (res.success) {
      toast({ title: "تم حفظ سيو الصورة", variant: "success" });
      onSaved?.();
      router.refresh();
      onOpenChange(false);
    } else {
      toast({ title: "فشل الحفظ", description: res.error, variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            🎨 {image.usedIn}
            <span className="text-xs font-normal text-muted-foreground">· {image.type} · {image.ownerLabel}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Two panes: read the diagnosis (right, in RTL) then fix it (left). On desktop the
            split is horizontal so nothing overflows vertically; on mobile it stacks and the
            dialog itself scrolls. */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Left — read-only info: the diagnosis + the generated name */}
          <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold">تفصيل النتيجة</span>
              <SeoScoreBadge score={image.score} size="sm" />
            </div>
            <ul className="max-h-[42vh] space-y-1.5 overflow-y-auto pe-1">
              {image.checks.map((c) => {
                const Icon = CHECK_ICON[c.status];
                return (
                  <li key={c.key} className="flex items-start gap-2 text-xs">
                    <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${CHECK_CLS[c.status]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{c.label}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {c.earned}/{c.max}
                        </span>
                      </div>
                      {c.hint && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{renderHint(c.hint)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
              النص البديل والوصف تعدّلهما هنا. اسم الملف والأبعاد يُدارَان تلقائياً.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-green-500/40 bg-green-500/[0.06] p-2.5 text-xs text-green-700 dark:text-green-400">
            <span className="opacity-80">اسم الصورة: </span>
            <span className="font-bold" dir="auto">«{image.autoName ?? "—"}»</span>
          </div>
          </div>

          {/* Right — the writer fields. Each field has its own AI button (draft from client
              data — the writer reviews and saves; nothing is written until "حفظ"). */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="alt">
                  Alt Text <span className="text-red-500">*</span> <span className="text-xs text-muted-foreground">(يكتبه الكاتب)</span>
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateField("altText")}
                  disabled={genAlt || saving}
                  className="h-7 gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                >
                  {genAlt ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  توليد
                </Button>
              </div>
              <Textarea
                id="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                rows={2}
                placeholder="وصف دقيق للصورة — يظهر في بحث الصور ويقرؤه قارئ الشاشة"
                className="mt-1 min-h-[3rem]"
              />
              <div className="mt-1">
                <CharacterCounter current={alt.length} min={5} max={125} restrict={false} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="desc">Description</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateField("description")}
                  disabled={genDesc || saving}
                  className="h-7 gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
                >
                  {genDesc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  توليد
                </Button>
              </div>
              <Textarea
                id="desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                placeholder="وصف تفصيلي للصورة (Schema.org description)…"
                className="mt-1 min-h-[3.5rem]"
              />
              <div className="mt-1">
                <CharacterCounter current={desc.length} min={50} max={160} restrict={false} />
              </div>
            </div>

            {/* Filename is automatic — read-only. On save the file is renamed to the SEO name. */}
            <div>
              <Label>
                اسم الملف <span className="text-xs text-muted-foreground">(تلقائي)</span>
              </Label>
              <div className="mt-1 truncate rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground" dir="ltr" title={image.filename ?? undefined}>
                {image.filename ?? "—"}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "جارٍ الحفظ…" : "حفظ سيو الصورة"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
