import { PostCard } from "@/components/PostCard";

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

interface FirstArticleCardProps {
  post: Post;
}

export function FirstArticleCard({ post }: FirstArticleCardProps) {
  return (
    <div className="animate-in fade-in duration-300">
      <PostCard post={post} priority />
    </div>
  );
}
