"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ViewsOverTimeItem } from "../helpers/dashboard-queries";

interface ViewsChartProps {
  data: ViewsOverTimeItem[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "Z");
  return d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
}

export function ViewsChart({ data }: ViewsChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }));

  if (chartData.length === 0) return null;

  const gridStroke = "hsl(var(--border))";
  const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
  const strokeColor = "hsl(221 39% 32%)";

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="label" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), "مشاهدات"]}
            labelFormatter={(label) => typeof label === "string" ? formatDateLabel(label) : label}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke={strokeColor}
            fillOpacity={1}
            fill="url(#viewsGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
