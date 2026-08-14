import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { tileAspectRatio, shouldContainTile } from "@modonty/shared/lib/justify-rows";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Building2,
  ExternalLink,
  Facebook,
  FileText,
  Ghost,
  Globe,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Link2,
  MessageCircle,
  Music2,
  Share2,
  ShieldAlert,
  Twitter,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getIntakeForm } from "@/app/(dashboard)/intake/actions/intake-admin-actions";
import { IntakeBrief, type BriefForm } from "@/app/(dashboard)/clients/[id]/components/intake-brief";
import { OpenClientConsoleButton } from "@/app/(dashboard)/clients/components/edit-workspace/open-client-console-button";
import { loadSiteUrl } from "@/lib/seo/site-url";

import { getBriefDetail } from "../helpers/load-brief-detail";
import { getRecipientOptions } from "../helpers/load-recipients";
import { NotifyTeamButton } from "../components/notify-team-button";
import { NotificationHistory } from "../components/notification-history";
import {
  BriefSection,
  BriefSectionsProvider,
  ToggleAllSectionsButton,
} from "../components/brief-section";

// The writer's page for one client. Everything the content team needs to write, and
// nothing about money — see the select list in load-brief-detail.ts.

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (!isValidObjectId(clientId)) notFound();

  const [client, form, publicBaseUrl, recipients] = await Promise.all([
    getBriefDetail(clientId),
    getIntakeForm(),
    loadSiteUrl(),
    // Read fresh on every load, so hiring or re-roling somebody updates the picker
    // without anyone touching this code.
    getRecipientOptions(),
  ]);
  if (!client) notFound();

  const location = [client.addressCity, client.addressRegion, client.addressCountry]
    .filter(Boolean)
    .join(" · ");

  return (
    <BriefSectionsProvider>
    <div className="mx-auto max-w-[1180px] space-y-5" dir="rtl">
      {/* Back + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
            <Link href="/briefs">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              كل البريفات
            </Link>
          </Button>
          <ToggleAllSectionsButton />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {client.url && (
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <a href={client.url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                موقعه
              </a>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
            <a
              href={`${publicBaseUrl}/clients/${encodeURIComponent(client.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              صفحته على مُدَوَّنَتِي
            </a>
          </Button>
          <OpenClientConsoleButton clientId={client.id} />
          <NotifyTeamButton
            clientId={client.id}
            clientName={client.name}
            recipients={recipients}
          />
        </div>
      </div>

      {/* First on the page (Khalid 2026-08-05): what the team was already told outranks
          everything else — reading the brief without it risks repeating a note, or missing
          one that changes what you write. */}
      <NotificationHistory items={client.notifications} />

      {/* Identity. No logo, no cover banner: both live in the gallery at the foot of the
          page at full size, and repeating them here only pushed the brief down the screen. */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-start gap-4 p-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold">{client.name}</h1>
              {client.industry && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                  {client.industry}
                </span>
              )}
              {client.isYmyl && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  محتوى حسّاس — يحتاج مُراجِعاً مؤهَّلاً
                </span>
              )}
            </div>
            {client.slogan && <p className="text-sm text-muted-foreground">{client.slogan}</p>}
          </div>

          {/* Content commitment — how many pieces we owe, and where we stand */}
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-center">
            <div className="text-[10px] text-muted-foreground">هذا الشهر</div>
            <div className="text-lg font-bold tabular-nums">
              {client.publishedThisMonth}
              <span className="text-sm font-normal text-muted-foreground">
                /{client.monthlyQuota || "—"}
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground">{client.publishedTotal} منشور إجمالاً</div>
          </div>
        </div>

      </div>

      {/* Social — its own card. The designer needs to see the client's existing look
          before drawing anything, and the writer needs their voice in the wild; both
          were unreadable as three bare hostnames squeezed into a meta line. */}
      {client.sameAs.length > 0 && (
        <BriefSection
          title="حساباته على السوشيال"
          icon={<Share2 aria-hidden="true" />}
          meta={`${client.sameAs.length} حساب`}
        >
          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {client.sameAs.map((u, i) => {
              const net = networkOf(u);
              return (
                <a
                  key={i}
                  href={u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 rounded-lg border bg-muted/30 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${net.tone}`}>
                    <net.Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold">{net.label}</span>
                    <span className="block truncate text-[10.5px] text-muted-foreground" dir="ltr">
                      {pathOf(u)}
                    </span>
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>
        </BriefSection>
      )}

      {/* Description straight from the client record — short, and often the only line a
          writer needs to get the tone right. Short enough that folding it would cost more
          clicks than it saves scrolling, so it stays a plain card. */}
      {(client.description || client.businessBrief) && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-2 text-[13px] font-bold">عن النشاط</h2>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
            {client.businessBrief || client.description}
          </p>
        </div>
      )}

      {/* The questionnaire — same component the client detail page uses, so there is one
          renderer for the brief and it can never drift between the two screens.
          Open by default: it is the reason the page exists. */}
      <BriefSection title="بيانات نشاط العميل" icon={<BookOpen aria-hidden="true" />}>
        <div className="p-3">
          <IntakeBrief
            form={form as unknown as BriefForm | null}
            intake={client.intake}
            intakeUpdatedAt={client.intakeUpdatedAt}
            isYmyl={client.isYmyl}
          />
        </div>
      </BriefSection>

      {/* What already exists — so the next piece is a new one. One fold for both halves:
          the titles and the subjects answer the same question together. */}
      <BriefSection
        title="اللي كُتب له"
        icon={<FileText aria-hidden="true" />}
        meta={`${client.publishedTotal} منشور · ${client.categoriesUsed.length} تصنيف`}
      >
        <div className="grid gap-3 p-3 lg:grid-cols-[1fr_280px]">
        <div className="rounded-lg border bg-muted/20">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <h3 className="text-[12px] font-bold">آخر ما كُتب له</h3>
            <span className="ms-auto text-[11px] text-muted-foreground">
              {client.recentArticles.length} من {client.publishedTotal}
            </span>
          </div>
          {client.recentArticles.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              ما كُتب له شي بعد — أنت أول من يكتب.
            </p>
          ) : (
            <ul className="divide-y">
              {client.recentArticles.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Link
                    href={`/articles/${a.id}`}
                    className="min-w-0 flex-1 truncate text-[13px] font-medium hover:text-primary"
                    title={a.title}
                  >
                    {a.title}
                  </Link>
                  {a.category && (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {a.category}
                    </span>
                  )}
                  <span className="w-[86px] shrink-0 text-end text-[10px] text-muted-foreground">
                    {a.datePublished ? dateFmt.format(new Date(a.datePublished)) : statusLabel(a.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-muted/20">
          <div className="border-b px-4 py-2.5">
            <h3 className="text-[12px] font-bold">مواضيعه المغطّاة</h3>
          </div>
          {client.categoriesUsed.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">لا تصنيفات بعد.</p>
          ) : (
            <ul className="p-3 space-y-1.5">
              {client.categoriesUsed.map((c) => (
                <li key={c.name} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        </div>
      </BriefSection>

      {/* Everything the client owns visually, last on the page — a designer scrolls here
          on purpose, and it would push the writing material down if it sat higher. */}
      <BriefSection
        title="صور العميل"
        icon={<ImageIcon aria-hidden="true" />}
        meta={
          client.images.length > 0
            ? `${client.images.length} صورة · اضغط لفتح الأصل`
            : "لا صور بعد"
        }
      >
        {client.images.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">
            ما فيه صور مرفوعة لهذا العميل بعد.
          </p>
        ) : (
          /* Masonry, not a grid of squares. A square tile crops every image to its middle,
             which is the one thing a designer must NOT see — a wide banner and a portrait
             reel looked identical before. CSS columns keep each image's real proportions
             and just scale it to the column width. */
          <div className="columns-2 gap-3 p-3 sm:columns-3 lg:columns-4 xl:columns-5">
            {client.images.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-3 block break-inside-avoid overflow-hidden rounded-lg border bg-muted/30 transition-colors hover:border-primary/40"
                title={img.altText || img.filename}
              >
                <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: tileAspectRatio(img) }}>
                  <OptimizedImage
                    fill media={asMedia(img.url, img.altText ?? "")} alt={img.altText ?? ""} sizes="(max-width: 768px) 100vw, 320px"
                    loading="lazy"
                    className={`block ${shouldContainTile(img) ? "object-contain" : "object-cover"}`}
                  />
                  <span className="absolute start-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9.5px] font-medium text-white backdrop-blur">
                    {img.role}
                  </span>
                </div>
                <div className="space-y-0.5 px-2 py-1.5">
                  <p className="truncate text-[10.5px] font-medium" title={img.filename}>
                    {img.filename}
                  </p>
                  <p className="text-[9.5px] text-muted-foreground" dir="ltr">
                    {img.width && img.height ? `${img.width}×${img.height}` : "—"}
                    {img.fileSize ? ` · ${formatBytes(img.fileSize)}` : ""}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </BriefSection>
    </div>
    </BriefSectionsProvider>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** The handle, not the whole url — that is the part a person recognises. */
function pathOf(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    return path && path !== "" ? path : u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Named + coloured per network: a wall of identical grey rows tells nobody anything. */
function networkOf(url: string): {
  label: string;
  tone: string;
  Icon: React.ComponentType<{ className?: string }>;
} {
  const u = url.toLowerCase();
  if (u.includes("facebook.") || u.includes("fb.watch"))
    return { label: "فيسبوك", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400", Icon: Facebook };
  if (u.includes("instagram."))
    return { label: "إنستغرام", tone: "bg-pink-500/15 text-pink-600 dark:text-pink-400", Icon: Instagram };
  if (u.includes("youtube.") || u.includes("youtu.be"))
    return { label: "يوتيوب", tone: "bg-red-500/15 text-red-600 dark:text-red-400", Icon: Youtube };
  if (u.includes("linkedin."))
    return { label: "لينكدإن", tone: "bg-sky-500/15 text-sky-700 dark:text-sky-400", Icon: Linkedin };
  if (u.includes("twitter.") || u.includes("x.com"))
    return { label: "إكس", tone: "bg-foreground/10 text-foreground", Icon: Twitter };
  if (u.includes("tiktok."))
    return { label: "تيك توك", tone: "bg-foreground/10 text-foreground", Icon: Music2 };
  if (u.includes("wa.me") || u.includes("whatsapp."))
    return { label: "واتساب", tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", Icon: MessageCircle };
  if (u.includes("snapchat."))
    return { label: "سناب شات", tone: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400", Icon: Ghost };
  return { label: hostOf(url), tone: "bg-muted text-muted-foreground", Icon: Link2 };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    WRITING: "قيد الكتابة",
    DRAFT: "مسودة",
    AWAITING_APPROVAL: "بانتظار العميل",
    NEEDS_REVISION: "تحتاج تعديل",
    SCHEDULED: "مجدول",
    ARCHIVED: "مؤرشف",
  };
  return map[status] ?? status;
}
