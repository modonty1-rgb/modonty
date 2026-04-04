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
import { Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, GripVertical } from "lucide-react";
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
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!faqToDelete) return;
    setLoading(faqToDelete.id);
    try {
      const result = await deleteFAQ(faqToDelete.id);
      if (result.success) {
        toast({ title: "Deleted", description: "FAQ removed" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed" });
      }
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
        toast({ title: "Updated", description: "FAQ visibility changed" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed" });
      }
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
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed" });
      }
    } finally {
      setLoading(null);
    }
  };

  if (faqs.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm font-medium">No FAQs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Click &quot;Add New FAQ&quot; to create your first question</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {faqs.map((faq, index) => {
          const isLoading = loading === faq.id;
          return (
            <Card key={faq.id} className={!faq.isActive ? "opacity-60" : undefined}>
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Reorder handle + position */}
                  <div className="flex flex-col items-center justify-center gap-0.5 px-2 border-e bg-muted/30 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(faq.id, "up")}
                      disabled={index === 0 || isLoading}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-[11px] font-mono text-muted-foreground">{faq.position}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMove(faq.id, "down")}
                      disabled={index === faqs.length - 1 || isLoading}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{faq.question}</h3>
                      {!faq.isActive && (
                        <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-600 bg-yellow-500/10 shrink-0">
                          Hidden
                        </Badge>
                      )}
                      {faq.seoTitle && (
                        <Badge variant="outline" className="text-[10px] shrink-0">SEO</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{faq.answer}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 px-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleStatus(faq.id)}
                      disabled={isLoading}
                      title={faq.isActive ? "Hide from visitors" : "Show to visitors"}
                    >
                      {faq.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/modonty/faq/${faq.id}/edit`} title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => { setFaqToDelete(faq); setDeleteDialogOpen(true); }}
                      disabled={isLoading}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              {faqToDelete && (
                <>
                  <span className="font-medium text-foreground">&quot;{faqToDelete.question}&quot;</span>
                  <br />
                  This will permanently remove it from the public FAQ page.
                </>
              )}
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
