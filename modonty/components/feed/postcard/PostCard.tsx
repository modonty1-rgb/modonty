import type { PostCardProps } from "./PostCard.types";
import { DesktopPostCard } from "./DesktopPostCard";
import { MobilePostCard } from "./MobilePostCard";

export function PostCard(props: PostCardProps) {
  return (
    <>
      <DesktopPostCard {...props} />
      <MobilePostCard {...props} />
    </>
  );
}
