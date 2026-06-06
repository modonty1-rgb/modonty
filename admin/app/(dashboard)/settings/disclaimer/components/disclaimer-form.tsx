"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { saveDisclaimer } from "../actions/disclaimer-actions";
import { DEFAULT_DISCLAIMER_TEXT, type DisclaimerSettings } from "../disclaimer-constants";

export function DisclaimerForm({ initial }: { initial: DisclaimerSettings }) {
  const { toast } = useToast();
  const [text, setText] = useState(initial.text);
  const [version, setVersion] = useState(initial.version);
  const [savedText, setSavedText] = useState(initial.text);
  const [pending, startTransition] = useTransition();

  const isDirty = text.trim() !== savedText.trim();
  const willBump = isDirty && savedText.trim().length > 0;

  function handleSave() {
    startTransition(async () => {
      const res = await saveDisclaimer(text);
      if (!res.ok) {
        toast({ title: "Save failed", description: res.error, variant: "destructive" });
        return;
      }
      setSavedText(text);
      if (res.version) setVersion(res.version);
      toast({
        title: "Saved",
        description: res.version && res.version !== initial.version
          ? `Disclaimer updated — version bumped to ${res.version}. Clients will be re-prompted to accept.`
          : "Disclaimer text saved.",
      });
    });
  }

  return (
    <div className="space-y-5">
      {/* Version + re-prompt notice */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
          Version {version}
        </span>
        {willBump && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Saving will bump the version → all clients must re-accept
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="disclaimer-text">
          Disclaimer text (shown to clients in the console, RTL Arabic)
        </label>
        <Textarea
          id="disclaimer-text"
          dir="rtl"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="leading-relaxed"
        />
        <p className="text-[11px] text-amber-600">
          ⚠️ A lawyer should review the final wording before production — this default is operational, not legal advice.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setText(DEFAULT_DISCLAIMER_TEXT)}
          disabled={pending || text.trim() === DEFAULT_DISCLAIMER_TEXT.trim()}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to default
        </Button>
        <Button onClick={handleSave} disabled={pending || !isDirty} className="gap-1.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {pending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
