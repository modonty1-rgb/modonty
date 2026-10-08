import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { SocialChannel } from "@prisma/client";

import { CHANNEL_META, FORMAT_LABEL, FUNNEL_LABEL, PAID_LABEL, STATUS_LABEL } from "../../helpers/social-labels";
import { CALENDAR_TIME_ZONE } from "../../helpers/dates";
import type { SocialPostRow } from "../../helpers/queries";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2">
      <span className="pt-0.5 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="min-w-0 text-xs text-foreground">{children}</div>
    </div>
  );
}

function LinkValue({ href, max = 50 }: { href: string; max?: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className="inline-flex items-center gap-1 break-all text-primary underline"
    >
      {href.length > max ? `${href.slice(0, max)}...` : href}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

/**
 * ملخّص المنشور سطراً بسطر — محتوى نافذة «عرض التفاصيل» في القديم (`CalendarTable.tsx:379-437`)،
 * ويُعاد في صفحة التفصيل. الحقل الفارغ لا يظهر، كالقديم.
 */
export function PostSummary({ post }: { post: SocialPostRow }) {
  const links = (post.channelLinks ?? {}) as Partial<Record<SocialChannel, string>>;
  const linkEntries = Object.entries(links).filter(([, url]) => Boolean(url)) as [SocialChannel, string][];

  return (
    <div className="space-y-4 text-sm">
      <Row label="الفكرة">{post.idea}</Row>
      {post.funnelStages.length > 0 && <Row label="نوع الحملة">{post.funnelStages.map((s) => FUNNEL_LABEL[s]).join("، ")}</Row>}
      {post.format && <Row label="نوع المحتوى">{FORMAT_LABEL[post.format]}</Row>}
      <Row label="الحالة">{STATUS_LABEL[post.status]}</Row>
      {post.channels.length > 0 && <Row label="القنوات">{post.channels.map((c) => CHANNEL_META[c].label).join("، ")}</Row>}
      {post.text && (
        <Row label="النص">
          <p className="whitespace-pre-wrap leading-relaxed">{post.text}</p>
        </Row>
      )}
      {post.hook && <Row label="الخطاف">{post.hook}</Row>}
      {post.cta && <Row label="الدعوة">{post.cta}</Row>}
      {post.scriptUrl && (
        <Row label="السكريبت">
          {/^https?:\/\//i.test(post.scriptUrl) ? <LinkValue href={post.scriptUrl} /> : post.scriptUrl}
        </Row>
      )}
      {post.voiceTone && <Row label="نبرة الصوت">{post.voiceTone}</Row>}
      {post.inspiration && (
        <Row label="الإلهام">
          {/^https?:\/\//i.test(post.inspiration) ? <LinkValue href={post.inspiration} /> : post.inspiration}
        </Row>
      )}
      {post.assets.length > 0 && (
        <Row label={`الملفات (${post.assets.length})`}>
          <div className="space-y-1">
            {post.assets.map((a, i) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary underline"
              >
                {a.label || `ملف ${i + 1}`}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </Row>
      )}
      {post.paidKind && (
        <Row label="الحملة">
          {PAID_LABEL[post.paidKind]}
          {post.paidKind === "SPONSORED" && post.budget != null && (
            <span className="tabular-nums">
              {" "}
              — {post.budget} {post.currency ?? ""}
              {post.adDurationDays ? ` · ${post.adDurationDays} يوم` : ""}
            </span>
          )}
        </Row>
      )}
      {post.publishAt && (
        <Row label="موعد النشر">
          {post.publishAt.toLocaleString("ar-SA", {
            timeZone: CALENDAR_TIME_ZONE,
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </Row>
      )}
      {linkEntries.length > 0 && (
        <Row label="روابط النشر">
          <div className="space-y-1">
            {linkEntries.map(([ch, url]) => (
              <div key={ch} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{CHANNEL_META[ch]?.label ?? ch}</span>
                <LinkValue href={url} max={40} />
              </div>
            ))}
          </div>
        </Row>
      )}
      {post.notes && (
        <Row label="ملحوظات">
          <p className="whitespace-pre-wrap leading-relaxed">{post.notes}</p>
        </Row>
      )}
    </div>
  );
}
