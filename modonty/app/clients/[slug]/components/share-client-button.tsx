"use client";

import { ShareButtons } from "@/components/shared";

interface ShareClientButtonProps {
  clientName: string;
  clientUrl: string;
}

export function ShareClientButton({ clientName, clientUrl }: ShareClientButtonProps) {
  const title = `اطلع على ${clientName} على مودونتي`;

  return (
    <ShareButtons
      title={title}
      url={clientUrl}
      platforms={["twitter", "linkedin", "facebook", "email"]}
      showCopyLink={true}
      size="sm"
    />
  );
}
