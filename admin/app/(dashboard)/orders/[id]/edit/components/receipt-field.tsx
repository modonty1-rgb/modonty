"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Undo2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { shrinkImage } from "../helpers/shrink-image";

/**
 * سند الإيصال داخل فورم «تعديل الطلب» — يُحفظ مع «حفظ التعديل» لا لحظة اختياره (خالد ٢٨ سبتمبر
 * ٢٠٢٦: «من ضمن حفظ التعديلات… خليك محترف»). يُختار فيُعاين، و«إلغاء» يتجاهله كأيّ حقلٍ آخر.
 *
 * الصورة المصغّرة تُوضع في خانة ملفٍّ مخفيّة اسمها `receipt` داخل الفورم (عبر `DataTransfer`)،
 * فيرسلها الفورم نفسه مع بقيّة الحقول.
 */
export function ReceiptField({
  orderId,
  hasReceipt,
  version,
  onChange,
}: {
  orderId: string;
  hasReceipt: boolean;
  version: number;
  onChange: () => void;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const payload = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const take = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("السند صورة فقط");
      return;
    }
    setBusy(true);
    try {
      const small = await shrinkImage(file);
      const dt = new DataTransfer();
      dt.items.add(small);
      if (payload.current) payload.current.files = dt.files;
      setPreview(URL.createObjectURL(small));
      onChange();
    } catch {
      setError("تعذّرت قراءة الصورة — جرّب صورة ثانية");
    } finally {
      setBusy(false);
    }
  };

  const undo = () => {
    if (payload.current) payload.current.value = "";
    setPreview(null);
  };

  const shown = preview ?? (hasReceipt ? `/orders/${orderId}/receipt?v=${version}` : null);

  return (
    <div className="space-y-2">
      <input ref={payload} type="file" name="receipt" hidden tabIndex={-1} aria-hidden />
      <input
        ref={picker}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          // Dirty is set by `take` once the picture is ready, not by the bare pick.
          e.stopPropagation();
          const f = e.target.files?.[0];
          e.target.value = "";
          void take(f);
        }}
      />

      {shown ? (
        <div className="relative overflow-hidden rounded-md border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element -- private route or a local blob; next/image fits neither */}
          <img src={shown} alt="سند الإيصال" className="mx-auto h-44 w-full object-contain" />
          {preview ? (
            <span className="absolute start-2 top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
              صورة جديدة — تُحفظ مع التعديل
            </span>
          ) : null}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin" />
            </span>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={busy}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void take(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-center transition",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
          )}
        >
          {busy ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden />
          )}
          <span className="text-sm font-medium">اختيار صورة السند</span>
          <span className="text-[11px] text-muted-foreground">اضغط أو اسحب الصورة هنا · تُحفظ مع «حفظ التعديل»</span>
        </button>
      )}

      {shown ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            تغيير الصورة
          </button>
          {preview ? (
            <button
              type="button"
              onClick={undo}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Undo2 className="size-3.5" aria-hidden />
              تراجع عن الصورة الجديدة
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
