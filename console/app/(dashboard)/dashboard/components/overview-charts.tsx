"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Day = { date: string; impressions: number; clicks: number; views: number };
type TopPage = { title: string; impressions: number; clicks: number; views: number };

const grid = "hsl(var(--border))";
const tick = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const primary = "hsl(var(--primary))";
const emerald = "#059669";
const violet = "#7c3aed";
const tooltipStyle = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: 12 };
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("ar-SA", { month: "short", day: "numeric", timeZone: "UTC" });
const short = (s: string, n = 26) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);
const NAMES: Record<string, string> = { impressions: "ظهور في جوجل", clicks: "زيارات من جوجل", views: "مشاهدات على مدونتي" };

/**
 * The dashboard's two pictures (Khalid, 30 Sep 2026: «بسيطة وأنيقة وتدي الرسالة»): one daily
 * chart that carries all three numbers — Google showing him, Google sending people, people
 * reading on modonty — and one list of the pages that do it. Recharts 2: impressions on their
 * own axis (they run 100× the others), clicks and views share the right one.
 */
export function OverviewCharts({ daily, topPages }: { daily: Day[]; topPages: TopPage[] }) {
  const series = daily.map((d) => ({ ...d, label: dayLabel(d.date) }));
  const pages = topPages.map((p) => ({ ...p, name: short(p.title) }));

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
      <Card className="shadow-sm xl:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">يوماً بيوم</CardTitle>
          <CardDescription>الأزرق ظهورك في جوجل · الأخضر من دخل منه · البنفسجي مشاهداتك على مدونتي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ovImpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={tick} minTickGap={16} />
                <YAxis yAxisId="impr" tick={tick} width={44} />
                <YAxis yAxisId="people" orientation="right" tick={tick} width={36} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number | string, n: string) => [Number(v).toLocaleString(), NAMES[n] ?? n]} />
                <Legend formatter={(v: string) => NAMES[v] ?? v} wrapperStyle={{ fontSize: 12 }} />
                <Area yAxisId="impr" type="monotone" dataKey="impressions" stroke={primary} strokeWidth={2} fill="url(#ovImpr)" />
                <Line yAxisId="people" type="linear" dataKey="clicks" stroke={emerald} strokeWidth={2} dot={false} />
                <Line yAxisId="people" type="linear" dataKey="views" stroke={violet} strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">أقوى صفحاتك</CardTitle>
          <CardDescription>الشريط ظهورها في جوجل · مرّر عليه للزيارات والمشاهدات</CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">لسّا ما ظهرت صفحاتك في جوجل خلال هذه الفترة.</p>
          ) : (
            <div className="h-[280px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pages} layout="vertical" margin={{ top: 0, right: 8, left: 36, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
                  <XAxis type="number" tick={tick} domain={[0, (max: number) => Math.ceil((max * 1.45) / 100) * 100]} />
                  <YAxis type="category" dataKey="name" tick={tick} width={160} orientation="right" interval={0} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(v: number | string, _n: string, item: { payload?: { clicks?: number; views?: number } }) => [
                      `${Number(v).toLocaleString()} ظهور · ${item.payload?.clicks ?? 0} زيارة من جوجل · ${item.payload?.views ?? 0} مشاهدة على مدونتي`,
                      "",
                    ]}
                  />
                  <Bar dataKey="impressions" fill={primary} radius={[0, 4, 4, 0]} barSize={14}>
                    <LabelList dataKey="impressions" position="right" style={{ fontSize: 11, fill: "hsl(var(--foreground))" }} formatter={(v: number) => v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
