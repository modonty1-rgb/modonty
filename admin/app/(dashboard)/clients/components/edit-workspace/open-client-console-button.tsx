"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { openClientConsoleAction } from "../../actions/clients-actions/open-client-console";

/**
 * Opens the client's console AS the client (admin handoff) in a new tab.
 * Inline button — sits beside Save in the form footer.
 */
export function OpenClientConsoleButton({ clientId }: { clientId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    // Open the tab SYNCHRONOUSLY (inside the click gesture) so it isn't popup-blocked;
    // then redirect it to the signed URL once the server action returns.
    const tab = window.open("about:blank", "_blank");
    setLoading(true);
    try {
      const res = await openClientConsoleAction(clientId);
      if ("url" in res) {
        if (tab) tab.location.href = res.url;
        else window.location.href = res.url; // popup blocked → same-tab fallback
      } else {
        tab?.close();
        toast({ title: "Couldn't open console", description: res.error, variant: "destructive" });
      }
    } catch {
      tab?.close();
      toast({ title: "Couldn't open console", description: "Unexpected error — try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={loading} onClick={handleOpen}>
      {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-1.5" />}
      Open Client Console
    </Button>
  );
}
