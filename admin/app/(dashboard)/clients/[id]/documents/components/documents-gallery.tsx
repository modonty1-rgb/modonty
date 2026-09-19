"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, ExternalLink, Trash2, Plus, Loader2, AlertTriangle, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MediaPicker } from "@/components/shared/media-picker";
import {
  addClientDocument, updateClientDocument, deleteClientDocument,
} from "../../../actions/clients-actions/client-documents";

/**
 * **معرضُ وثائق العميل — نراها لأوّل مرّة.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «الصفحة لمّا تكون راوت لوحده حتكون زي الجاليري نقدر نشوف
 * الصور تبعته — إحنا الآن في الحالة هذه ما نقدر نشوف صورة».
 *
 * وهو صحيحٌ حرفيّاً: الوثائقُ كانت روابطَ نصّيّةً مدفونةً في عمودٍ مفردٍ وفي JSON، فلا
 * شاشةَ تعرضها ولا تعدّها. والصورةُ لا تُعرض على مدونتي أصلاً (`client-trust-card.tsx:81`
 * يستعملها شرطاً ولا يرسمها) — أي أنّنا نحتفظ بأوراقٍ لا يراها أحد.
 */

/** الأسماءُ الشائعة — اقتراحٌ يُسرّع، والحقلُ يقبل غيرَها. */
const SUGGESTIONS = ["سجلّ تجاريّ", "ترخيص مهنيّ", "شهادة ضريبيّة", "هويّة المالك", "عقد تأسيس"];

export type DocumentRow = {
  id: string;
  label: string;
  url: string;
  note: string | null;
  expiresAt: string | null;
  source: "CLIENT" | "STAFF";
  createdAt: string;
};

