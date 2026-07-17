"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Briefcase,
  BarChart3,
  Users,
  Award,
  Video,
  ImagePlus,
  X,
} from "lucide-react";
import { compressToWebP } from "@/lib/compress-image";
import {
  updatePageContent,
  type ServiceInput,
  type TeamMemberInput,
  type AchievementInput,
  type CredentialInput,
} from "../actions/page-content-actions";

interface Props {
  initial: {
    services: ServiceInput[];
    teamMembers: TeamMemberInput[];
    achievements: AchievementInput[];
    credentials: CredentialInput[];
    introVideoUrl: string | null;
  };
}

export function PageContentEditor({ initial }: Props) {
  const [services, setServices] = useState<ServiceInput[]>(initial.services);
  const [team, setTeam] = useState<TeamMemberInput[]>(initial.teamMembers);
  const [achievements, setAchievements] = useState<AchievementInput[]>(initial.achievements);
  const [credentials, setCredentials] = useState<CredentialInput[]>(initial.credentials);
  const [introVideoUrl, setIntroVideoUrl] = useState<string>(initial.introVideoUrl ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const res = await updatePageContent({
        services,
        teamMembers: team,
        achievements,
        credentials,
        introVideoUrl: introVideoUrl || null,
      });
      if (res.success) toast.success("تم حفظ محتوى صفحتك");
      else toast.error(res.error || "فشل الحفظ");
    });
  }

  return (
    <div className="space-y-6">
      {/* Services */}
      <Section icon={Briefcase} title="الخدمات" hint="الخدمات اللي تقدّمها — تظهر في صفحتك وفي بيانات Google (OfferCatalog).">
        {services.map((s, i) => (
          <Row key={i} onRemove={() => setServices(services.filter((_, j) => j !== i))}>
            <Input
              placeholder="اسم الخدمة *"
              value={s.title}
              onChange={(e) => setServices(upd(services, i, { title: e.target.value }))}
            />
            <Input
              placeholder="وصف مختصر (اختياري)"
              value={s.description ?? ""}
              onChange={(e) => setServices(upd(services, i, { description: e.target.value }))}
            />
          </Row>
        ))}
        <AddButton label="أضف خدمة" onClick={() => setServices([...services, { title: "", description: "", icon: "" }])} />
      </Section>

      {/* Achievements */}
      <Section icon={BarChart3} title="إنجازاتنا بالأرقام" hint="أرقام تختصر خبرتك (مثال: +500 عميل سعيد). ضيف صورة وفقرة تحكي القصة — أو خلّها رقم بسيط. عرض فقط، بلا تأثير على Google.">
        {achievements.map((a, i) => (
          <AchievementRow
            key={i}
            achievement={a}
            onChange={(patch) => setAchievements(upd(achievements, i, patch))}
            onRemove={() => setAchievements(achievements.filter((_, j) => j !== i))}
          />
        ))}
        <AddButton label="أضف إنجازاً" onClick={() => setAchievements([...achievements, { value: "", label: "", image: "", description: "" }])} />
      </Section>

      {/* Team */}
      <Section icon={Users} title="فريق العمل" hint="أعضاء فريقك — يظهرون كأشخاص في بيانات Google (employee).">
        {team.map((m, i) => (
          <Row key={i} onRemove={() => setTeam(team.filter((_, j) => j !== i))}>
            <Input
              placeholder="الاسم *"
              value={m.name}
              onChange={(e) => setTeam(upd(team, i, { name: e.target.value }))}
            />
            <Input
              placeholder="المسمّى (اختياري)"
              value={m.role ?? ""}
              onChange={(e) => setTeam(upd(team, i, { role: e.target.value }))}
            />
            <Input
              placeholder="رابط صورة (اختياري)"
              value={m.photoUrl ?? ""}
              onChange={(e) => setTeam(upd(team, i, { photoUrl: e.target.value }))}
            />
          </Row>
        ))}
        <AddButton label="أضف عضواً" onClick={() => setTeam([...team, { name: "", role: "", bio: "", photoUrl: "" }])} />
      </Section>

      {/* Credentials */}
      <Section icon={Award} title="الاعتمادات والشهادات" hint="شهاداتك واعتماداتك — تظهر في بيانات Google (hasCredential).">
        {credentials.map((c, i) => (
          <Row key={i} onRemove={() => setCredentials(credentials.filter((_, j) => j !== i))}>
            <Input
              placeholder="اسم الاعتماد * (مثال: ISO 9001)"
              value={c.name}
              onChange={(e) => setCredentials(upd(credentials, i, { name: e.target.value }))}
            />
            <Input
              placeholder="الجهة المانحة (اختياري)"
              value={c.authority ?? ""}
              onChange={(e) => setCredentials(upd(credentials, i, { authority: e.target.value }))}
            />
            <Input
              placeholder="السنة (اختياري)"
              value={c.year ?? ""}
              onChange={(e) => setCredentials(upd(credentials, i, { year: e.target.value }))}
            />
          </Row>
        ))}
        <AddButton label="أضف اعتماداً" onClick={() => setCredentials([...credentials, { name: "", authority: "", year: "", url: "" }])} />
      </Section>

      {/* Intro video */}
      <Section icon={Video} title="فيديو التعريف" hint="رابط فيديو تعريفي (YouTube / Vimeo / MP4) — يظهر في صفحتك وفي بيانات Google (VideoObject).">
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={introVideoUrl}
          onChange={(e) => setIntroVideoUrl(e.target.value)}
          dir="ltr"
          className="text-start"
        />
      </Section>

      {/* Sticky save */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={save} disabled={pending} size="lg" className="gap-2 shadow-lg">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ محتوى الصفحة
        </Button>
      </div>
    </div>
  );
}

