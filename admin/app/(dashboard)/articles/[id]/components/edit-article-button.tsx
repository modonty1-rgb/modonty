"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditArticleButtonProps {
  articleId: string;
}

export function EditArticleButton({ articleId }: EditArticleButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/articles/${articleId}/edit`);
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick} title="Edit article">
      <Edit className="h-4 w-4" />
    </Button>
  );
}
