"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DeliveryProgressChartProps {
  stats: Array<{
    clientId: string;
    clientName: string;
    articlesPerMonth: number;
    articlesDelivered: number;
    remaining: number;
    isAtLimit: boolean;
  }>;
}

const COLORS = {
  delivered: "hsl(var(--primary))",
  limit: "hsl(var(--muted))",
  atLimit: "hsl(var(--destructive))",
  nearLimit: "hsl(var(--muted-foreground))",
};

export function DeliveryProgressChart({ stats }: DeliveryProgressChartProps) {
  const chartData = stats
    .slice(0, 10)
    .map((stat) => {
      const progress = stat.articlesPerMonth > 0
        ? (stat.articlesDelivered / stat.articlesPerMonth) * 100
        : 0;
      
      return {
        client: stat.clientName.length > 20
          ? stat.clientName.substring(0, 20) + "..."
          : stat.clientName,
        delivered: stat.articlesDelivered,
        limit: stat.articlesPerMonth,
        remaining: stat.remaining,
        progress: Math.round(progress),
        isAtLimit: stat.isAtLimit,
        isNearLimit: progress >= 90 && !stat.isAtLimit,
      };
    });

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Delivery Progress</CardTitle>
          <CardDescription>Top clients delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.client}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Delivered:</span>
              <span className="font-medium">{data.delivered}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-medium">{data.remaining}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Limit:</span>
              <span className="font-medium">{data.limit}</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-bold">{data.progress}%</span>
            </div>
            {data.isAtLimit && (
              <div className="text-xs text-destructive font-medium mt-1">
                ⚠️ Limit Reached
              </div>
            )}
            {data.isNearLimit && !data.isAtLimit && (
              <div className="text-xs text-muted-foreground font-medium mt-1">
                ⚠️ Near Limit
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Clients - Delivery Progress</CardTitle>
            <CardDescription className="mt-1">
              Showing top {Math.min(10, stats.length)} clients by delivery volume
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              label={{ value: "Articles", position: "insideBottom", offset: -5, style: { textAnchor: "middle", fill: "hsl(var(--muted-foreground))" } }}
            />
            <YAxis
              type="category"
              dataKey="client"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
              width={180}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => {
                if (value === "delivered") return "Delivered";
                if (value === "limit") return "Monthly Limit";
                return value;
              }}
            />
            <Bar
              dataKey="delivered"
              name="delivered"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-delivered-${index}`}
                  fill={
                    entry.isAtLimit
                      ? COLORS.atLimit
                      : entry.isNearLimit
                      ? COLORS.nearLimit
                      : COLORS.delivered
                  }
                />
              ))}
            </Bar>
            <Bar
              dataKey="limit"
              name="limit"
              fill={COLORS.limit}
              radius={[0, 4, 4, 0]}
              opacity={0.3}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary"></div>
              <span>Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted opacity-50"></div>
              <span>Monthly Limit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive"></div>
              <span>At Limit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted-foreground"></div>
              <span>Near Limit (90%+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
