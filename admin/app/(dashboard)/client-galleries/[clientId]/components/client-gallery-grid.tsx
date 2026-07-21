"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Trash2, Loader2, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatBytes } from "@modonty/database/lib/utils";
import {
  addClientGalleryImage,
  deleteClientGalleryImage,
} from "../../actions/gallery-mutations";
import type { GalleryImageRow } from "../../helpers/load-galleries";

interface Props {
  clientId: string;
  clientName: string;
  images: GalleryImageRow[];
}

// Uploads one file to Cloudinary (unsigned preset — same pattern as the media upload zone),
// returns the stored-image fields. Throws on any failure.
async function uploadToCloudinary(file: File, clientId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) throw new Error("إعدادات Cloudinary غير مضبوطة");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("asset_folder", `clients/${clientId}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("فشل رفع الصورة إلى Cloudinary");
  const r = await res.json();
  return {
    url: (r.secure_url || r.url) as string,
    publicId: (r.public_id as string) ?? null,
    filename: file.name,
    mimeType: file.type || (r.format ? `image/${r.format}` : "image/webp"),
    width: (r.width as number) ?? null,
    height: (r.height as number) ?? null,
    fileSize: (r.bytes as number) ?? file.size ?? null,
  };
}

/** "image/webp" → "WEBP", "image/jpeg" → "JPG", … */
function imgFormat(mime: string): string {
  const sub = (mime.split("/")[1] || "img").toLowerCase();
  if (sub === "jpeg") return "JPG";
  if (sub === "svg+xml") return "SVG";
  return sub.toUpperCase();
}

export function ClientGalleryGrid({ clientId, clientName, images }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GalleryImageRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setBusy(true);
    let ok = 0;
    for (const file of files) {
      try {
        const uploaded = await uploadToCloudinary(file, clientId);
        const res = await addClientGalleryImage(clientId, uploaded);
        if (res.success) ok += 1;
        else toast({ title: "تعذّر الحفظ", description: res.error, variant: "destructive" });
      } catch (e) {
        toast({
          title: "فشل الرفع",
          description: e instanceof Error ? e.message : undefined,
          variant: "destructive",
        });
      }
    }
    setBusy(false);
    if (ok > 0) {
      toast({ title: `تمت إضافة ${ok} صورة`, variant: "success" });
      router.refresh();
    }
  }

  async function handleDelete(img: GalleryImageRow) {
    setDeleting(true);
    const res = await deleteClientGalleryImage(img.id);
    setDeleting(false);
    if (res.success) {
      toast({ title: "تم حذف الصورة", variant: "success" });
      setPendingDelete(null);
      router.refresh();
    } else {
      toast({ title: "تعذّر الحذف", description: res.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
            <Link href="/client-galleries">
              <ChevronRight className="h-3.5 w-3.5" />
              كل العملاء
            </Link>
          </Button>
          <span className="text-sm font-bold">{clientName}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {images.length} صورة
          </span>
        </div>
        <Button size="sm" className="gap-1.5" disabled={busy} onClick={() => fileInputRef.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {busy ? "جارٍ الرفع…" : "إضافة صور"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length === 0 && !busy ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
          🖼️ لا توجد صور في معرض هذا العميل بعد. اضغط «إضافة صور» لبدء المعرض.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {/* add tile */}
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="grid aspect-square place-items-center rounded-xl border-2 border-dashed text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-1">
              {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
              <span className="text-xs font-medium">{busy ? "جارٍ الرفع…" : "أضف صورة"}</span>
            </div>
          </button>

          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl border bg-card">
              <button
                type="button"
                onClick={() => setPendingDelete(img)}
                className="absolute top-1.5 start-1.5 z-10 grid h-7 w-7 place-items-center rounded-lg bg-red-600/90 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="حذف الصورة"
                title="حذف"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="aspect-square overflow-hidden bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-[10.5px] text-muted-foreground">
                <span className="truncate" title={img.filename}>{img.filename}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-bold uppercase">{imgFormat(img.mimeType)}</span>
                  {formatBytes(img.fileSize)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف هذه الصورة؟</AlertDialogTitle>
            <AlertDialogDescription>
              تُحذف من معرض العميل الحي + الـ JSON-LD، وأي ريل مرتبطة بها. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Trash2 className="me-2 h-4 w-4" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
