"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CircleAlert, FlaskConical, Loader2, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import metaSeed from "@/lib/settings/advertising-platforms.seed.json";

import { type AdvertisingPlatformAccounts, saveAdvertisingPlatformAccounts, saveAdvertisingPlatformCredentials, testMetaConnection } from "./actions";

type BrandKey = keyof AdvertisingPlatformAccounts["meta"];
type SharedKey = keyof AdvertisingPlatformAccounts["shared"];

const META_BRANDS: { key: BrandKey; name: string }[] = [
  { key: "modonty", name: "مدونتي" },
  { key: "jbrseo", name: "جبر SEO" },
];

const SHARED_PLATFORMS: {
  key: SharedKey;
  name: string;
  accountLabel: string;
  managerLabel: string;
}[] = [
  { key: "tiktok", name: "تيك توك", accountLabel: "Advertiser ID", managerLabel: "Business Center ID" },
  { key: "snapchat", name: "سناب شات", accountLabel: "معرّف حساب الإعلانات", managerLabel: "معرّف المؤسسة" },
  { key: "google", name: "جوجل", accountLabel: "Customer ID", managerLabel: "Manager Account ID" },
];

export function AdvertisingPlatformsForm({
  initial,
  credentialsReady,
  initialCredentials,
}: {
  initial: AdvertisingPlatformAccounts;
  credentialsReady: Record<SharedKey, boolean> & { meta: Record<BrandKey, boolean> };
  initialCredentials: { meta: { appId: string; appSecret: string; tokens: Record<BrandKey, string> } };
}) {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState({ ...initial, meta: { ...initial.meta, modonty: { accountId: initial.meta.modonty.accountId || metaSeed.meta.brands.modonty.adAccountId, managerId: initial.meta.modonty.managerId || metaSeed.meta.businessManagerId }, jbrseo: { accountId: initial.meta.jbrseo.accountId || metaSeed.meta.brands.jbrseo.adAccountId, managerId: initial.meta.jbrseo.managerId || metaSeed.meta.brands.jbrseo.businessManagerId } } });
  const [credentials, setCredentials] = useState({ meta: { appId: initialCredentials.meta.appId || metaSeed.meta.appId, appSecret: initialCredentials.meta.appSecret, tokens: { modonty: initialCredentials.meta.tokens.modonty, jbrseo: initialCredentials.meta.tokens.jbrseo } }, tiktok: { appId: "", appSecret: "", accessToken: "", refreshToken: "" }, snapchat: { clientId: "", clientSecret: "", accessToken: "", refreshToken: "" }, google: { clientId: "", clientSecret: "", developerToken: "", refreshToken: "" } });
  const [pending, startTransition] = useTransition();

  function setMeta(brand: BrandKey, field: "accountId" | "managerId", value: string) {
    setAccounts((current) => ({ ...current, meta: { ...current.meta, [brand]: { ...current.meta[brand], [field]: value } } }));
  }

  function setShared(platform: SharedKey, field: "accountId" | "managerId", value: string) {
    setAccounts((current) => ({ ...current, shared: { ...current.shared, [platform]: { ...current.shared[platform], [field]: value } } }));
  }

  function save() {
    startTransition(async () => {
      // Normalize older saved documents before sending the strict server schema.
      const result = await saveAdvertisingPlatformAccounts({
        meta: {
          modonty: accounts.meta.modonty ?? { accountId: null, managerId: null },
          jbrseo: accounts.meta.jbrseo ?? { accountId: null, managerId: null },
        },
        shared: {
          tiktok: accounts.shared.tiktok ?? { accountId: null, managerId: null },
          snapchat: accounts.shared.snapchat ?? { accountId: null, managerId: null },
          google: accounts.shared.google ?? { accountId: null, managerId: null },
        },
      });
      toast(result.ok ? { title: "تم حفظ حسابات الإعلان" } : { title: "لم يُحفظ التعديل", description: result.error, variant: "destructive" });
    });
  }
  function saveCredentials() { startTransition(async () => { const result = await saveAdvertisingPlatformCredentials(credentials); toast(result.ok ? { title: "تم حفظ مفاتيح API" } : { title: "لم يُحفظ التعديل", description: result.error, variant: "destructive" }); }); }
  function testMeta(brand: BrandKey) { startTransition(async () => { const result = await testMetaConnection({ accountId: accounts.meta[brand].accountId ?? "", accessToken: credentials.meta.tokens[brand] }); toast(result.ok ? { title: "تم الاتصال بميتا", description: `${result.account.name || "الحساب"} · ${result.account.currency || ""}` } : { title: "فشل اختبار الاتصال", description: result.error, variant: "destructive" }); }); }

  return (
    <div dir="rtl" className="flex max-w-5xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>ميتا — فيسبوك وإنستغرام</CardTitle>
          <CardDescription>حساب منفصل لكل علامة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {META_BRANDS.map((brand) => {
            const account = accounts.meta[brand.key];
            const ready = Boolean(account.accountId?.trim()) && credentialsReady.meta[brand.key];
            return (
              <section key={brand.key} className="flex flex-col gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">{brand.name}</h2>
                  <Badge variant={ready ? "default" : "secondary"}>{ready ? "جاهز" : "يحتاج إعدادًا"}</Badge>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`meta-${brand.key}-account`}>معرّف الحساب الإعلاني</Label>
                  <Input id={`meta-${brand.key}-account`} dir="ltr" value={account.accountId ?? ""} onChange={(event) => setMeta(brand.key, "accountId", event.target.value)} placeholder="غير مضاف بعد" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`meta-${brand.key}-manager`}>Business Manager <span className="text-muted-foreground">اختياري</span></Label>
                  <Input id={`meta-${brand.key}-manager`} dir="ltr" value={account.managerId ?? ""} onChange={(event) => setMeta(brand.key, "managerId", event.target.value)} placeholder="غير مضاف بعد" />
                </div>
                {/* التوكن داخل بطاقة علامته لا في الكرت المشترك: يصدر عن مستخدمٍ نظاميّ داخل
                    محفظة أعمال هذه العلامة وحدها (مدونتي 61583458896568 · جبر 61592645941942)،
                    فخانةٌ مشتركة تجعل حفظ أحدهما يمحو الآخر. */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`meta-${brand.key}-token`}>System User Access Token</Label>
                  <Input
                    id={`meta-${brand.key}-token`}
                    dir="ltr"
                    value={credentials.meta.tokens[brand.key]}
                    onChange={(event) =>
                      setCredentials((current) => ({
                        ...current,
                        meta: { ...current.meta, tokens: { ...current.meta.tokens, [brand.key]: event.target.value } },
                      }))
                    }
                    placeholder="غير مضاف بعد"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={saveCredentials} disabled={pending}>
                    <Save data-icon="inline-start" />حفظ
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => testMeta(brand.key)} disabled={pending}>
                    <FlaskConical data-icon="inline-start" />اختبار الاتصال
                  </Button>
                </div>
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات Meta المشتركة</CardTitle>
          <CardDescription>تُستخدم مع مدونتي وجبر SEO؛ عدّلها مرة واحدة هنا.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5"><Label>Meta App ID</Label><Input dir="ltr" value={credentials.meta.appId} onChange={(event) => setCredentials((current) => ({ ...current, meta: { ...current.meta, appId: event.target.value } }))} placeholder="App ID" /></div>
          <div className="flex flex-col gap-1.5"><Label>Meta App Secret</Label><Input dir="ltr" value={credentials.meta.appSecret} onChange={(event) => setCredentials((current) => ({ ...current, meta: { ...current.meta, appSecret: event.target.value } }))} placeholder="Meta App Secret" /></div>
        </CardContent>
        <CardFooter><Button type="button" onClick={saveCredentials} disabled={pending}><Save data-icon="inline-start" />حفظ مفاتيح ميتا</Button></CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الحسابات المشتركة</CardTitle>
          <CardDescription>تُستخدم لمدونتي وجبر SEO معًا.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {SHARED_PLATFORMS.map((platform) => {
            const account = accounts.shared[platform.key];
            const ready = Boolean(account.accountId?.trim()) && credentialsReady[platform.key];
            return (
              <section key={platform.key} className="flex flex-col gap-3 border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">{platform.name}</h2>
                  <Badge variant={ready ? "default" : "secondary"}>{ready ? "جاهز" : "يحتاج إعدادًا"}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${platform.key}-account`}>{platform.accountLabel}</Label>
                    <Input id={`${platform.key}-account`} dir="ltr" value={account.accountId ?? ""} onChange={(event) => setShared(platform.key, "accountId", event.target.value)} placeholder="غير مضاف بعد" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${platform.key}-manager`}>{platform.managerLabel} <span className="text-muted-foreground">اختياري</span></Label>
                    <Input id={`${platform.key}-manager`} dir="ltr" value={account.managerId ?? ""} onChange={(event) => setShared(platform.key, "managerId", event.target.value)} placeholder="غير مضاف بعد" />
                  </div>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  {credentialsReady[platform.key] ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />}
                  {credentialsReady[platform.key] ? "مفاتيح API محفوظة." : "مفاتيح API غير مضافة."}
                </p>
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Button type="button" className="self-start" onClick={save} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
        حفظ الحسابات
      </Button>
    </div>
  );
}