export function DocumentsGallery({
  clientId,
  clientName,
  documents,
}: {
  clientId: string;
  clientName: string;
  documents: DocumentRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, start] = useTransition();
  const [adding, setAdding] = useState(false);

  function refresh() {
    router.refresh();
  }

  return (
    <main dir="rtl" className="mx-auto flex max-w-4xl flex-col gap-4 pb-10">
      <header className="flex items-center gap-2">
        <Link
          href={`/clients/${clientId}/edit`}
          aria-label="رجوع لصفحة العميل"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
        >
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">وثائق — {clientName}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            يرفعها العميلُ من حسابه، ونرفع نحن ما يصلنا منه. لا تُعرض على مدونتي.
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding((v) => !v)} className="gap-1.5">
          {adding ? <X className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
          {adding ? "إلغاء" : "أضف وثيقة"}
        </Button>
      </header>

      {adding && (
        <AddForm
          clientId={clientId}
          onDone={() => {
            setAdding(false);
            refresh();
          }}
        />
      )}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <FileText className="mx-auto size-6 text-muted-foreground/50" aria-hidden />
          <p className="mt-2 text-[13px] font-medium">لا وثائقَ بعد</p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            ارفع ما وصلك منه، أو انتظر أن يرفعها من حسابه.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {documents.map((d) => (
            <DocCard
              key={d.id}
              doc={d}
              busy={busy}
              onDelete={() =>
                start(async () => {
                  const res = await deleteClientDocument(d.id);
                  if (!res.ok) toast({ variant: "destructive", title: "تعذّر الحذف", description: res.error });
                  else {
                    toast({ title: "حُذف الصفّ", description: "الملفُّ باقٍ في مكتبة الوسائط." });
                    refresh();
                  }
                })
              }
              onSave={(v) =>
                start(async () => {
                  const res = await updateClientDocument(d.id, v);
                  if (!res.ok) toast({ variant: "destructive", title: "لم يُحفظ", description: res.error });
                  else refresh();
                })
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

function AddForm({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const { toast } = useToast();
  const [saving, start] = useTransition();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function submit() {
    start(async () => {
      const res = await addClientDocument(clientId, { label, url, expiresAt: expiresAt || null });
      if (!res.ok) {
        toast({ variant: "destructive", title: "لم تُضَف", description: res.error });
        return;
      }
      toast({ title: "أُضيفت الوثيقة" });
      onDone();
    });
  }

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="doc-label" className="text-xs font-medium text-muted-foreground">
            اسم الوثيقة
          </Label>
          <Input
            id="doc-label"
            list="doc-suggestions"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="سجلّ تجاريّ…"
            className="h-8 text-sm"
          />
          {/* اقتراحاتٌ لا قيود: `datalist` يعرض المعروفَ ويقبل المكتوب. */}
          <datalist id="doc-suggestions">
            {SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1">
          <Label htmlFor="doc-exp" className="text-xs font-medium text-muted-foreground">
            تنتهي في <span className="font-normal">— اختياريّ</span>
          </Label>
          <Input id="doc-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>

      {/**
        * بلا `label`: المكوّنُ يُلحق بعنوانه تلميحَ مقاسٍ للغلاف («2400×400 — 6:1»)،
        * وهو مقاسُ صورةِ هيرو لا وثيقةٍ رسميّة. فالعنوانُ مكتوبٌ فوقه هنا.
        */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">الملفّ</Label>
        <MediaPicker
          clientId={clientId}
          value={url}
          onSelect={(m) => setUrl(m.bunnyUrl || m.url)}
          onClear={() => setUrl("")}
        />
      </div>

      <Button onClick={submit} disabled={saving || !label.trim() || !url} size="sm" className="gap-1.5">
        {saving ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
        أضف
      </Button>
    </section>
  );
}

function DocCard({
  doc, busy, onDelete, onSave,
}: {
  doc: DocumentRow;
  busy: boolean;
  onDelete: () => void;
  onSave: (v: { label: string; note: string | null; expiresAt: string | null }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(doc.label);
  const [expiresAt, setExpiresAt] = useState(doc.expiresAt?.slice(0, 10) ?? "");

  const expired = doc.expiresAt ? new Date(doc.expiresAt) < new Date() : false;
  const isImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(doc.url);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      {/* المعاينةُ هي الغرض: نرى الورقةَ لا اسمَها. وما ليس صورةً يُفتح برابطه. */}
      <a href={doc.url} target="_blank" rel="noreferrer" className="block h-36 bg-muted/40">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.label} className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <FileText className="size-6" aria-hidden />
            <span className="text-[11px]">ملفّ — افتحه</span>
          </span>
        )}
      </a>

      <div className="space-y-2 p-3">
        {editing ? (
          <div className="space-y-2">
            <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 text-sm" />
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="h-8 text-sm" />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-[11px]" disabled={busy}
                onClick={() => { onSave({ label, note: doc.note, expiresAt: expiresAt || null }); setEditing(false); }}>
                احفظ
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setEditing(false)}>إلغاء</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h2 className="min-w-0 truncate text-[13px] font-semibold">{doc.label}</h2>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {doc.source === "CLIENT" ? "رفعها العميل" : "رفعناها"}
              </span>
            </div>

            {(expired || doc.note?.includes("خارجيّ")) && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                {expired && <Badge tone="bad"><AlertTriangle className="size-3" aria-hidden /> منتهية</Badge>}
                {doc.note?.includes("خارجيّ") && <Badge tone="wait">رابطٌ خارجيّ</Badge>}
              </div>
            )}

            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(true)}
                className="h-7 px-2" aria-label="تعديل">
                <Pencil className="size-3.5" aria-hidden />
              </Button>
              <a href={doc.url} target="_blank" rel="noreferrer"
                className="inline-flex h-7 items-center rounded-md px-2 text-muted-foreground hover:bg-accent" aria-label="فتح">
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
              <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete}
                className="ms-auto h-7 px-2 text-destructive hover:bg-destructive/10" aria-label="حذف">
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function Badge({ tone, children }: { tone: "wait" | "bad"; children: React.ReactNode }) {
  const cls =
    tone === "bad"
      ? "border-red-500/30 bg-red-500/[0.08] text-red-700 dark:text-red-400"
      : "border-amber-500/30 bg-amber-500/[0.08] text-amber-700 dark:text-amber-400";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-medium ${cls}`}>{children}</span>;
}