function upd<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((item, j) => (j === i ? { ...item, ...patch } : item));
}

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
          </div>
        </div>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-2">
      <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onRemove}
        className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
        title="حذف"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="gap-1.5">
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

const LABEL_MAX = 52;
const DESC_MAX = 250;
const IMG_MAX_BYTES = 10 * 1024 * 1024;

function AchievementRow({
  achievement,
  onChange,
  onRemove,
}: {
  achievement: AchievementInput;
  onChange: (patch: Partial<AchievementInput>) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const image = achievement.image ?? "";
  const description = achievement.description ?? "";

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("الملف مش صورة");
      return;
    }
    if (file.size > IMG_MAX_BYTES) {
      toast.error("حجم الصورة كبير — الحد 10 ميجا");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressToWebP(file);
      const fd = new FormData();
      fd.append("file", compressed);
      fd.append("folder", "achievements");
      const res = await fetch("/api/upload-bunny", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) {
        toast.error(json?.error || "فشل رفع الصورة");
        return;
      }
      onChange({ image: json.url });
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex items-start gap-2">
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Input
            placeholder="القيمة * (مثال: +500)"
            value={achievement.value}
            onChange={(e) => onChange({ value: e.target.value })}
          />
          <Input
            placeholder="العنوان * (مثال: عميل سعيد)"
            value={achievement.label}
            maxLength={LABEL_MAX}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
          title="حذف"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {image ? (
          <div className="relative w-full overflow-hidden rounded-md border bg-muted sm:w-40" style={{ aspectRatio: "16/10" }}>
            <Image src={image} alt={achievement.label || "صورة الإنجاز"} fill className="object-cover" sizes="160px" />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="absolute inset-x-1 bottom-1 h-6 bg-background/90 px-2 text-[11px] backdrop-blur"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "استبدال"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => onChange({ image: "" })}
              aria-label="حذف الصورة"
              className="absolute end-1 top-1 h-6 w-6 bg-background/90 text-destructive backdrop-blur hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{ aspectRatio: "16/10" }}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border py-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/30 disabled:opacity-50 sm:w-40"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImagePlus className="h-5 w-5" />}
            <span className="text-[11px] font-medium">{uploading ? "جاري الرفع..." : "أضف صورة (اختياري)"}</span>
          </button>
        )}

        <div className="flex-1">
          <Textarea
            placeholder="فقرة قصيرة تحكي القصة (اختياري)"
            value={description}
            maxLength={DESC_MAX}
            rows={3}
            onChange={(e) => onChange({ description: e.target.value })}
            className="resize-none text-sm"
          />
          <div className="mt-1 text-end text-[11px] text-muted-foreground">
            {description.length}/{DESC_MAX}
          </div>
        </div>
      </div>
    </div>
  );
}
