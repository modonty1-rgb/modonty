"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { linkRenewalToClientAction } from "../actions/link-renewal-to-client";

/** A renewal of an existing account: one press joins the order to it — no second account. */
export function LinkRenewalButton({ orderId, clientName }: { orderId: string; clientName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    start(async () => {
      const res = await linkRenewalToClientAction(orderId);
      if (!res.ok) {
        setError(res.error);
        toast({ variant: "destructive", title: "لم يُربط", description: res.error });
        return;
      }
      toast({ title: "رُبط التجديد", description: `صار الطلب على حساب «${clientName}» وامتدّ اشتراكه.` });
      router.push(`/clients/${res.clientId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {error}
        </p>
      )}
      <Button onClick={run} disabled={pending} size="lg" className="w-full gap-2 sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {pending ? "جاري الربط…" : "ربط بالعميل القائم"}
      </Button>
    </div>
  );
}
