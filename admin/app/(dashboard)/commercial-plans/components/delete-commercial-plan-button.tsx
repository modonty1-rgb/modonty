"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * `AlertDialogAction` carries its own default (primary/blue) classes; wrapping it
 * asChild around a `<Button variant="destructive">` lets that default win the class
 * merge, so the confirm button silently rendered blue instead of red — the exact
 * color that should signal "this is dangerous". Styled directly via `buttonVariants`
 * instead, same fix applied to `ConfirmDeleteButton` (the term/feature case of this
 * pattern) in the same pass.
 */
export function DeleteCommercialPlanButton({ action, planName }: { action: () => Promise<void>; planName: string }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive">حذف الباقة</Button></AlertDialogTrigger><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف باقة «{planName}»؟</AlertDialogTitle><AlertDialogDescription>سيُحذف معها السعران والمدد والهدايا وربط المزايا. لا يمكن استرجاع العملية.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><form action={action}><AlertDialogAction type="submit" className={buttonVariants({ variant: "destructive" })}>نعم، احذف الباقة</AlertDialogAction></form></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
