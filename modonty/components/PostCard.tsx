import Link from "@/components/link";
import { OptimizedImage } from "@/components/OptimizedImage";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, MessageCircle, Heart } from "lucide-react";
import { RelativeTime } from "@/components/RelativeTime";
import { PostCardTextToSpeech } from "@/components/PostCardTextToSpeech";

const PostCardActions = dynamic(() => import("@/components/PostCardActions").then(mod => ({ default: mod.PostCardActions })));

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  readingTimeMinutes?: number;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  status: "published" | "draft";
}

interface PostCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const companyInitials = post.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <article itemScope itemType="https://schema.org/Article">
        <Card className="bg-white border border-border shadow-sm">
          <CardHeader className="pb-3">
            <header className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Link href={`/clients/${post.clientSlug}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.clientLogo} alt={post.clientName} />
                    <AvatarFallback>{companyInitials}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/clients/${post.clientSlug}`}
                    className="font-semibold text-sm hover:text-primary hover:underline"
                  >
                    <span itemProp="publisher" itemScope itemType="https://schema.org/Organization">
                      <span itemProp="name">{post.clientName}</span>
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      itemProp="datePublished"
                      className="text-xs text-muted-foreground"
                    >
                      <RelativeTime
                        date={post.publishedAt}
                        dateTime={post.publishedAt.toISOString()}
                      />
                    </span>
                    {post.readingTimeMinutes && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          ⏱️ {post.readingTimeMinutes} دقيقة
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <PostCardActions postSlug={post.slug} />
            </header>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              {post.title && (
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/articles/${post.slug}`} className="flex-1">
                    <h3 itemProp="headline" className="font-semibold text-base hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <PostCardTextToSpeech
                    text={`${post.title}. ${post.content}`}
                    lang="ar-SA"
                  />
                </div>
              )}
              <p itemProp="description" className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </div>

            {post.image && (
              <Link href={`/articles/${post.slug}`} className="block">
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                  <OptimizedImage
                    itemProp="image"
                    src={post.image}
                    alt={post.title || "صورة المقال"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                    loading={priority ? undefined : "lazy"}
                  />
                </div>
              </Link>
            )}

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <Button variant="ghost" className="min-h-11 min-w-11 gap-1 hover:text-primary px-1 sm:px-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" className="min-h-11 min-w-11 gap-1 hover:text-primary px-1 sm:px-2">
            <ThumbsDown className="h-4 w-4" />
            <span>{post.dislikes}</span>
          </Button>
          <Button variant="ghost" className="min-h-11 min-w-11 gap-1 hover:text-primary px-1 sm:px-2">
            <Heart className="h-4 w-4" />
            <span>{post.favorites}</span>
          </Button>
          <Button variant="ghost" className="min-h-11 min-w-11 gap-1 hover:text-primary px-1 sm:px-2">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
    </article>
  );
}

