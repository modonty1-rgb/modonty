"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { Download, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getGA4Activity, type FullActivity } from "../actions/get-ga4-activity";
import { DateRangeFilter } from "./date-range-filter";

interface FullActivityClientProps {
  initialData: FullActivity;
  clients: Array<{ id: string; name: string; slug: string }>;
  articles: Array<{ id: string; title: string; slug: string; clientId: string | null }>;
}

const SOURCE_COLORS: Record<string, string> = {
  ORGANIC: "#2563EB",
  DIRECT: "#06B6D4",
  SOCIAL: "#8B5CF6",
  REFERRAL: "#F59E0B",
  EMAIL: "#10B981",
  PAID: "#EF4444",
  INTERNAL: "#9CA3AF",
};
const SOURCE_LABELS: Record<string, string> = {
  ORGANIC: "بحث",
  DIRECT: "مباشر",
  SOCIAL: "سوشال",
  REFERRAL: "إحالة",
  EMAIL: "بريد",
  PAID: "مدفوع",
  INTERNAL: "داخلي",
};

/** Country name in Arabic from its ISO code — GA4 sends English names. */
const REGION_AR = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["ar"], { type: "region" }) : null;
function countryName(stored: string): string {
  const [code, name] = stored.split("|");
  if (code && code.length === 2) {
    try {
      return REGION_AR?.of(code.toUpperCase()) ?? name ?? code;
    } catch {
      return name ?? code;
    }
  }
  return name ?? stored;
}

/** A code chip, not a flag emoji (project rule: icons, never emoji). */
function CountryCode({ code }: { code: string | null }) {
  return (
    <span dir="ltr" className="me-2 inline-block rounded bg-muted px-1 text-xs font-bold text-muted-foreground">
      {code && code.length === 2 ? code.toUpperCase() : "—"}
    </span>
  );
}

function SourceMixBar({ mix, width = "w-[110px]" }: { mix: Record<string, number>; width?: string }) {
  const total = Object.values(mix).reduce((s, n) => s + n, 0);
  if (total === 0) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={`inline-flex h-2 ${width} overflow-hidden rounded align-middle`}>
      {Object.entries(mix)
        .sort(([, a], [, b]) => b - a)
        .map(([source, n]) => (
          <i
            key={source}
            title={`${SOURCE_LABELS[source] ?? source}: ${n}`}
            style={{ width: `${(n / total) * 100}%`, background: SOURCE_COLORS[source] ?? "#9CA3AF" }}
            className="block h-full"
          />
        ))}
    </span>
  );
}

