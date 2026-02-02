import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Building2, FolderOpen, Tag } from "lucide-react";

interface PreviewTagsProps {
  client: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  tags: Array<{ tag: { id: string; name: string; slug: string } }>;
}

export function PreviewTags({ client, category, tags }: PreviewTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {client && (
        <Link href={`/clients/${client.id}`}>
          <Badge variant="secondary" className="text-sm flex items-center gap-1.5 w-fit">
            <Building2 className="h-3.5 w-3.5" />
            {client.name}
          </Badge>
        </Link>
      )}
      {category && (
        <Link href={`/categories/${category.id}`}>
          <Badge variant="outline" className="text-sm flex items-center gap-1.5 w-fit">
            <FolderOpen className="h-3.5 w-3.5" />
            {category.name}
          </Badge>
        </Link>
      )}
      {tags.map(({ tag }) => (
        <Link key={tag.id} href={`/tags/${tag.id}`}>
          <Badge variant="outline" className="text-sm flex items-center gap-1.5 w-fit">
            <Tag className="h-3.5 w-3.5" />
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
