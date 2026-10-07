"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthPoint {
  label: string;
  /** Major units (pounds / riyals) — the chart reads amounts, not minor units. */
  sales: number;
}

const num = (v: number) => v.toLocaleString("ar-EG", { maximumFractionDigits: 0 });

/** The rep's sales month by month — the month that rose and the one that fell, at a glance (Khalid: «بس المبيعات»). */
export function MonthlySalesChart({ data, currencyLabel }: { data: MonthPoint[]; currencyLabel: string }) {
  // The SVG lays out in LTR — inside an RTL page its axis labels anchor the wrong way and clip.
  // `reversed` on the x-axis keeps the months reading right-to-left.
  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" reversed stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
          <YAxis orientation="right" tickFormatter={num} stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} width={68} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            formatter={(v) => [`${num(Number(v))} ${currencyLabel}`, "المبيعات"]}
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px", direction: "rtl" }}
          />
          <Bar dataKey="sales" fill="hsl(var(--primary) / 0.3)" stroke="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
