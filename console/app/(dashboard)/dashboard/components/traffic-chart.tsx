"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrafficSourceData } from "../helpers/dashboard-queries";
import { ar } from "@/lib/ar";

interface TrafficChartProps {
  data: TrafficSourceData[];
}

const sourceLabel = (raw: string): string => {
  const key = raw.toLowerCase();
  const a = ar.analytics;
  if (key.includes("organic") || key.includes("google") || key.includes("search")) return a.sourceOrganic;
  if (key.includes("direct")) return a.sourceDirect;
  if (key.includes("referral") || key.includes("referrer")) return a.sourceReferral;
  if (key.includes("social") || key.includes("facebook") || key.includes("twitter") || key.includes("instagram") || key.includes("linkedin")) return a.sourceSocial;
  if (key.includes("paid") || key.includes("ads") || key.includes("ad")) return a.sourcePaid;
  return raw || a.sourceUnknown;
};

export function TrafficChart({ data }: TrafficChartProps) {
  const chartData = data.map((d) => ({
    name: sourceLabel(d.source),
    count: d.count,
    percentage: d.percentage.toFixed(1),
  }));

  if (chartData.length === 0) return null;

  const gridStroke = "hsl(var(--border))";
  const tickStyle = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
  const barFill = "hsl(var(--primary))";

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="name" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number | string) => [(Number(value) ?? 0).toLocaleString(), ""]}
          />
          <Bar dataKey="count" fill={barFill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
