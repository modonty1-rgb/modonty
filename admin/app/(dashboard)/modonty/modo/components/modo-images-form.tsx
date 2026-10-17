"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MediaImageField } from "@/components/shared/media-image-field";
import { MODO_POSES, type ModoImages, type ModoPose } from "@modonty/shared/lib/modo-images";
import { saveModoImages } from "../actions/save-modo-images";

interface Props {
  initial: ModoImages;
  /** Modonty Core: Modo's pictures are the core client's own media — the picker is locked to that library. */
  coreClientId: string | null;
}

/**
 * صور مودو — وضعية لكل حالة. الموقع (الأزرار + الشات) وتطبيقا الجوال يقرؤون من هنا فقط.
 * الوضعية الفاضية تأخذ صورة الأفاتار تلقائياً، فلا يظهر فراغ.
 */
export function ModoImagesForm({ initial, coreClientId }: Props) {
  const { toast } = useToast();
  const [images, setImages] = useState<ModoImages>(initial);
  const [saved, setSaved] = useState<ModoImages>(initial);
  const [pending, start] = useTransition();
  const dirty = MODO_POSES.some((p) => (images[p.key] ?? "") !== (saved[p.key] ?? ""));
  const filled = MODO_POSES.filter((p) => images[p.key]).length;

  const set = (key: ModoPose, url: string) => setImages((prev) => ({ ...prev, [key]: url }));

  function save() {
    start(async () => {
      const r = await saveModoImages(images);
      if (!r.ok) {
        toast({ title: "ما انحفظت", description: r.error, variant: "destructive" });
        return;
      }
      setSaved(images);
      toast({ title: "انحفظت صور مودو", description: "تظهر في الموقع والتطبيقات خلال دقيقة.", variant: "success" });
    });
  }

  return (
    <section className="mb-6 rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">صور مودو</h2>
          <p className="text-xs text-muted-foreground">
            من مكتبة «مدونتي» فقط — {filled} من {MODO_POSES.length} وضعية. الفاضية تأخذ صورة الأفاتار.
          </p>
        </div>
        <Button size="sm" onClick={save} disabled={!dirty || pending}>
          {pending && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
          حفظ
        </Button>
      </div>
      {!coreClientId && (
        <p className="mb-3 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700">
          العميل الأساسي «مدونتي» غير مضبوط — اضبطه أولاً ليُفتح اختيار الصور من مكتبته.
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODO_POSES.map((p) => (
          <div key={p.key} className="space-y-1">
            <MediaImageField
              label={p.label}
              imageUrl={images[p.key] ?? ""}
              altText={`مودو — ${p.label}`}
              onImageChange={(url) => set(p.key, url)}
              onRemove={() => set(p.key, "")}
              clientId={coreClientId}
              lockClient
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{p.use}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
