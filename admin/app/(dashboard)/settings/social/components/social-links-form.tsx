"use client";

import { useState, useTransition, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateAllSettings, type AllSettings } from "../../actions/settings-actions";
import { Section } from "../../_shared/section";
import { Field } from "../../_shared/field";
import { StatusBadge } from "../../_shared/status-badge";

interface Props {
  initialSettings: AllSettings;
}

// Small grouping sub-header — same visual as the Modonty Homepage form.
function GroupHeader({ icon, title, note, tone }: { icon: string; title: string; note?: string; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-6 w-6 place-items-center rounded-md text-xs ${tone}`}>{icon}</span>
      <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
      {note && <span className="text-[11px] text-muted-foreground">— {note}</span>}
    </div>
  );
}

// Social profile URLs (sameAs) + X card handles — moved out of the Modonty
// Homepage form into its own settings area. Saves ONLY these fields.
const SOCIAL_FIELDS = [
  "twitterUrl", "linkedInUrl", "facebookUrl", "instagramUrl", "youtubeUrl",
  "tiktokUrl", "pinterestUrl", "snapchatUrl", "whatsappChannelUrl", "telegramChannelUrl",
  "twitterSite", "twitterCreator",
] as const satisfies readonly (keyof AllSettings)[];

const norm = (v: unknown) => (v === undefined || v === null ? "" : v);

export function SocialLinksForm({ initialSettings }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  // Snapshot of what's persisted — dirty = fields differ from this.
  const [savedSnapshot, setSavedSnapshot] = useState<AllSettings>(initialSettings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSaving, startSaving] = useTransition();

  const set = useCallback(<K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const dirty = SOCIAL_FIELDS.some((f) => norm(settings[f]) !== norm(savedSnapshot[f]));

  function handleSave() {
    startSaving(async () => {
      const scoped: Partial<AllSettings> = {};
      for (const f of SOCIAL_FIELDS) {
        (scoped as Record<string, unknown>)[f] = (settings as unknown as Record<string, unknown>)[f];
      }
      const r = await updateAllSettings(scoped);
      if (!r.success) {
        toast({ title: messages.error.update_failed, description: r.error || "فشل حفظ الإعدادات", variant: "destructive" });
        return;
      }
      setSavedSnapshot((prev) => ({ ...prev, ...scoped }));
      setSavedAt(new Date());
      toast({ title: messages.success.saved, description: "يجري تحديث المحتوى في الخلفية.", variant: "success" });
    });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Section
        title="Social Links"
        description="Links to your accounts on each network (shown in the footer + Organization sameAs) and your X handles for share cards."
      >
        {/* Social profiles */}
        <div className="space-y-3">
          <GroupHeader icon="🔗" title="Social profiles" note="footer links + Organization sameAs" tone="bg-primary/10 text-primary" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Twitter / X">
              <Input value={settings.twitterUrl ?? ""} onChange={(e) => set("twitterUrl", e.target.value)} placeholder="https://x.com/modonty" />
            </Field>
            <Field label="LinkedIn">
              <Input value={settings.linkedInUrl ?? ""} onChange={(e) => set("linkedInUrl", e.target.value)} placeholder="https://linkedin.com/company/modonty" />
            </Field>
            <Field label="Facebook">
              <Input value={settings.facebookUrl ?? ""} onChange={(e) => set("facebookUrl", e.target.value)} placeholder="https://facebook.com/modonty" />
            </Field>
            <Field label="Instagram">
              <Input value={settings.instagramUrl ?? ""} onChange={(e) => set("instagramUrl", e.target.value)} placeholder="https://instagram.com/modonty" />
            </Field>
            <Field label="YouTube">
              <Input value={settings.youtubeUrl ?? ""} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/@modonty" />
            </Field>
            <Field label="TikTok">
              <Input value={settings.tiktokUrl ?? ""} onChange={(e) => set("tiktokUrl", e.target.value)} placeholder="https://tiktok.com/@modonty" />
            </Field>
            <Field label="Pinterest">
              <Input value={settings.pinterestUrl ?? ""} onChange={(e) => set("pinterestUrl", e.target.value)} placeholder="https://pinterest.com/modonty" />
            </Field>
            <Field label="Snapchat">
              <Input value={settings.snapchatUrl ?? ""} onChange={(e) => set("snapchatUrl", e.target.value)} placeholder="https://snapchat.com/add/modonty" />
            </Field>
            <Field label="WhatsApp Channel">
              <Input value={settings.whatsappChannelUrl ?? ""} onChange={(e) => set("whatsappChannelUrl", e.target.value)} placeholder="https://whatsapp.com/channel/..." />
            </Field>
            <Field label="Telegram Channel">
              <Input value={settings.telegramChannelUrl ?? ""} onChange={(e) => set("telegramChannelUrl", e.target.value)} placeholder="https://t.me/modonty" />
            </Field>
          </div>
        </div>

        {/* X / Twitter card handles */}
        <div className="space-y-3 border-t border-border pt-4">
          <GroupHeader icon="🐦" title="X / Twitter card handles" note="used in the Twitter Card meta" tone="bg-sky-500/15 text-sky-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="X Site Handle" hint="Used in the Twitter Card meta tag.">
              <Input value={settings.twitterSite ?? ""} onChange={(e) => set("twitterSite", e.target.value)} placeholder="@modonty" />
            </Field>
            <Field label="X Creator Handle" hint="Author/creator handle for Twitter Cards.">
              <Input value={settings.twitterCreator ?? ""} onChange={(e) => set("twitterCreator", e.target.value)} placeholder="@modonty" />
            </Field>
          </div>
        </div>

        {/* Save footer — bleeds to the Section card edges. */}
        <div className="-mx-5 -mb-5 mt-1 flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3.5">
          <StatusBadge isDirty={dirty} isSaving={isSaving} savedAt={savedAt} />
          <Button onClick={handleSave} disabled={isSaving || !dirty} size="sm" className="h-8 gap-1.5">
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isSaving ? "Saving..." : "Save Social"}
          </Button>
        </div>
      </Section>
    </TooltipProvider>
  );
}
