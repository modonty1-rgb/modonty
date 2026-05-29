"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { seedTestSubscribersAction } from "../actions/seed-test-subscribers";

export function SeedTestSubscribersButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleSeed() {
    startTransition(async () => {
      const res = await seedTestSubscribersAction();
      if (res.ok) {
        toast({
          title: "Test subscribers seeded",
          description: `${res.created} created · ${res.updated} updated (modonty1+free/starter/growth/scale@gmail.com)`,
        });
        router.refresh();
      } else {
        toast({ title: "Seed failed", description: res.error, variant: "destructive" });
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSeed}
      disabled={pending}
      className="gap-1.5 border-dashed border-amber-500/50 text-amber-600 dark:text-amber-400"
      title="DEV only — seed 4 test subscribers (one per plan)"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
      Seed Test Subscribers
    </Button>
  );
}
