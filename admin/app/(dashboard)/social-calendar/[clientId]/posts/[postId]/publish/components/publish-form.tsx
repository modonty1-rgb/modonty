"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { SocialChannel, SocialPaidKind } from "@prisma/client";
import { CheckCircle2, ExternalLink, Send, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { publishSocialPost, saveSocialPublishDetails } from "../../../../../actions";
import { AssetMedia } from "../../../../../components/asset-media";
import { ChannelIcon } from "../../../../../components/channel-icon";
import { CALENDAR_TIME_ZONE, dateToRiyadhInputs } from "../../../../../helpers/dates";
import type { SocialPostRow } from "../../../../../helpers/queries";
import {
  CHANNEL_META,
  CURRENCY_OPTIONS,
  FORMAT_LABEL,
  PAID_ORDER,
  STATUS_LABEL,
  type SocialCurrency,
} from "../../../../../helpers/social-labels";
import { DownloadButton } from "../../../../components/download-button";
import { RejectDialog } from "../../../../components/reject-dialog";

function ChipRadio<T extends string>({
  options,
  labels,
  value,
  onChange,
  disabled,
}: {
  options: readonly T[];
  labels?: Record<T, string>;
  value: T | null;
  onChange: (v: T | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          aria-pressed={value === opt}
          onClick={() => onChange(value === opt ? null : opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-60",
            value === opt
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary/50",
          )}
        >
          {labels ? labels[opt] : opt}
        </button>
      ))}
    </div>
  );
}

