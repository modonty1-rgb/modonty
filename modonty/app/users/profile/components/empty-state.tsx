import Link from "@/components/link";
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
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
