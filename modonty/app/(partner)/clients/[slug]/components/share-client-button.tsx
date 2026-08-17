"use client";

import { ShareButtons } from "@/components/share/ShareButtons";
import { trackCtaClick } from "@/lib/analytics/cta-tracking";

interface ShareClientButtonProps {
  clientName: string;
  clientUrl: string;
  clientId: string;
  clientSlug: string;
}

export function ShareClientButton({ clientName, clientUrl, clientId, clientSlug }: ShareClientButtonProps) {
  const title = `اطلع على ${clientName} على مدونتي`;

  const onShare = (platform: string) => {
    const bodyPlatform = platform === "copy" ? "COPY_LINK" : platform.toUpperCase();
    const label = platform === "copy" ? "Share client (copy)" : `Share client (${platform})`;
    trackCtaClick({
      type: "LINK",
      label,
      targetUrl: clientUrl,
      clientId,
    });
    fetch(`/clients/${encodeURIComponent(clientSlug)}/api/share`, {
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
