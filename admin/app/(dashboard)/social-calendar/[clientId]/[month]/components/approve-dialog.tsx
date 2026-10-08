"use client";

import { useTransition } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

import { approveSocialPost } from "../../../actions";
import { AssetMedia } from "../../../components/asset-media";
import type { SocialPostRow } from "../../../helpers/queries";

/**
 * «منح الموافقة» — يعرض الإبداع كاملاً ثم يوافق → «جاهز للنشر» (القديم `CalendarTable.tsx:439-509`).
 */
export function ApproveDialog({
  post,
  open,
  onOpenChange,
  onDone,
}: {
  post: SocialPostRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const assets = post.assets;

  function approve() {
    startTransition(async () => {
      const res = await approveSocialPost(post.id);
      if (res.success) {
        toast({ title: "تمت الموافقة — جاهز للنشر", variant: "success" });
        onOpenChange(false);
        onDone();
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border px-4 py-3 pe-12">
          <DialogTitle className="truncate text-sm font-semibold">
            منح الموافقة — {post.idea || `يوم ${post.scheduledFor.getUTCDate()}`}
          </DialogTitle>
          {assets.length > 0 && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {assets.length} {assets.length === 1 ? "ملف" : "ملفات"}
            </span>
          )}
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto">
          {assets.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">لا يوجد إبداع مرفق</div>
          ) : (
            <div className="space-y-2 p-3">
              {assets.map((a, i) => (
                <div key={a.id} className="overflow-hidden rounded-xl border border-border">
                  <AssetMedia asset={a} className="h-auto max-h-64 w-full bg-black/5" />
                  <div className="flex items-center justify-between border-t border-border px-3 py-2">
                    <span className="text-xs text-muted-foreground">{a.label || `ملف ${i + 1}`}</span>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      فتح
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={approve}
            className="gap-2 bg-green-600 text-white hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {pending ? "جاري الموافقة..." : "منح الموافقة — جاهز للنشر"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
