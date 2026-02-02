import Link from "@/components/link";
import { Badge } from "@/components/ui/badge";
import { Building2, FolderOpen, Tag } from "lucide-react";

interface ArticleTagsProps {
  client: {
    name: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export function ArticleTags({ client, category, tags }: ArticleTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link href={`/clients/${client.slug}`}>
        <Badge variant="secondary" className="text-sm flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {client.name}
        </Badge>
      </Link>
      {category && (
        <Link href={`/categories/${category.slug}`}>
          <Badge variant="outline" className="text-sm flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            {category.name}
          </Badge>
        </Link>
      )}
      {tags.map((articleTag) => (
        <Link key={articleTag.tag.id} href={`/tags/${articleTag.tag.slug}`}>
          <Badge variant="outline" className="text-sm flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {articleTag.tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
