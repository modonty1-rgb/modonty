import { Badge } from "@/components/ui/badge";
import { IconArticle, IconMessage } from "@/lib/icons";
import { ModontyPartnerMark } from "@/components/icons/modonty-partner-mark";

export function TypeBadge({ type }: { type: "client" | "article" | "comment" }) {
  const config = {
    client: { icon: ModontyPartnerMark, label: "عميل" },
    article: { icon: IconArticle, label: "مقالة" },
    comment: { icon: IconMessage, label: "تعليق" },
  } as const;

  const { icon: Icon, label } = config[type];

  return (
    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
      <Icon className="h-3 w-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  );
}
