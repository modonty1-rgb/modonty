"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, FileText, AlertTriangle, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressToWebP } from "@/lib/compress-image";
import { addMyDocument, deleteMyDocument } from "../actions/document-actions";

/**
 * **وثائقي — يرفعها صاحبُها.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «العميل يرفع من الكونسول من عنده».
 *
 * الرفعُ يمرّ بمسار الخادم `/api/upload-bunny` كما تفعل رخصةُ YMYL — فكلمةُ المخزن لا
 * تصل المتصفّح، ومعرّفُ العميل من الجلسة لا من النموذج.
 *
 * ولا ختمَ فحصٍ ولا حالة (خالد: «ليه تعقيد… احنا ما بنفحص، احنا بنرفع الداتا اللي
 * موجودة»): ترفع الورقةَ وتسمّيها، ونراها نحن في شاشتنا.
 */
const SUGGESTIONS = ["سجلّ تجاريّ", "ترخيص مهنيّ", "شهادة ضريبيّة", "هويّة المالك", "عقد تأسيس"];

export type MyDocument = {
  id: string;
  label: string;
  url: string;
  expiresAt: string | null;
  source: "CLIENT" | "STAFF";
};

export function MyDocuments({ documents }: { documents: MyDocument[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-bold">وثائقك</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            سجلُّك التجاريّ أو ترخيصك أو ما يثبت نشاطك. محفوظةٌ عندنا ولا تظهر على صفحتك العامّة.
          </p>
        </div>
        {/* «إلغاء» شبحيٌّ لا ممتلئ: كان أزرقَ بارزاً فيسحب العينَ عن الفعل الذي فُتحت
            البطاقةُ من أجله. الامتلاءُ للفعل الرئيسيّ وحده. */}
        <Button
          size="sm"
          variant={adding ? "ghost" : "default"}
          onClick={() => setAdding((v) => !v)}
          className="shrink-0 gap-1.5"
        >
          {adding ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {adding ? "إلغاء" : "أضف وثيقة"}
        </Button>
      </div>

      {adding && <AddForm onDone={() => { setAdding(false); router.refresh(); }} />}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <FileText className="mx-auto size-6 text-muted-foreground/50" />
          <p className="mt-2 text-[13px] font-medium">لا وثائقَ بعد</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((d) => (
            <DocCard
              key={d.id}
              doc={d}
              busy={busy}
              onDelete={() =>
                start(async () => {
                  const res = await deleteMyDocument(d.id);
                  if (!res.ok) toast.error(res.error);
                  else { toast.success("حُذفت"); router.refresh(); }
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, start] = useTransition();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("الملف لازم يكون صورة");
    if (file.size > 20 * 1024 * 1024) return toast.error("حجم الصورة كبير — الحدّ الأقصى 20 ميجا");

    setUploading(true);
    try {
      const compressed = await compressToWebP(file);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("folder", "documents");
      const res = await fetch("/api/upload-bunny", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) return toast.error(json.error || "فشل الرفع");
      setUrl(json.url);
      toast.success("رُفعت الصورة");
    } catch {
      toast.error("خطأ في الرفع");
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    start(async () => {
      const res = await addMyDocument({ label, url, expiresAt: expiresAt || null });
      // لا `return toast.error(...)`: التوست يرجع مُعرّفاً، فتصير الدالّة
      // `Promise<string | number>` ولا يقبلها `startTransition` (TS2345).
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("أُضيفت");
      onDone();
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      {/**
        * **ترتيبٌ رأسيٌّ: اسمٌ ← ملفٌّ ← تاريخٌ ← أضف.**
        *
        * كان الزرّان («ارفع الصورة» و«أضف») متلاصقين في صفٍّ واحد، فيُقرآن بديلين لا
        * خطوتين. وهما متتابعان: لا يُضاف شيءٌ قبل أن يُرفع.
        */}
      <div className="space-y-1.5">
        <Label htmlFor="d-label" className="text-sm">اسم الوثيقة</Label>
        <Input id="d-label" list="d-sugg" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="سجلّ تجاريّ…" />
        <datalist id="d-sugg">{SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {/**
        * منطقةُ إسقاطٍ بعرض البطاقة لا زرٌّ صغير: الرفعُ هو الفعلُ الأثقل هنا، ومساحتُه
        * تقول ذلك. وتقبل السحبَ كما تقبل الضغط.
        */}
      {url ? (
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-20 rounded-lg border bg-background object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">الصورة جاهزة</p>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">اضغط «أضف» لحفظ الوثيقة.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setUrl("")}>غيّرها</Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          disabled={uploading}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-input hover:border-primary/40 hover:bg-muted/30"
          } disabled:opacity-60`}
        >
          {uploading ? <Loader2 className="size-5 animate-spin text-primary" /> : <Upload className="size-5 text-muted-foreground" />}
          <span className="text-[13px] font-medium">{uploading ? "جارٍ الرفع…" : "اسحب الصورة هنا أو اضغط للاختيار"}</span>
          <span className="text-[11px] text-muted-foreground">صورةٌ حتّى 20 ميجا</span>
        </button>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="d-exp" className="text-sm">
          تنتهي في <span className="font-normal text-muted-foreground">— اختياريّ</span>
        </Label>
        {/* `dir="ltr"`: حقلُ التاريخ يرسم `mm/dd/yyyy` مقلوباً داخل واجهةٍ عربيّة. */}
        <Input id="d-exp" type="date" dir="ltr" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="text-start sm:max-w-56" />
        <p className="text-[11px] text-muted-foreground">اتركه فارغاً إن كانت الوثيقة بلا انتهاء.</p>
      </div>

      {/* الفعلُ الرئيسيُّ في سطره، بعد أن اكتملت خطواتُه. */}
      <Button onClick={submit} disabled={saving || uploading || !label.trim() || !url} className="w-full gap-1.5 sm:w-auto">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {saving ? "جارٍ الحفظ…" : "أضف الوثيقة"}
      </Button>
    </section>
  );
}

function DocCard({ doc, busy, onDelete }: { doc: MyDocument; busy: boolean; onDelete: () => void }) {
  const expired = doc.expiresAt ? new Date(doc.expiresAt) < new Date() : false;
  const isImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(doc.url);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      <a href={doc.url} target="_blank" rel="noreferrer" className="block h-32 bg-muted/40">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={doc.label} className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground"><FileText className="size-6" /></span>
        )}
      </a>
      <div className="space-y-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate text-[13px] font-semibold">{doc.label}</h2>
          {/* ما رفعناه نحن لا يحذفه هو: ورقةٌ وصلتنا منه بطريقٍ آخر، وحذفُها قرارُنا. */}
          {doc.source === "CLIENT" ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete}
              className="size-7 shrink-0 p-0 text-destructive hover:bg-destructive/10" aria-label="حذف">
              <Trash2 className="size-3.5" />
            </Button>
          ) : (
            <span className="shrink-0 text-[10px] text-muted-foreground">أضافها الفريق</span>
          )}
        </div>
        {expired && (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/[0.08] px-1.5 py-0.5 text-[10.5px] font-medium text-red-700 dark:text-red-400">
            <AlertTriangle className="size-3" /> منتهية
          </span>
        )}
      </div>
    </article>
  );
}