function Kpi({ title, value, hint, hero, href }: { title: string; value: number; hint: string; hero?: boolean; href?: string }) {
  const card = (
    <Card className={`${hero ? "border-t-4 border-t-primary " : ""}${href ? "transition hover:border-primary hover:shadow-md" : ""}`}>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold tabular-nums">{value.toLocaleString("en-US")}</p>
        <p className="text-xs text-muted-foreground">
          {hint}
          {href && <span className="ms-1 text-primary">التفاصيل ←</span>}
        </p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function exportArticlesCsv(rows: FullActivity["articlesTable"]) {
  const head = "Article,Client,Views,Top Country,CTA Clicks";
  const lines = rows.map((r) =>
    [`"${r.title.replaceAll('"', '""')}"`, `"${r.client.replaceAll('"', '""')}"`, r.views, r.topCountry ?? "", r.ctaClicks].join(",")
  );
  const blob = new Blob(["﻿" + [head, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "articles-analytics.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function FullActivityClient({ initialData, clients, articles }: FullActivityClientProps) {
  const [data, setData] = useState(initialData);
  const [clientId, setClientId] = useState<string>("");
  const [articleId, setArticleId] = useState<string>("");
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [isPending, startTransition] = useTransition();

  const selectedClient = clients.find((c) => c.slug === clientId);
  const articleOptions = selectedClient ? articles.filter((a) => a.clientId === selectedClient.id) : articles;

  function reload(next: { clientId?: string; articleId?: string; start?: Date | null; end?: Date | null }) {
    const cid = next.clientId !== undefined ? next.clientId : clientId;
    const aid = next.articleId !== undefined ? next.articleId : articleId;
    const start = next.start !== undefined ? next.start : range.start;
    const end = next.end !== undefined ? next.end : range.end;
    startTransition(async () => {
      const fresh = await getGA4Activity({
        clientSlug: cid || undefined,
        articleSlug: aid || undefined,
        startDate: start || undefined,
        endDate: end || undefined,
      });
      setData(fresh);
    });
  }

  const totalMix = Object.values(data.sources.mix).reduce((s, n) => s + n, 0);
  const totalGeo = data.geo.countries.reduce((s, c) => s + c.count, 0) + data.geo.unknown;

  // Target markets always visible; everything else collapses.
  const PINNED_MARKETS = [
    ["SA", "Saudi Arabia"],
    ["EG", "Egypt"],
  ] as const;
  const pinnedGeo = PINNED_MARKETS.map(
    ([code, name]) =>
      data.geo.countries.find((c) => c.country.startsWith(`${code}|`)) ?? {
        country: `${code}|${name}`,
        count: 0,
        cities: [],
      }
  );
  const restGeo = data.geo.countries.filter(
    (c) => !PINNED_MARKETS.some(([code]) => c.country.startsWith(`${code}|`))
  );
  const restGeoCount = restGeo.reduce((s, c) => s + c.count, 0) + data.geo.unknown;

  const geoRow = (c: (typeof data.geo.countries)[number]) => (
    <Fragment key={c.country}>
      <tr className="border-b last:border-0">
        <td className="py-2">
          <CountryCode code={c.country.split("|")[0]} />
          <b>{countryName(c.country)}</b>
        </td>
        <td className="py-2 text-end font-bold tabular-nums">
          {Math.round((c.count / totalGeo) * 100)}% · {c.count}
        </td>
      </tr>
      {c.cities.length > 0 && (
        <tr>
          <td colSpan={2} className="pb-2 ps-8 text-xs text-muted-foreground">
            {c.cities.map((ct) => `${ct.city} (${ct.count})`).join(" · ")}
          </td>
        </tr>
      )}
    </Fragment>
  );

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          onDateRangeChange={(start, end) => {
            setRange({ start, end });
            reload({ start, end });
          }}
        />
        <select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setArticleId(""); // article list re-scopes to the chosen client
            reload({ clientId: e.target.value, articleId: "" });
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">كل العملاء</option>
          {clients.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={articleId}
          onChange={(e) => {
            setArticleId(e.target.value);
            reload({ articleId: e.target.value });
          }}
          className="h-9 max-w-[320px] rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">كل المقالات</option>
          {articleOptions.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.title}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => exportArticlesCsv(data.articlesTable)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm hover:bg-muted"
        >
          <Download className="size-4" aria-hidden />
          تصدير CSV
        </button>
      </div>

      {isPending ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          {/* 1 · Activity Overview */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Kpi hero title="كل الأحداث" value={data.overview.totalEvents} hint="أحداث العمل المتتبَّعة" />
            <Kpi title="مشاهدات المقالات" value={data.overview.articleViews} hint="المقالات المنشورة" />
            <Kpi title="زيارات صفحات العملاء" value={data.overview.clientViews} hint="صفحات الشركاء" />
            <Kpi title="ضغطات الأزرار" value={data.overview.ctaClicks} hint="أزرار التواصل" href="/analytics/cta" />
            <Kpi title="التفاعل" value={data.overview.engagement} hint="إعجاب · حفظ · مشاركة" href="/analytics/engagement" />
            <Kpi title="أفعال الزوار" value={data.overview.leads} hint="حجوزات · رسائل · أسئلة" href="/analytics/leads" />
          </div>

          {/* 2 · Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>الأحداث عبر الوقت</CardTitle>
            </CardHeader>
            <CardContent>
              {data.timeline.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-muted-foreground">ما في بيانات في هذي الفترة.</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="articleViews" name="مشاهدات المقالات" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="clientViews" name="زيارات صفحات العملاء" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ctaClicks" name="ضغطات الأزرار" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 3+4 · Sources + Geo */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>
                  مصادر الزيارات{" "}
                  <span className="ms-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    بيانات نظيفة من {data.sources.cleanSince}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalMix === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    ما في زيارات مصنّفة بعد — تتجمّع من {data.sources.cleanSince}.
                  </p>
                ) : (
                  <>
                    <div className="mb-3 flex h-6 overflow-hidden rounded-lg">
                      {Object.entries(data.sources.mix)
                        .sort(([, a], [, b]) => b - a)
                        .map(([source, n]) => (
                          <div
                            key={source}
                            title={`${SOURCE_LABELS[source] ?? source}: ${n}`}
                            style={{ width: `${(n / totalMix) * 100}%`, background: SOURCE_COLORS[source] ?? "#9CA3AF" }}
                            className="flex items-center justify-center whitespace-nowrap text-xs font-bold text-white"
                          >
                            {(n / totalMix) * 100 >= 12 ? `${SOURCE_LABELS[source] ?? source} ${Math.round((n / totalMix) * 100)}%` : ""}
                          </div>
                        ))}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {Object.entries(data.sources.mix)
                        .sort(([, a], [, b]) => b - a)
                        .map(([source, n]) => (
                          <span key={source}>
                            <i className="me-1 inline-block size-2 rounded-sm align-middle" style={{ background: SOURCE_COLORS[source] ?? "#9CA3AF" }} />
                            {SOURCE_LABELS[source] ?? source} · {n}
                          </span>
                        ))}
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="py-2 text-start font-medium">أكثر المواقع المُحيلة</th>
                          <th className="py-2 text-end font-medium">الزيارات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sources.topDomains.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-muted-foreground">
                              ما في مواقع مُحيلة بعد
                            </td>
                          </tr>
                        ) : (
                          data.sources.topDomains.map((d) => (
                            <tr key={d.domain} className="border-b last:border-0">
                              <td className="py-2" dir="ltr">{d.domain}</td>
                              <td className="py-2 text-end font-bold tabular-nums">{d.count}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="size-4" aria-hidden /> الجغرافيا</CardTitle>
              </CardHeader>
              <CardContent>
                {totalGeo === 0 || data.geo.countries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    الجغرافيا تتجمّع على الإنتاج (من هيدرز Vercel) — فاضية في التطوير المحلي.
                  </p>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <tbody>{pinnedGeo.map(geoRow)}</tbody>
                    </table>
                    {(restGeo.length > 0 || data.geo.unknown > 0) && (
                      <details className="mt-1">
                        <summary className="cursor-pointer py-1 text-xs text-muted-foreground">
                          دول أخرى ({restGeo.length}) · {restGeoCount} مستخدم
                        </summary>
                        <table className="w-full text-sm">
                          <tbody>
                            {restGeo.map(geoRow)}
                            {data.geo.unknown > 0 && (
                              <tr>
                                <td className="py-2 text-muted-foreground">غير معروف</td>
                                <td className="py-2 text-end tabular-nums text-muted-foreground">{data.geo.unknown}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </details>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 5 · Articles × Sources */}
          <Card>
            <CardHeader>
              <CardTitle>المقالات — من وين يجي القرّاء</CardTitle>
            </CardHeader>
            <CardContent>
              {data.articlesTable.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">ما في مشاهدات مقالات في هذي الفترة.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 text-start font-medium">المقال</th>
                      <th className="py-2 text-start font-medium">العميل</th>
                      <th className="py-2 text-end font-medium">المشاهدات</th>
                      <th className="py-2 text-start font-medium">توزيع المصادر</th>
                      <th className="py-2 text-start font-medium">أعلى دولة</th>
                      <th className="py-2 text-end font-medium">الضغطات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.articlesTable.map((a) => (
                      <tr key={a.articleId} className="border-b last:border-0">
                        <td className="max-w-[320px] truncate py-2" title={a.title}>
                          {a.title}
                        </td>
                        <td className="py-2 text-muted-foreground">{a.client}</td>
                        <td className="py-2 text-end font-bold tabular-nums">{a.views}</td>
                        <td className="py-2">
                          <SourceMixBar mix={a.mix} />
                        </td>
                        <td className="py-2">
                          {a.topCountry ? (
                            <>
                              <CountryCode code={a.topCountry.split("|")[0]} />
                              {countryName(a.topCountry)}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2 text-end font-bold tabular-nums">{a.ctaClicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {Object.entries(SOURCE_LABELS).map(([k, label]) => (
                  <span key={k}>
                    <i className="me-1 inline-block size-2 rounded-sm align-middle" style={{ background: SOURCE_COLORS[k] }} />
                    {label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 6 · Client pages */}
          <Card>
            <CardHeader>
              <CardTitle>صفحات العملاء — الزيارات والتحويل</CardTitle>
            </CardHeader>
            <CardContent>
              {data.clientsTable.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">ما في زيارات لصفحات العملاء في هذي الفترة.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 text-start font-medium">العميل</th>
                      <th className="py-2 text-end font-medium">زيارات الصفحة</th>
                      <th className="py-2 text-end font-medium">ضغطات الأزرار</th>
                      <th className="py-2 text-end font-medium">الحجوزات</th>
                      <th className="py-2 text-start font-medium">أعلى مصدر</th>
                      <th className="py-2 text-start font-medium">أعلى مدينة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.clientsTable.map((c) => (
                      <tr key={c.clientId} className="border-b last:border-0">
                        <td className="py-2">{c.name}</td>
                        <td className="py-2 text-end font-bold tabular-nums">{c.visits}</td>
                        <td className="py-2 text-end font-bold tabular-nums">{c.ctaClicks}</td>
                        <td className="py-2 text-end font-bold tabular-nums">{c.bookings}</td>
                        <td className="py-2">{c.topSource ? SOURCE_LABELS[c.topSource] ?? c.topSource : "—"}</td>
                        <td className="py-2">{c.topCity ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
