"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ar } from "@/lib/ar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Link as LinkIcon,
  Unlink,
  Copy,
  CheckCircle2,
  Bell,
} from "lucide-react";
import {
  TELEGRAM_EVENTS,
  TELEGRAM_EVENT_GROUPS,
  type TelegramEventGroup,
  type TelegramEventKey,
  type TelegramEventPreferences,
} from "@/lib/telegram/events";
import {
  generateTelegramPairingCodeAction,
  disconnectTelegramAction,
  updateTelegramEventPreferencesAction,
  sendTelegramTestMessageAction,
} from "../actions/telegram-actions";

interface Props {
  isConnected: boolean;
  connectedAt: Date | null;
  initialPrefs: TelegramEventPreferences | null;
  botUsername: string | null;
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function TelegramCard({
  isConnected,
  connectedAt,
  initialPrefs,
  botUsername,
}: Props) {
  const t = ar.telegram;
  const [pairingCode, setPairingCode] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [prefs, setPrefs] = useState<TelegramEventPreferences>(
    initialPrefs ?? {}
  );
  const [isPending, startTransition] = useTransition();
  const [savingPrefs, setSavingPrefs] = useState(false);

  function handleGenerate() {
    startTransition(async () => {
      const res = await generateTelegramPairingCodeAction();
      if (res.success) {
        setPairingCode({ code: res.code, expiresAt: res.expiresAt });
        toast.success(t.codeGenerated);
      } else {
        toast.error(res.error || t.testFailed);
      }
    });
  }

  function handleDisconnect() {
    toast(t.disconnectConfirm, {
      duration: 8000,
      action: {
        label: t.disconnect,
        onClick: () => {
          startTransition(async () => {
            const res = await disconnectTelegramAction();
            if (res.success) {
              toast.success(t.disconnected);
              setPairingCode(null);
            } else {
              toast.error(res.error || t.testFailed);
            }
          });
        },
      },
      cancel: { label: ar.comments.cancel ?? "إلغاء", onClick: () => {} },
    });
  }

  function handleTest() {
    startTransition(async () => {
      const res = await sendTelegramTestMessageAction();
      if (res.success) toast.success(t.testSent);
      else toast.error(res.error || t.testFailed);
    });
  }

  function handleCopyCode() {
    if (!pairingCode) return;
    navigator.clipboard
      .writeText(pairingCode.code)
      .then(() => toast.success(t.codeCopied))
      .catch(() => toast.error(t.testFailed));
  }

  function togglePref(key: TelegramEventKey, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  function setAllInGroup(group: TelegramEventGroup, value: boolean) {
    setPrefs((p) => {
      const next = { ...p };
      for (const ev of TELEGRAM_EVENTS) {
        if (ev.group === group) next[ev.key] = value;
      }
      return next;
    });
  }

  function handleSavePrefs() {
    setSavingPrefs(true);
    startTransition(async () => {
      const res = await updateTelegramEventPreferencesAction(prefs);
      setSavingPrefs(false);
      if (res.success) toast.success(t.eventsSaved);
      else toast.error(res.error || t.eventsSaveFailed);
    });
  }

  const botLink = botUsername ? `https://t.me/${botUsername}` : null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Send className="h-4 w-4 text-primary" />
          {t.cardTitle}
          <StatusBadge isConnected={isConnected} />
        </CardTitle>
        <CardDescription>{t.cardHint}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!isConnected && (
          <ConnectFlow
            pairingCode={pairingCode}
            isPending={isPending}
            botLink={botLink}
            onGenerate={handleGenerate}
            onCopy={handleCopyCode}
          />
        )}

        {isConnected && (
          <ConnectedSummary
            connectedAt={connectedAt}
            isPending={isPending}
            onTest={handleTest}
            onDisconnect={handleDisconnect}
          />
        )}

        <EventPreferences
          prefs={prefs}
          isConnected={isConnected}
          onToggle={togglePref}
          onGroupBulk={setAllInGroup}
          onSave={handleSavePrefs}
          saving={savingPrefs}
        />
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatusBadge({ isConnected }: { isConnected: boolean }) {
  const t = ar.telegram;
  return isConnected ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
      <CheckCircle2 className="h-3 w-3" />
      {t.statusConnected}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
      {t.statusDisconnected}
    </span>
  );
}

function ConnectFlow({
  pairingCode,
  isPending,
  botLink,
  onGenerate,
  onCopy,
}: {
  pairingCode: { code: string; expiresAt: string } | null;
  isPending: boolean;
  botLink: string | null;
  onGenerate: () => void;
  onCopy: () => void;
}) {
  const t = ar.telegram;

  return (
    <div className="space-y-4">
      <ol className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
        <li className="flex items-start gap-2">
          <span className="font-semibold text-primary">1.</span>
          <span>
            {t.pairingStep1}{" "}
            {botLink ? (
              <a
                href={botLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
                dir="ltr"
              >
                {botLink}
              </a>
            ) : (
              <span className="text-muted-foreground">{t.notConfigured}</span>
            )}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-semibold text-primary">2.</span>
          <span>{t.pairingStep2}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-semibold text-primary">3.</span>
          <span>{t.pairingStep3}</span>
        </li>
      </ol>

      {!pairingCode && (
        <Button
          onClick={onGenerate}
          disabled={isPending || !botLink}
          className="gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          {t.generateCode}
        </Button>
      )}

      {pairingCode && (
        <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
          <p className="text-xs text-muted-foreground">{t.pairingCode}</p>
          <div className="flex items-center justify-between gap-3">
            <p
              className="text-3xl font-bold tracking-[0.4em] tabular-nums text-foreground"
              dir="ltr"
            >
              {pairingCode.code}
            </p>
            <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              نسخ
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {t.pairingExpires}{" "}
            <span className="tabular-nums" dir="ltr">
              {formatDate(new Date(pairingCode.expiresAt))}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function ConnectedSummary({
  connectedAt,
  isPending,
  onTest,
  onDisconnect,
}: {
  connectedAt: Date | null;
  isPending: boolean;
  onTest: () => void;
  onDisconnect: () => void;
}) {
  const t = ar.telegram;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-emerald-50/50 p-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{t.statusConnected}</p>
        {connectedAt && (
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {t.connectedSince} {formatDate(connectedAt)}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onTest}
          disabled={isPending}
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          {t.sendTest}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDisconnect}
          disabled={isPending}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Unlink className="h-3.5 w-3.5" />
          {t.disconnect}
        </Button>
      </div>
    </div>
  );
}

function EventPreferences({
  prefs,
  isConnected,
  onToggle,
  onGroupBulk,
  onSave,
  saving,
}: {
  prefs: TelegramEventPreferences;
  isConnected: boolean;
  onToggle: (key: TelegramEventKey, value: boolean) => void;
  onGroupBulk: (group: TelegramEventGroup, value: boolean) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const t = ar.telegram;
  const groups: TelegramEventGroup[] = ["article", "clientPage", "direct"];

  return (
    <div className="space-y-5 border-t pt-5">
      <div className="flex items-start gap-2">
        <Bell className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold">{t.eventsTitle}</h3>
          <p className="text-xs text-muted-foreground">{t.eventsHint}</p>
        </div>
      </div>

      {!isConnected && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Bell className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-xs leading-relaxed text-amber-900">
            {t.eventsPickBeforePair}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {groups.map((group) => {
          const groupEvents = TELEGRAM_EVENTS.filter((e) => e.group === group);
          const groupCfg = TELEGRAM_EVENT_GROUPS[group];
          const allOn = groupEvents.every((e) => prefs[e.key] === true);
          const allOff = groupEvents.every((e) => prefs[e.key] !== true);
          return (
            <section key={group} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {groupCfg.label}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {groupCfg.description}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onGroupBulk(group, true)}
                    disabled={allOn}
                    className="h-7 px-2 text-[11px]"
                  >
                    {t.selectAll}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onGroupBulk(group, false)}
                    disabled={allOff}
                    className="h-7 px-2 text-[11px]"
                  >
                    {t.selectNone}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {groupEvents.map((ev) => (
                  <label
                    key={ev.key}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{ev.emoji}</span>
                      <span>{ev.label}</span>
                    </span>
                    <Checkbox
                      checked={prefs[ev.key] === true}
                      onCheckedChange={(v) => onToggle(ev.key, v === true)}
                    />
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "…" : ar.settings.save}
        </Button>
      </div>
    </div>
  );
}
