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
import type { TopArticle } from "../helpers/dashboard-queries";

interface TopArticlesChartProps {
  data: TopArticle[];
  metricLabel: string;
}

export function TopArticlesChart({ data, metricLabel }: TopArticlesChartProps) {
  const chartData = data.map((a) => ({
    name: a.title.length > 25 ? a.title.slice(0, 25) + "…" : a.title,
    value: a.views,
    fullTitle: a.title,
  }));

  if (chartData.length === 0) return null;

  const gridStroke = "hsl(var(--border))";
  const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
  const barFill = "hsl(221 39% 32%)";

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
          <XAxis type="number" tick={tickStyle} />
          <YAxis type="category" dataKey="name" width={120} tick={{ ...tickStyle, fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), metricLabel]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle ?? ""}
          />
          <Bar dataKey="value" fill={barFill} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
