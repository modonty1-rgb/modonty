import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock } from "lucide-react";

interface Props {
  articleId: string;
  actionLabel: string;
  hasErrors: boolean;
}

/**
 * When errors exist → disabled button (locked icon).
 * When clean → active link to Quality Check page where the actual transition is triggered.
 */
export function GatedTransitionButton({ articleId, actionLabel, hasErrors }: Props) {
  if (hasErrors) {
    return (
      <Button
        size="sm"
        variant="default"
        disabled
        className="whitespace-nowrap gap-1.5 cursor-not-allowed"
        title="Fix issues first — click the status pill to see details"
      >
        <Lock className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    );
  }

  return (
    <Link href={`/articles/workflow/quality-check/${articleId}`}>
      <Button size="sm" variant="default" className="whitespace-nowrap gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        {actionLabel}
      </Button>
    </Link>
  );
}
