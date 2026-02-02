"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

type Preset = "today" | "7d" | "30d" | "90d" | "custom";

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<Preset>("30d");
  const [startDate, setStartDate] = useState<Date | null>(
    startOfDay(subDays(new Date(), 30))
  );
  const [endDate, setEndDate] = useState<Date | null>(endOfDay(new Date()));

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = endOfDay(today);

    switch (preset) {
      case "today":
        start = startOfDay(today);
        break;
      case "7d":
        start = startOfDay(subDays(today, 7));
        break;
      case "30d":
        start = startOfDay(subDays(today, 30));
        break;
      case "90d":
        start = startOfDay(subDays(today, 90));
        break;
      case "custom":
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const date = value ? new Date(value) : null;
    if (type === "start") {
      setStartDate(date ? startOfDay(date) : null);
      setActivePreset("custom");
      onDateRangeChange(date ? startOfDay(date) : null, endDate);
    } else {
      setEndDate(date ? endOfDay(date) : null);
      setActivePreset("custom");
      onDateRangeChange(startDate, date ? endOfDay(date) : null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Date Range</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={activePreset === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset("today")}
        >
          Today
        </Button>
        <Button
          variant={activePreset === "7d" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset("7d")}
        >
          Last 7 days
        </Button>
        <Button
          variant={activePreset === "30d" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset("30d")}
        >
          Last 30 days
        </Button>
        <Button
          variant={activePreset === "90d" ? "default" : "outline"}
          size="sm"
          onClick={() => handlePreset("90d")}
        >
          Last 90 days
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
          onChange={(e) => handleCustomDateChange("start", e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-md bg-background"
          max={endDate ? format(endDate, "yyyy-MM-dd") : undefined}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <input
          type="date"
          value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
          onChange={(e) => handleCustomDateChange("end", e.target.value)}
          className="px-3 py-1.5 text-sm border rounded-md bg-background"
          min={startDate ? format(startDate, "yyyy-MM-dd") : undefined}
          max={format(new Date(), "yyyy-MM-dd")}
        />
      </div>
    </div>
  );
}
