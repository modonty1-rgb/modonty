import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  iconWrapperClassName?: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function EmptyState({
  icon: Icon,
  iconWrapperClassName,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className={cn("rounded-full bg-muted p-4 mb-4 text-muted-foreground", iconWrapperClassName)}>
          <Icon className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {/* `min-h-11`: measured 24 Aug on `/users/profile/liked` at 390 — the button came out
            147×40, the only sub-44 target on the page, and it is the ONE way out of an empty
            screen. One component serves all six profile children, so the fix lands on all of
            them at once. */}
        <Link href={actionHref} className="inline-flex">
          <Button className="min-h-11">{actionLabel}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
