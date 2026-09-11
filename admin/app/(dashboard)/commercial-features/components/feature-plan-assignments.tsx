"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Save } from "lucide-react";
import { setCommercialFeaturePlanAssignments } from "../../commercial-plans/actions";

type PlanOption = { id: string; name: string };

export function FeaturePlanAssignments({ featureId, plans, assignedPlanIds }: { featureId: string; plans: PlanOption[]; assignedPlanIds: string[] }) {
  return <TooltipProvider delayDuration={200}>
    <form action={setCommercialFeaturePlanAssignments.bind(null, featureId)} className="flex flex-wrap items-center gap-3">
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="sr-only">الباقات التي تتضمن هذه الميزة</legend>
        {plans.map((plan) => {
          const inputId = `${featureId}-${plan.id}`;
          return <div key={plan.id} className="flex items-center gap-2">
            <Checkbox id={inputId} name="planIds" value={plan.id} defaultChecked={assignedPlanIds.includes(plan.id)} />
            <label htmlFor={inputId} className="cursor-pointer text-sm">{plan.name}</label>
          </div>;
        })}
      </fieldset>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="submit" size="icon" className="size-8" variant="outline" aria-label="حفظ الباقات">
            <Save data-icon="inline-start" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>حفظ الباقات</TooltipContent>
      </Tooltip>
    </form>
  </TooltipProvider>;
}
