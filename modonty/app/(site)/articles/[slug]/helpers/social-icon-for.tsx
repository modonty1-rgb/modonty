import type { ComponentType, SVGProps } from "react";

import { Linkedin } from "@/components/icons/linkedin";
import { Twitter } from "@/components/icons/twitter";
import { Instagram } from "@/components/icons/instagram";
import { SocialFacebookOutline } from "@/components/icons/facebook";
import { Youtube } from "@/components/icons/youtube";
import { TiktokLogoLight } from "@/components/icons/tiktok";
import { RoundSnapchat } from "@/components/icons/snapchat";

type IconC = ComponentType<SVGProps<SVGSVGElement>>;

export type SocialIcon = { icon: IconC; label: string };

// sameAs is a flat URL array — derive the platform icon from the host.
export function socialIconFor(url: string): SocialIcon | null {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("linkedin")) return { icon: Linkedin, label: "لينكد إن" };
  if (host === "x.com" || host.endsWith(".x.com") || host.includes("twitter")) return { icon: Twitter, label: "إكس" };
  if (host.includes("facebook") || host.includes("fb.")) return { icon: SocialFacebookOutline, label: "فيسبوك" };
  if (host.includes("instagram")) return { icon: Instagram, label: "انستغرام" };
  if (host.includes("youtube") || host.includes("youtu.be")) return { icon: Youtube, label: "يوتيوب" };
  if (host.includes("tiktok")) return { icon: TiktokLogoLight, label: "تيك توك" };
  if (host.includes("snapchat")) return { icon: RoundSnapchat, label: "سناب شات" };
  return null;
}