/** نصّ الخيارين كما يظهر في القديم حرفياً (`ORG_PAID_OPTIONS` — `constants.ts:29`). */
const PAID_CHIP_LABEL: Record<SocialPaidKind, string> = { ORGANIC: "organic", SPONSORED: "sponsored" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="border-b border-border pb-2 text-xs font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ReadField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="min-w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/**
 * صفحة الميديا باير (القديم `PublishForm.tsx`): ملخّص المنشور + الإبداع بزرّ تحميل، عضوي/مدفوع
 * (المدفوع يُظهر المبلغ والعملة والمدة)، موعد النشر تاريخ + وقت، رابط لكل قناة، ثم «نشر» و«حفظ
 * بدون نشر» — وبعد النشر «حفظ التعديلات» للروابط.
 *
 * الفرق المفروض: الموعد يُخزَّن لحظة واحدة بتوقيت الرياض (س٦)، الروابط تُتحقَّق (http/https)،
 * و«إرجاع للإنتاج» بسبب إلزامي لمن يملك النشر (س٧). لمن لا يملك النشر الصفحة للقراءة فقط.
 */
export function PublishForm({
  post,
  canPublish,
  backHref,
}: {
  post: SocialPostRow;
  canPublish: boolean;
  backHref: string;
}) {
  const router = useRouter();
  const initialSchedule = dateToRiyadhInputs(post.publishAt);
  const existingLinks = (post.channelLinks ?? {}) as Partial<Record<SocialChannel, string>>;

  const [paidKind, setPaidKind] = useState<SocialPaidKind | null>(post.paidKind);
  const [budget, setBudget] = useState(post.budget != null ? String(post.budget) : "");
  const [currency, setCurrency] = useState<SocialCurrency | null>(
    (CURRENCY_OPTIONS as readonly string[]).includes(post.currency ?? "") ? (post.currency as SocialCurrency) : "SAR",
  );
  const [adDuration, setAdDuration] = useState(post.adDurationDays != null ? String(post.adDurationDays) : "");
  const [publishDate, setPublishDate] = useState(initialSchedule.date);
  const [publishTime, setPublishTime] = useState(initialSchedule.time);
  const [links, setLinks] = useState<Partial<Record<SocialChannel, string>>>(existingLinks);
  const [saving, setSaving] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const isPublished = post.status === "PUBLISHED";
  const stageOk = post.status === "READY_TO_PUBLISH" || isPublished;
  const editable = canPublish && stageOk;

  function payload() {
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const channelLinks: Partial<Record<SocialChannel, string>> = {};
    for (const ch of post.channels) channelLinks[ch] = links[ch]?.trim() ?? "";
    return {
      postId: post.id,
      paidKind,
      budget: num(budget),
      currency,
      adDurationDays: num(adDuration),
      publishDate,
      publishTime,
      channelLinks,
    };
  }

  async function run(kind: "save" | "publish") {
    setSaving(true);
    try {
      const res = kind === "publish" ? await publishSocialPost(payload()) : await saveSocialPublishDetails(payload());
      if (res.success) {
        toast({ title: kind === "publish" ? "تم النشر بنجاح" : "تم الحفظ", variant: "success" });
        router.push(backHref);
      } else {
        toast({ title: res.error, variant: "destructive" });
      }
    } catch (error) {
      console.error("[social-calendar] publish form failed", error);
      toast({ title: "تعذّر الحفظ — تحقّق من الاتصال وحاول مرة أخرى", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {isPublished && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          تم النشر
          {post.publishedAt && (
            <span className="ms-1 font-normal">
              — {post.publishedAt.toLocaleDateString("ar-SA", { timeZone: CALENDAR_TIME_ZONE, day: "numeric", month: "long" })}
            </span>
          )}
        </div>
      )}

      {!stageOk && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          المنشور في «{STATUS_LABEL[post.status]}» — صفحة النشر تُفتح بعد الموافقة على الإبداع.
        </div>
      )}
      {stageOk && !canPublish && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          عرض للقراءة — النشر للميديا باير.
        </div>
      )}

      <Section title="ملخص المنشور">
        <ReadField label="الفكرة" value={post.idea} />
        <ReadField label="نوع المحتوى" value={post.format ? FORMAT_LABEL[post.format] : null} />
        <ReadField label="الحالة" value={STATUS_LABEL[post.status]} />
        {post.channels.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="min-w-28 shrink-0 text-xs text-muted-foreground">القنوات</span>
            <div className="flex items-center gap-1.5">
              {post.channels.map((ch) => (
                <ChannelIcon key={ch} channel={ch} />
              ))}
            </div>
          </div>
        )}
        {post.assets.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-sm text-muted-foreground">
            لا يوجد إبداع مرفق بعد
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {post.assets.map((a, i) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-border shadow-sm">
                <AssetMedia asset={a} className="h-64 w-full bg-black/5 object-contain" />
                <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2">
                  <span className="flex-1 truncate text-sm font-medium text-foreground">{a.label || `ملف ${i + 1}`}</span>
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground/70">
                    {a.kind === "VIDEO" ? "فيديو" : "صورة"}
                  </span>
                  {a.width && a.height ? (
                    <span className="hidden text-[10px] tabular-nums text-muted-foreground/60 sm:inline">
                      {a.width}×{a.height}
                    </span>
                  ) : null}
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    فتح
                  </a>
                  <DownloadButton url={a.url} filename={a.label || `ملف-${i + 1}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="إعدادات الحملة">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">عضوي / مدفوع</Label>
          <ChipRadio options={PAID_ORDER} labels={PAID_CHIP_LABEL} value={paidKind} onChange={setPaidKind} disabled={!editable} />
        </div>
        {paidKind === "SPONSORED" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">المبلغ</Label>
              <Input
                type="number"
                min="0"
                dir="ltr"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
                disabled={!editable}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">العملة</Label>
              <ChipRadio options={CURRENCY_OPTIONS} value={currency} onChange={setCurrency} disabled={!editable} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground">مدة الإعلان (أيام)</Label>
              <Input
                type="number"
                min="1"
                dir="ltr"
                value={adDuration}
                onChange={(e) => setAdDuration(e.target.value)}
                placeholder="1"
                disabled={!editable}
                className="h-9"
              />
            </div>
          </div>
        )}
      </Section>

      <Section title="موعد النشر (بتوقيت الرياض)">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">التاريخ</Label>
            <Input type="date" dir="ltr" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} disabled={!editable} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">الوقت</Label>
            <Input type="time" dir="ltr" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} disabled={!editable} className="h-9" />
          </div>
        </div>
      </Section>

      {post.channels.length > 0 && (
        <Section title="روابط النشر">
          <div className="space-y-3">
            {post.channels.map((ch) => {
              const value = links[ch] ?? "";
              const hasLink = /^https?:\/\/\S+$/i.test(value.trim());
              return (
                <div key={ch} className="flex items-center gap-3">
                  <ChannelIcon channel={ch} href={hasLink ? value.trim() : undefined} />
                  <Input
                    dir="ltr"
                    placeholder={`رابط ${CHANNEL_META[ch].label}...`}
                    value={value}
                    onChange={(e) => setLinks((prev) => ({ ...prev, [ch]: e.target.value }))}
                    disabled={!editable}
                    className="h-8 flex-1 font-mono text-xs"
                  />
                  {hasLink && (
                    <a
                      href={value.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="فتح الرابط"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
        {editable && (
          <>
            <Button
              type="button"
              disabled={saving || isPublished}
              onClick={() => void run("publish")}
              className="h-10 min-w-[140px] gap-2 font-semibold"
            >
              <Send className="h-4 w-4" />
              {saving ? "جاري الحفظ..." : isPublished ? "تم النشر" : "نشر"}
            </Button>
            <Button type="button" variant="outline" disabled={saving} onClick={() => void run("save")} className="h-10">
              {isPublished ? "حفظ التعديلات" : "حفظ بدون نشر"}
            </Button>
          </>
        )}
        <Button type="button" variant="ghost" className="h-10" onClick={() => router.push(backHref)}>
          رجوع
        </Button>
        {canPublish && post.status === "READY_TO_PUBLISH" && (
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => setReturnOpen(true)}
            className="ms-auto h-10 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Undo2 className="h-4 w-4" />
            إرجاع للإنتاج
          </Button>
        )}
      </div>

      {canPublish && post.status === "READY_TO_PUBLISH" && (
        <RejectDialog
          postId={post.id}
          open={returnOpen}
          onOpenChange={setReturnOpen}
          requireNote
          onDone={() => router.push(backHref)}
        />
      )}
    </div>
  );
}
