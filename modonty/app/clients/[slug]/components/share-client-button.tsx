"use client";

import { ShareButtons } from "@/components/shared";
import { trackCtaClick } from "@/lib/cta-tracking";

interface ShareClientButtonProps {
  clientName: string;
  clientUrl: string;
  clientId: string;
  clientSlug: string;
}

export function ShareClientButton({ clientName, clientUrl, clientId, clientSlug }: ShareClientButtonProps) {
  const title = `اطلع على ${clientName} على مودونتي`;

  const onShare = (platform: string) => {
    const bodyPlatform = platform === "copy" ? "COPY_LINK" : platform.toUpperCase();
    const label = platform === "copy" ? "Share client (copy)" : `Share client (${platform})`;
    trackCtaClick({
      type: "LINK",
      label,
      targetUrl: clientUrl,
      clientId,
    });
    fetch(`/api/clients/${encodeURIComponent(clientSlug)}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: bodyPlatform }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <ShareButtons
      title={title}
      url={clientUrl}
      platforms={["twitter", "linkedin", "facebook", "email"]}
      showCopyLink={true}
      onShare={onShare}
      size="sm"
    />
  );
}
