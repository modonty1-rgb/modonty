import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={actionOnClick}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
