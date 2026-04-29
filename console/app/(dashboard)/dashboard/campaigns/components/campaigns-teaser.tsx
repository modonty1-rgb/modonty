"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  Sparkles,
  Mail,
  Users,
  Globe2,
  PenTool,
  CheckCircle2,
  Send,
  BarChart3,
  Wand2,
  ShieldCheck,
  Lightbulb,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { ar } from "@/lib/ar";
import { registerCampaignInterestAction } from "../actions/register-interest";

interface CampaignsTeaserProps {
  monthlyQuota: number;
}

export function CampaignsTeaser({ monthlyQuota }: CampaignsTeaserProps) {
  const t = ar.campaigns;
  const [isPending, startTransition] = useTransition();
  const [registered, setRegistered] = useState(false);

  type Source = "hero" | "tier-own" | "tier-industry" | "tier-full" | "final-cta";

  function handleInterest(reach: "own" | "industry" | "full", source: Source) {
    if (registered) return;
    startTransition(async () => {
      const res = await registerCampaignInterestAction({ reach, source });
      if (!res.success) {
        toast.error(t.ctaError);
        return;
      }
      setRegistered(true);
      toast.success(res.alreadyRegistered ? t.ctaAlreadyRegistered : t.ctaSuccess);
    });
  }

  return (
    <div className="space-y-8">
      {/* ─── HERO ───────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-violet-50 to-amber-50 shadow-md">
        <div className="pointer-events-none absolute -end-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -start-20 -bottom-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <CardContent className="relative p-8 lg:p-12">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {t.soonBadge}
            </span>
            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => handleInterest("own", "hero")}
                disabled={isPending || registered}
                className="gap-2 shadow-lg"
              >
                <Megaphone className="h-4 w-4" />
                {isPending ? t.ctaSubmitting : t.ctaPrimary}
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              {registered && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t.ctaSuccess}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── SOCIAL PROOF — verifiable evidence (top placement) ─────── */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-foreground">{t.proofTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.proofSubtitle}</p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ProofCard
            stat={t.proof1Stat}
            title={t.proof1Title}
            desc={t.proof1Desc}
            sourceLabel={t.proof1Source}
            sourceHref="https://www.litmus.com/blog/infographic-the-roi-of-email-marketing"
            tone="emerald"
          />
          <ProofCard
            stat={t.proof2Stat}
            title={t.proof2Title}
            desc={t.proof2Desc}
            sourceLabel={t.proof2Source}
            sourceHref="https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/why-marketers-should-keep-sending-you-emails"
            tone="primary"
          />
          <ProofCard
            stat={t.proof3Stat}
            title={t.proof3Title}
            desc={t.proof3Desc}
            sourceLabel={t.proof3Source}
            sourceHref="https://www.hubspot.com/state-of-marketing"
            tone="violet"
          />
          <ProofCard
            stat={t.proof4Stat}
            title={t.proof4Title}
            desc={t.proof4Desc}
            sourceLabel={t.proof4Source}
            sourceHref="https://www.dma.org.uk/research/email-marketing-benchmarking-report-2024"
            tone="amber"
          />
        </div>
        <p className="mx-auto max-w-2xl pt-2 text-center text-xs italic text-muted-foreground">
          {t.proofFooter}
        </p>
      </section>

      {/* ─── QUOTA STRIP ────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {t.yourQuota}
              </p>
              <p className="mt-0.5 text-2xl font-bold leading-tight text-foreground">
                <span className="tabular-nums">{monthlyQuota || 0}</span>{" "}
                <span className="text-base font-semibold text-muted-foreground">
                  {t.perMonth}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{t.includedInPlan}</p>
            </div>
          </div>
          <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-end">
            <p className="text-xs font-medium text-amber-700">{t.extraCampaign}</p>
            <p className="text-sm font-bold text-amber-900">{t.onDemandPricing}</p>
          </div>
        </CardContent>
      </Card>

      {/* ─── 3 REACH TIERS ──────────────────────────────────── */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-foreground">{t.reachTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.reachSubtitle}</p>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ReachCard
            icon={Users}
            tone="emerald"
            title={t.tier1Title}
            tag={t.tier1Tag}
            desc={t.tier1Desc}
            onClick={() => handleInterest("own", "tier-own")}
            disabled={isPending || registered}
            ctaLabel={t.ctaPrimary}
          />
          <ReachCard
            icon={Sparkles}
            tone="primary"
            title={t.tier2Title}
            tag={t.tier2Tag}
            desc={t.tier2Desc}
            onClick={() => handleInterest("industry", "tier-industry")}
            disabled={isPending || registered}
            ctaLabel={t.ctaPrimary}
            highlight
          />
          <ReachCard
            icon={Globe2}
            tone="violet"
            title={t.tier3Title}
            tag={t.tier3Tag}
            desc={t.tier3Desc}
            onClick={() => handleInterest("full", "tier-full")}
            disabled={isPending || registered}
            ctaLabel={t.ctaPrimary}
          />
        </div>
      </section>

      {/* ─── WORKFLOW (5 STEPS) ─────────────────────────────── */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-foreground">{t.workflowTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.workflowSubtitle}</p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StepCard step={1} icon={Lightbulb} title={t.step1Title} desc={t.step1Desc} />
          <StepCard step={2} icon={PenTool} title={t.step2Title} desc={t.step2Desc} />
          <StepCard step={3} icon={CheckCircle2} title={t.step3Title} desc={t.step3Desc} />
          <StepCard step={4} icon={Send} title={t.step4Title} desc={t.step4Desc} />
          <StepCard step={5} icon={BarChart3} title={t.step5Title} desc={t.step5Desc} />
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-foreground">{t.featuresTitle}</h2>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Wand2} title={t.feat1Title} desc={t.feat1Desc} />
          <FeatureCard icon={BarChart3} title={t.feat2Title} desc={t.feat2Desc} />
          <FeatureCard icon={Send} title={t.feat3Title} desc={t.feat3Desc} />
          <FeatureCard icon={ShieldCheck} title={t.feat4Title} desc={t.feat4Desc} />
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <Card className="border-0 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground shadow-xl">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center lg:p-10">
          <Megaphone className="h-10 w-10 opacity-90" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold sm:text-3xl">{t.ctaTitle}</h2>
            <p className="text-sm opacity-90 sm:text-base">{t.ctaSubtitle}</p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => handleInterest("own", "final-cta")}
            disabled={isPending || registered}
            className="gap-2 bg-background text-foreground shadow-lg hover:bg-background/90"
          >
            {registered ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t.ctaSuccess}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {isPending ? t.ctaSubmitting : t.ctaPrimary}
              </>
            )}
          </Button>
          <p className="text-xs opacity-75">{t.launchNote}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function ReachCard({
  icon: Icon,
  tone,
  title,
  tag,
  desc,
  onClick,
  disabled,
  ctaLabel,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "primary" | "violet";
  title: string;
  tag: string;
  desc: string;
  onClick: () => void;
  disabled: boolean;
  ctaLabel: string;
  highlight?: boolean;
}) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    primary: "bg-primary/15 text-primary ring-primary/30",
    violet: "bg-violet-100 text-violet-700 ring-violet-200",
  }[tone];

  return (
    <Card
      className={`group relative flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg ${
        highlight ? "border-primary shadow-md ring-2 ring-primary/20" : ""
      }`}
    >
      {highlight && (
        <span className="absolute -top-2.5 start-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold text-primary-foreground shadow rtl:translate-x-1/2">
          الأكثر طلباً
        </span>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ring-1 ${toneClasses}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {tag}
        </span>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <Button
          size="sm"
          variant={highlight ? "default" : "outline"}
          onClick={onClick}
          disabled={disabled}
          className="mt-2 w-full gap-1.5"
        >
          {ctaLabel}
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        </Button>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  desc,
}: {
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="relative h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary tabular-nums">
            {step}
          </span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-bold leading-tight text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-2 p-5">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ProofCard({
  stat,
  title,
  desc,
  sourceLabel,
  sourceHref,
  tone,
}: {
  stat: string;
  title: string;
  desc: string;
  sourceLabel: string;
  sourceHref: string;
  tone: "emerald" | "primary" | "violet" | "amber";
}) {
  const t = ar.campaigns;
  const statClasses = {
    emerald: "text-emerald-700",
    primary: "text-primary",
    violet: "text-violet-700",
    amber: "text-amber-700",
  }[tone];
  const accentClasses = {
    emerald: "border-emerald-200 bg-emerald-50/40",
    primary: "border-primary/20 bg-primary/5",
    violet: "border-violet-200 bg-violet-50/40",
    amber: "border-amber-200 bg-amber-50/40",
  }[tone];

  return (
    <Card className={`h-full transition-shadow hover:shadow-md ${accentClasses}`}>
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <p className={`text-3xl font-extrabold leading-none tabular-nums ${statClasses}`}>
          {stat}
        </p>
        <h3 className="text-sm font-bold leading-snug text-foreground">{title}</h3>
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        <a
          href={sourceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 self-start rounded-md border border-border bg-background/70 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-background"
          title={t.proofVerifyLink}
        >
          {sourceLabel}
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </a>
      </CardContent>
    </Card>
  );
}
