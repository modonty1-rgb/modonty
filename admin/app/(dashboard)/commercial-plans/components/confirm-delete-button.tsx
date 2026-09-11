"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Generic destructive-confirm button for this route family (list + [id] detail).
 * `DeleteCommercialPlanButton` is the plan-level case of this same pattern; term
 * and feature deletes need the identical guard — a one-click "حذف" with no undo
 * is the anti-pattern this component removes.
 *
 * The confirm action is `<AlertDialogAction>` styled directly with
 * `buttonVariants({ variant: "destructive" })` rather than wrapped as
 * `asChild` around a `<Button variant="destructive">`: AlertDialogAction's own
 * default classes (primary/blue) and the inner Button's destructive classes
 * both land on the same element, and the wrong one can win the merge — the
 * confirm button silently renders in the affirmative blue instead of red,
 * which is exactly the color that should signal "this is dangerous".
 */
export function ConfirmDeleteButton({ action, triggerLabel, confirmLabel, title, description, size = "default", className }: { action: () => Promise<void>; triggerLabel: string; confirmLabel: string; title: string; description: string; size?: "default" | "sm"; className?: string }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" size={size} className={className}>{triggerLabel}</Button></AlertDialogTrigger><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><form action={action}><AlertDialogAction type="submit" className={buttonVariants({ variant: "destructive" })}>{confirmLabel}</AlertDialogAction></form></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
