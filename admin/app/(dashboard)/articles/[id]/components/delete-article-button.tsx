"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteArticleButtonProps {
  articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: "Coming soon",
      description: "Delete functionality will be available soon.",
    });
  };

  return (
    <Button variant="outline" size="icon" onClick={handleClick} title="Delete article">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
