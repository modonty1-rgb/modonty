"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface TimePeriodFilterProps {
  currentPeriod: number;
}

export function TimePeriodFilter({ currentPeriod }: TimePeriodFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (days === 7) {
      params.delete('period');
    } else {
      params.set('period', days.toString());
    }
    
    startTransition(() => {
      router.push(`/trending?${params.toString()}`);
    });
  };

  const periods = [
    { days: 7, label: '7 أيام' },
    { days: 14, label: '14 يوم' },
    { days: 30, label: '30 يوم' },
  ];

  return (
    <div className="flex gap-2 items-center mb-6">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex border rounded-lg overflow-hidden">
        {periods.map((period) => (
          <Button
            key={period.days}
            variant={currentPeriod === period.days ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodChange(period.days)}
            disabled={isPending}
            className="rounded-none px-4"
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
