"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { deleteFAQ, toggleFAQStatus, bulkUpdatePositions } from "../actions/faq-actions";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  position: number;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

interface FAQListProps {
  faqs: FAQ[];
}

export function FAQList({ faqs }: FAQListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!faqToDelete) return;

    setLoading(faqToDelete);
    try {
      const result = await deleteFAQ(faqToDelete);
      if (result.success) {
        toast({
          title: "Success",
          description: "FAQ deleted successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete FAQ",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    setLoading(id);
    try {
      const result = await toggleFAQStatus(id);
      if (result.success) {
        toast({
          title: "Success",
          description: "FAQ status updated",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    const currentIndex = faqs.findIndex((f) => f.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const updates = [...faqs];
    const temp = updates[currentIndex].position;
    updates[currentIndex].position = updates[newIndex].position;
    updates[newIndex].position = temp;

    setLoading(id);
    try {
      const result = await bulkUpdatePositions(
        updates.map((f) => ({ id: f.id, position: f.position }))
      );
      if (result.success) {
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reorder FAQs",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  if (faqs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No FAQs found. Create your first FAQ to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={faq.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{faq.position}
                    </span>
                    <Badge variant={faq.isActive ? "default" : "secondary"}>
                      {faq.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {faq.seoTitle && (
                      <Badge variant="outline" className="text-xs">
                        SEO
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
                  {faq.seoDescription && (
                    <p className="text-xs text-muted-foreground italic">
                      SEO: {faq.seoDescription}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMove(faq.id, "up")}
                      disabled={index === 0 || loading === faq.id}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMove(faq.id, "down")}
                      disabled={index === faqs.length - 1 || loading === faq.id}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(faq.id)}
                    disabled={loading === faq.id}
                  >
                    {faq.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/modonty/faq/${faq.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFaqToDelete(faq.id);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={loading === faq.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
