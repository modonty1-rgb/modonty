"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import type {
  AuditedLink,
  LinkDecision,
  LinkIssue,
  LinkRel,
  LinkTarget,
} from "../helpers/internal-link-audit";

/** What the writer is being asked about, in words he would say himself. */
const ISSUE_LABEL: Record<LinkIssue, string> = {
  "internal-nofollow": "مكتوب عليه «لا تتبعه» وهو رابط داخلي",
  "backlink-nofollow": "رابط لمودونتي مكتوب عليه «لا تتبعه» — الباكلينك ما يوصل",
  "insecure-http": "يبدأ بـ http — غير آمن",
  "dead-link": "الصفحة ما تفتح (٤٠٤)",
  "malformed-url": "العنوان مكسور — مو رابطاً صالحاً",
};

interface InternalLinkReviewDialogProps {
  open: boolean;
  links: AuditedLink[];
  onCancel: () => void;
  onApply: (decisions: LinkDecision[]) => void;
}

type DraftDecision = { rel: LinkRel; target: LinkTarget; href: string };

/** A link to one of our own pages should pass value and stay in the same tab. */
const SUGGESTED = { rel: "follow" as LinkRel, target: "_self" as LinkTarget };

/** Opens the same page over https — the one-click answer for an http link. */
function toHttps(href: string): string {
  return href.replace(/^http:\/\//i, "https://");
}

/**
 * Opens only when a link that points back at our own site carries `nofollow` —
 * which is what a Word paste produces without anyone choosing it. The writer
 * decides each one; nothing here rewrites the body on its own.
 */
export function InternalLinkReviewDialog({
  open,
  links,
  onCancel,
  onApply,
}: InternalLinkReviewDialogProps) {
  const [drafts, setDrafts] = useState<Record<number, DraftDecision>>({});

  useEffect(() => {
    if (!open) return;
    setDrafts(
      Object.fromEntries(
        links.map((l) => [
          l.index,
          {
            ...SUGGESTED,
            // Our own pages — and a backlink home from a client's site — are suggested
            // as Follow. Everything else keeps the safe default it arrived with.
            rel:
              l.isInternal || l.issues.includes("backlink-nofollow")
                ? "follow"
                : ("nofollow" as LinkRel),
            target: l.isInternal ? "_self" : ("_blank" as LinkTarget),
            href: l.href,
          },
        ]),
      ),
    );
  }, [open, links]);

  const update = (index: number, patch: Partial<DraftDecision>) =>
    setDrafts((prev) => ({
      ...prev,
      [index]: { ...(prev[index] ?? { ...SUGGESTED, href: "" }), ...patch },
    }));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>راجع الروابط قبل الحفظ</DialogTitle>
          <DialogDescription>
            {links.length === 1
              ? "فيه رابط واحد يحتاج قرارك — غالباً جا مع نصّ ملصوق."
              : `فيه ${links.length} روابط تحتاج قرارك — غالباً جت مع نصّ ملصوق.`}{" "}
            شوف إيش المكتوب على كل واحد وعدّله قبل الحفظ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {links.map((link) => {
            const draft = drafts[link.index] ?? { ...SUGGESTED, href: link.href };
            const isHttp = link.issues.includes("insecure-http");

            return (
              <div key={link.index} className="min-w-0 space-y-3 rounded-md border border-border p-3">
                <div className="min-w-0 space-y-2">
                  <p className="text-sm font-semibold">{link.text || "(بلا نصّ)"}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {link.issues.map((issue) => (
                      <span
                        key={issue}
                        className="rounded bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-400"
                      >
                        {ISSUE_LABEL[issue]}
                      </span>
                    ))}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <Label htmlFor={`href-${link.index}`}>العنوان</Label>
                    <Input
                      id={`href-${link.index}`}
                      dir="ltr"
                      value={draft.href}
                      onChange={(e) => update(link.index, { href: e.target.value })}
                      className="font-mono text-[11px]"
                    />
                    {isHttp && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => update(link.index, { href: toHttps(draft.href) })}
                      >
                        حوّله إلى https
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 grid-cols-2 gap-3">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor={`rel-${link.index}`}>نوع الرابط</Label>
                    <Select
                      value={draft.rel}
                      onValueChange={(value) => update(link.index, { rel: value as LinkRel })}
                    >
                      <SelectTrigger id={`rel-${link.index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow">Follow</SelectItem>
                        <SelectItem value="nofollow">Nofollow</SelectItem>
                        <SelectItem value="sponsored">Sponsored</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      {draft.rel === "follow" && "✅ يمرر قيمة SEO"}
                      {draft.rel === "nofollow" && "⚠️ لا يمرر قيمة SEO"}
                      {draft.rel === "sponsored" && "⚠️ رابط إعلاني"}
                    </p>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <Label htmlFor={`target-${link.index}`}>فتح في</Label>
                    <Select
                      value={draft.target}
                      onValueChange={(value) => update(link.index, { target: value as LinkTarget })}
                    >
                      <SelectTrigger id={`target-${link.index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">نفس النافذة</SelectItem>
                        <SelectItem value="_blank">نافذة جديدة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            رجوع للمقال
          </Button>
          <Button
            type="button"
            onClick={() =>
              onApply(
                links.map((l) => {
                  const draft = drafts[l.index] ?? { ...SUGGESTED, href: l.href };
                  return {
                    index: l.index,
                    rel: draft.rel,
                    target: draft.target,
                    // Only carry the address when he actually changed it.
                    ...(draft.href.trim() && draft.href.trim() !== l.href
                      ? { href: draft.href.trim() }
                      : {}),
                  };
                }),
              )
            }
          >
            اعتمد وأكمل الحفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
