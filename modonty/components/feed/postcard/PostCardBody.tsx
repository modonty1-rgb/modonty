import Link from "@/components/link";
import type { PostCardProps } from "./PostCard.types";
import { PostCardHeroImage } from "./PostCardHeroImage";
import { ChevronLeft } from "lucide-react";

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
      <div className="flex items-center justify-end">
        <Link
          href={`/articles/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary  hover:underline "
        >
          اقرأ المزيد
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      
    </>
  );
}

