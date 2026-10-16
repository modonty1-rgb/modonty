"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { setTaxonomyArchived, type TaxonomyKind } from "@/lib/taxonomy-archive/set-taxonomy-archived";

const ONE: Record<TaxonomyKind, string> = { category: "التصنيف", tag: "الوسم", industry: "الصناعة" };

export function ArchiveTaxonomyButton({
  kind,
  id,
  name,
  archived,
  blockers,
}: {
  kind: TaxonomyKind;
  id: string;
  name: string;
  archived: boolean;
  blockers: string[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const blocked = !archived && blockers.length > 0;

  const run = () =>
    startTransition(async () => {
      const r = await setTaxonomyArchived(kind, id, !archived);
      if (r.success) {
        toast({ title: archived ? "رجع للموقع" : "انأرشف", description: r.message, variant: "success" });
        router.refresh();
      } else {
        toast({ title: archived ? "ما رجع" : "ما انأرشف", description: r.error, variant: "destructive" });
      }
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={pending || blocked}>
            {archived ? <ArchiveRestore className="h-3.5 w-3.5 me-1.5" /> : <Archive className="h-3.5 w-3.5 me-1.5" />}
            {archived ? "رجّعه للموقع" : "أرشفه"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle>{archived ? `ترجّع ${ONE[kind]} «${name}» للموقع؟` : `تأرشف ${ONE[kind]} «${name}»؟`}</AlertDialogTitle>
            <AlertDialogDescription>
              {archived
                ? "يرجع رابطه يشتغل ويظهر في الموقع والقوائم من جديد."
                : "يختفي من الموقع والقوائم، ورابطه يرجع لجوجل «410 محذوف» خلال ٥ دقايق. تقدر ترجّعه من هنا وقت ما تبغى، والحذف النهائي يكون من الأدمن."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={run}>{archived ? "نعم، رجّعه" : "نعم، أرشفه"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {blocked ? (
        <p className="max-w-xs text-end text-xs text-amber-700 dark:text-amber-400" dir="rtl">
          ما يتأرشف: {blockers.join(" · ")}
        </p>
      ) : archived ? (
        <p className="text-xs text-muted-foreground" dir="rtl">مؤرشف — مخفيّ من الموقع</p>
      ) : null}
    </div>
  );
}
