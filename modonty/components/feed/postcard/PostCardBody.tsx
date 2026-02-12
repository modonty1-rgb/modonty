import Link from "@/components/link";
import type { PostCardProps } from "./PostCard.types";
import { PostCardHeroImage } from "./PostCardHeroImage";

export function PostCardBody({ post, priority, isLcp, index }: PostCardProps) {
  return (
    <>
      {post.title && (
        <Link href={`/articles/${post.slug}`} className="block">
          <h3
            itemProp="headline"
            className="mb-1 font-semibold text-base hover:text-primary transition-colors"
          >
            {post.title}
          </h3>
        </Link>
      )}
      <p
        itemProp="description"
        className="text-sm text-foreground leading-relaxed whitespace-pre-line"
      >
        {post.content}
      </p>

      <PostCardHeroImage
        post={post}
        priority={priority}
        isLcp={isLcp}
        index={index}
      />
    </>
  );
}

