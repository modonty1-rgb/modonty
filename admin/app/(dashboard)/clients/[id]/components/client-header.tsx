"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Camera, ExternalLink, Monitor, Pencil } from "lucide-react";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { DeleteClientButton } from "./delete-client-button";
import { ClientLogoModal } from "../../components/client-logo-modal";
import { ClientHeroModal } from "../../components/client-hero-modal";
import { YMYL_CATEGORIES, type YmylCategory } from "@modonty/database/lib/seo/ymyl-config";

interface ClientHeaderProps {
  client: {
    id: string;
    name: string;
    slug: string;
    url: string | null;
    logoMedia: { id?: string; url: string; altText: string | null } | null;
    heroImageMedia: { id?: string; url: string; altText: string | null } | null;
    subscriptionStatus: string;
    isYmyl: boolean;
    ymylCategory: string | null;
  };
  publicBaseUrl?: string | null;
  seoScore?: number;
}

export function ClientHeader({ client, publicBaseUrl, seoScore }: ClientHeaderProps) {
  const [logoOpen, setLogoOpen] = useState(false);
  const [heroOpen, setHeroOpen] = useState(false);

  const isActive = client.subscriptionStatus === "ACTIVE";
  const ymylLabel =
    client.isYmyl && client.ymylCategory
      ? YMYL_CATEGORIES[client.ymylCategory as YmylCategory]?.label.ar ?? null
      : null;

  const base = publicBaseUrl || "https://modonty.com";
  const publicUrl = `${base.replace(/^https?:\/\//, "")}/clients/${client.slug}`;
  const publicHref = `${base}/clients/${client.slug}`;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Cover (hero image) — click to change */}
      <div className="relative h-28 sm:h-32 bg-gradient-to-l from-primary/15 via-primary/5 to-violet-500/15">
        {client.heroImageMedia?.url && (
          <Image
            src={client.heroImageMedia.url}
            alt={client.heroImageMedia.altText || `${client.name} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority
          />
        )}
        <button
          type="button"
          onClick={() => setHeroOpen(true)}
          className="absolute top-2.5 end-2.5 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-background/80 backdrop-blur border hover:bg-background transition-colors"
          aria-label="Change cover image"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Cover
        </button>
      </div>

      {/* Identity row */}
      <div className="px-4 pb-4 flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-end gap-3.5 min-w-0">
          {/* Logo overlay — click to change */}
          <button
            type="button"
            onClick={() => setLogoOpen(true)}
            className="relative -mt-9 h-20 w-20 rounded-2xl border-[3px] border-card bg-muted grid place-items-center overflow-hidden shrink-0 group"
            aria-label="Change logo"
          >
            {client.logoMedia?.url ? (
              <Image
                src={client.logoMedia.url}
                alt={client.logoMedia.altText || client.name}
                width={80}
                height={80}
                className="h-full w-full object-contain"
                sizes="80px"
              />
            ) : (
              <span className="text-2xl font-extrabold text-primary">
                {client.name.charAt(0)}
              </span>
            )}
            <span className="absolute -bottom-0.5 -end-0.5 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center border-2 border-card">
              <Camera className="h-3 w-3" />
            </span>
          </button>

          <div className="min-w-0 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold truncate">{client.name}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/12 text-amber-600 dark:text-amber-500",
                )}
              >
                ● {isActive ? "مفعّل" : "غير مفعّل"}
              </span>
              {ymylLabel && (
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/12 text-violet-600 dark:text-violet-400">
                  🛡️ YMYL · {ymylLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono" dir="ltr">{client.slug}</span>
              <a
                href={publicHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                dir="ltr"
              >
                {publicUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Actions — content-writer focused (no billing) */}
        <div className="flex items-center gap-2 flex-wrap pb-0.5">
          {seoScore !== undefined && (
            // The SEO score opens the full guide (/technical): where the fault is and how to fix it.
            <SeoScoreBadge score={seoScore} size="md" href={`/clients/${client.id}/technical`} />
          )}
          {client.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={client.url} target="_blank" rel="noopener noreferrer">
                <Monitor className="h-4 w-4 me-1.5" /> Console
              </a>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="h-4 w-4 me-1.5" /> Edit
            </Link>
          </Button>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      <ClientLogoModal
        open={logoOpen}
        onOpenChange={setLogoOpen}
        clientId={client.id}
        initialLogoUrl={client.logoMedia?.url}
        initialLogoMediaId={client.logoMedia?.id ?? null}
      />
      <ClientHeroModal
        open={heroOpen}
        onOpenChange={setHeroOpen}
        clientId={client.id}
        initialHeroUrl={client.heroImageMedia?.url}
        initialHeroMediaId={client.heroImageMedia?.id ?? null}
      />
    </div>
  );
}
