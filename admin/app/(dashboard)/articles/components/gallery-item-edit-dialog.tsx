"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import NextImage from "next/image";
import { Loader2 } from "lucide-react";
import type { GalleryItem } from "../actions/gallery-actions";

interface GalleryItemEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GalleryItem;
  articleId: string;
  onSave: (updates: { caption?: string; altText?: string }) => void;
  onCancel?: () => void;
}

export function GalleryItemEditDialog({
  open,
  onOpenChange,
  item,
  articleId,
  onSave,
  onCancel,
}: GalleryItemEditDialogProps) {
  const [caption, setCaption] = useState(item.caption || "");
  const [altText, setAltText] = useState(item.altText || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCaption(item.caption || "");
    setAltText(item.altText || "");
  }, [item, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        caption: caption.trim() || undefined,
        altText: altText.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCaption(item.caption || "");
    setAltText(item.altText || "");
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل صورة المعرض</DialogTitle>
          <DialogDescription>
            قم بتحديث النص البديل والتسمية التوضيحية لهذه الصورة. هذه القيم خاصة بهذه المقالة ولن تؤثر على الصورة في مكان آخر.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Preview */}
          <div className="space-y-2">
            <Label>معاينة الصورة</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
              <NextImage
                src={item.media.url}
                alt={altText || item.media.altText || "Gallery image"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {item.media.filename}
              {item.media.width && item.media.height && (
                <> • {item.media.width} × {item.media.height}px</>
              )}
            </p>
          </div>

          {/* Caption Field */}
          <div className="space-y-2">
            <Label htmlFor="caption">
              التسمية التوضيحية (Caption)
              <span className="text-muted-foreground ml-2 font-normal">
                (اختياري)
              </span>
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={item.media.altText || "أضف وصفًا للصورة..."}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              التسمية التوضيحية الخاصة بهذه المقالة. إذا تُركت فارغة، سيتم استخدام التسمية التوضيحية الافتراضية للصورة.
            </p>
          </div>

          {/* Alt Text Field */}
          <div className="space-y-2">
            <Label htmlFor="altText">
              النص البديل (Alt Text)
              <span className="text-muted-foreground ml-2 font-normal">
                (مهم للـ SEO وإمكانية الوصول)
              </span>
            </Label>
            <Textarea
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={item.media.altText || "وصف الصورة للمستخدمين التقنيين ومحركات البحث..."}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              النص البديل الخاص بهذه المقالة. إذا تُرك فارغًا، سيتم استخدام النص البديل الافتراضي للصورة.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            إلغاء
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}