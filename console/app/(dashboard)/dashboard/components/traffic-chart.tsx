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

interface TrafficChartProps {
  data: TrafficSourceData[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const chartData = data.map((d) => ({
    name: d.source.toLowerCase(),
    count: d.count,
    percentage: d.percentage.toFixed(1),
  }));

  if (chartData.length === 0) return null;

  const gridStroke = "hsl(var(--border))";
  const tickStyle = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
  const barFill = "hsl(221 39% 32%)";

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
            formatter={(value: number | undefined) => [(value ?? 0).toLocaleString(), ""]}
          />
          <Bar dataKey="count" fill={barFill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
