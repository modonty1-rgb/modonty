import { getPlatformSocialLinks } from "@/lib/settings/get-platform-social-links";
import { FollowCardClient } from "./FollowCardClient";

export async function FollowCard() {
  const socialLinks = await getPlatformSocialLinks();
  return <FollowCardClient socialLinks={socialLinks} />;
}
