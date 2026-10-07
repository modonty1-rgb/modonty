import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { Briefcase, FileText, Gauge, Mail, UserPlus, Users, type LucideIcon } from "lucide-react";

import {
  articleStatusCounts,
  clientStatusCounts,
  memberCounts,
  newsSubscriberCounts,
  subscriberCounts,
  visitorActionsSummary,
} from "@/lib/dashboard/cached";
import { WhatsAppIcon } from "../whatsapp-icon";

const n = (v: number) => v.toLocaleString("en-US");

/**
 * «الأرقام» — six cards, every number with its label (Khalid, 30 Sep 2026: the old collapsed
 * headers showed bare numbers). Same cached fetches as the tabs below, so a card and its
 * tab can never disagree. Each card opens its own page.
 */
export async function NumbersCard() {
  const [clients, articles, va, members, news, subs] = await Promise.all([
    clientStatusCounts(),
    articleStatusCounts(),
    visitorActionsSummary(),
    memberCounts(),
    newsSubscriberCounts(),
    subscriberCounts(),
  ]);
  const needDecision = articles[ArticleStatus.AWAITING_APPROVAL] + articles[ArticleStatus.NEEDS_REVISION];

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm" aria-label="الأرقام">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold">
          <Gauge className="size-4" aria-hidden />
          الأرقام
        </h2>
        <span className="text-xs text-muted-foreground">كل بطاقة تفتح صفحتها</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border">
        <Kpi href="/clients" icon={Briefcase} label="العملاء" value={n(clients.portfolio.active)} unit={`نشط من ${n(clients.total)}`}>
          <b className="text-red-600 dark:text-red-400">{n(clients.needsYou.expired)} منتهي</b> · {n(clients.portfolio.ymyl)} YMYL ·{" "}
          {n(clients.portfolio.standard)} عادي · {n(clients.portfolio.cancelled)} ملغي
        </Kpi>
        <Kpi href="/articles" icon={FileText} label="المقالات" value={n(articles[ArticleStatus.PUBLISHED])} unit="منشور">
          +{n(articles[ArticleStatus.PUBLISHED_ON_CLIENT_SITE])} على مواقع العملاء ·{" "}
          <b className="text-amber-700 dark:text-amber-400">{n(needDecision)} تحتاج قرار</b>
        </Kpi>
        <Kpi href="/analytics" icon={Users} label="الزوار · 90 يوم" value={n(va.visitors.users)} unit="شخص">
          {n(va.visitors.sessions)} جلسة · {Math.round(va.visitors.actionRate ?? 0)}٪ تفاعلوا · {n(va.visitors.aiSessions)} من إجابات الذكاء
        </Kpi>
        <Kpi href="/analytics/leads/bookings?channel=whatsapp" icon={WhatsAppIcon} label="واتساب · 90 يوم" value={n(va.whatsapp.db)} unit="ليد">
          من {n(va.whatsapp.clicks)} ضغطة
        </Kpi>
        <Kpi href="/members" icon={UserPlus} label="الأعضاء" value={n(members.total)} unit="عضو">
          +{n(members.newLast30)} هذا الشهر · {n(members.google)} جوجل · {n(members.emailPassword)} بريد ·{" "}
          <b className="whitespace-nowrap text-amber-700 dark:text-amber-400">{n(members.awaitingLink)} ما أكّدوا</b>
        </Kpi>
        {/* The headline is what /subscribers lists (the clients' subscribers). It used to be
            Modonty's own newsletter, which has no page — «8 of 9» opened a list of 4. */}
        <Kpi href="/subscribers" icon={Mail} label="المشتركون" value={n(subs.active)} unit={`نشط من ${n(subs.total)}`}>
          مشتركو العملاء · نشرة مدونتي {n(news.active)} نشط من {n(news.total)}
        </Kpi>
      </div>
    </section>
  );
}

function Kpi({
  href,
  icon: Icon,
  label,
  value,
  unit,
  children,
}: {
  href: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="block bg-card px-4 py-3.5 transition-colors hover:bg-muted/40">
      <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {label}
      </span>
      <span className="mt-1 block text-2xl font-extrabold tabular-nums">
        {value} <span className="text-sm font-medium text-muted-foreground">{unit}</span>
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{children}</span>
    </Link>
  );
}
