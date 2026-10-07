"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconBell, IconLoading } from "@/lib/icons";
import { ALERT_CHANNELS, ALERT_TOPICS, PHONE_CHANNELS, type AlertChannelId, type AlertTopicId } from "@/lib/users/alert-topics";
import { DIAL_CODES, OTHER_DIAL } from "../helpers/dial-codes";

import { getAlertSettings, updateAlertSettings } from "../actions";
import type { AlertSettings } from "../helpers/schemas/alerts-schema";

/**
 * «التنبيهات» — what the reader wants to hear about, and on which channel (Khalid, 27 Sep 2026:
 * the profile is what everything else builds on). The phone field shows only once WhatsApp is
 * chosen, and only then is it required. Pages record consent themselves (registration box, «نبّهني»);
 * this is where a reader adds WhatsApp or stops an alert.
 */
export function AlertsSettings() {
  const [data, setData] = useState<AlertSettings | null>(null);
  const [topics, setTopics] = useState<Partial<Record<AlertTopicId, AlertChannelId[]>>>({});
  const [marketing, setMarketing] = useState(false);
  const [phone, setPhone] = useState("");
  const [dial, setDial] = useState<string>(DIAL_CODES[0].code);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const messageRef = useRef<HTMLParagraphElement>(null);

  // The phone's bottom bar sits over the end of the form — bring the result to the middle of the
  // screen so a failed save is never silent.
  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    getAlertSettings().then((res) => {
      if (!res.success) return;
      setData(res.data);
      setMarketing(res.data.marketingEmails);
      // A saved number is split back into its country and local part, so the field shows it the way
      // it was typed; a code outside the list opens «دولة أخرى» with the full number.
      const saved = res.data.phone ?? "";
      const match = DIAL_CODES.find((d) => saved.startsWith(`+${d.code}`));
      setDial(saved && !match ? OTHER_DIAL : (match?.code ?? DIAL_CODES[0].code));
      setPhone(match ? saved.slice(match.code.length + 1) : saved);
      setTopics(res.data.topics);
    });
  }, []);

  const toggleTopic = (id: AlertTopicId, on: boolean) => {
    setTopics((t) => ({ ...t, [id]: on ? (t[id]?.length ? t[id] : ["email"]) : [] }));
  };
  const toggleChannel = (id: AlertTopicId, channel: AlertChannelId, on: boolean) => {
    setTopics((t) => {
      const current = t[id] ?? [];
      const next = on ? [...new Set([...current, channel])] : current.filter((c) => c !== channel);
      return { ...t, [id]: next };
    });
  };

  const needsPhone = Object.values(topics).some((list) => list?.some((c) => PHONE_CHANNELS.includes(c)));

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const res = await updateAlertSettings({ marketingEmails: marketing, topics, phoneDial: dial, phone: needsPhone ? phone : "" });
      if (res.success) {
        setMessage({ ok: true, text: "تم حفظ تنبيهاتك" });
      } else {
        setMessage({ ok: false, text: res.error ?? "تعذّر الحفظ" });
      }
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IconBell className="size-5 text-primary" aria-hidden />
          التنبيهات
        </CardTitle>
        <p className="text-sm text-muted-foreground">اختر وش يهمّك، وكيف نوصل لك.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {!data ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconLoading className="size-4 animate-spin" aria-hidden /> جاري التحميل…
          </p>
        ) : (
          <>
            {ALERT_TOPICS.map((topic) => {
              const channels = topics[topic.id] ?? [];
              const on = channels.length > 0;
              return (
                <div key={topic.id} className="rounded-lg p-3 ring-1 ring-border">
                  <label className="flex cursor-pointer items-start gap-3">
                    <Checkbox checked={on} onCheckedChange={(v) => toggleTopic(topic.id, v === true)} className="mt-0.5" />
                    <span>
                      <span className="block font-medium">{topic.label}</span>
                      <span className="block text-sm text-muted-foreground">{topic.hint}</span>
                    </span>
                  </label>
                  {on && (
                    <fieldset className="mt-3 ps-7">
                      <legend className="mb-2 text-sm text-muted-foreground">وين نوصل لك؟</legend>
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {ALERT_CHANNELS.map((c) => (
                          <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                            <Checkbox checked={channels.includes(c.id)} onCheckedChange={(v) => toggleChannel(topic.id, c.id, v === true)} />
                            {c.label}
                          </label>
                        ))}
                      </div>
                      {channels.includes("email") && data.email && (
                        <p className="mt-2 text-xs text-muted-foreground" dir="auto">
                          على {data.email}
                        </p>
                      )}
                    </fieldset>
                  )}
                </div>
              );
            })}

            {needsPhone && (
              <div className="space-y-1.5">
                <Label htmlFor="alerts-phone">رقم الجوال</Label>
                <div className="flex max-w-sm gap-2" dir="ltr">
                  <select
                    aria-label="الدولة"
                    value={dial}
                    onChange={(e) => {
                      setDial(e.target.value);
                    }}
                    className="h-10 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {DIAL_CODES.map((d) => (
                      <option key={d.iso} value={d.code}>
                        +{d.code} {d.name}
                      </option>
                    ))}
                    <option value={OTHER_DIAL}>دولة أخرى</option>
                  </select>
                  <Input
                    id="alerts-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={dial === OTHER_DIAL ? "+44 7XXX XXXXXX" : "5XXXXXXXX"}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                    }}
                    className="min-w-0 flex-1 text-start"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {dial === OTHER_DIAL ? "اكتب الرقم كامل مع مفتاح دولتك، مثل +44…" : "لواتساب فقط."}
                </p>
              </div>
            )}

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-3 ring-1 ring-border">
              <span>
                <span className="block font-medium">أخبار ومقالات مدونتي</span>
                <span className="block text-sm text-muted-foreground">رسائل على الإيميل بالجديد، تقدر توقفها متى ما تبي</span>
              </span>
              <Switch
                checked={marketing}
                onCheckedChange={(v) => {
                  setMarketing(v);
                }}
              />
            </label>

            {/* Above the button, not beside it: on a 360px phone the side slot wrapped below the
                button, under the bottom bar — the reader saw nothing happen (measured 27 Sep 2026). */}
            {message && (
              <p
                ref={messageRef}
                role="status"
                className={message.ok ? "rounded-md bg-emerald-50 p-2.5 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "rounded-md bg-destructive/10 p-2.5 text-sm text-destructive"}
              >
                {message.text}
              </p>
            )}
            <Button onClick={save} disabled={isPending}>
              {isPending ? <IconLoading className="size-4 animate-spin" aria-hidden /> : null}
              حفظ التنبيهات
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
