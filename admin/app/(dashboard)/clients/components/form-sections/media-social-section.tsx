"use client";

import { UseFormReturn } from "react-hook-form";
import { MediaSection } from "./media-section";
import { TwitterSection } from "./twitter-section";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";
import type { ClientWithRelations } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface MediaSocialSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
  clientId?: string;
  initialData?: Partial<ClientWithRelations>;
}

export function MediaSocialSection({
  form,
  clientId,
  initialData,
}: MediaSocialSectionProps) {
  const {
    formState: { errors },
  } = form;

  const sectionHasErrors = (keys: (keyof ClientFormSchemaType)[]) =>
    keys.some((key) => Boolean(errors[key]));

  const hasMediaErrors = sectionHasErrors([
    "logoMediaId",
    "ogImageMediaId",
    "twitterImageMediaId",
  ]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-extrabold text-foreground tracking-wide uppercase whitespace-nowrap">
          Media & Twitter
        </h3>
        {hasMediaErrors && (
          <AlertCircle className="h-3 w-3 text-destructive" aria-hidden="true" />
        )}
      </div>
      <div className="h-px w-full bg-border" />

      <div className="space-y-6">
        <MediaSection form={form} clientId={clientId} initialData={initialData} />
        <TwitterSection form={form} clientId={clientId} initialData={initialData} />
      </div>
    </div>
  );
}

