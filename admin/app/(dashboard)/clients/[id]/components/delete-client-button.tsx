"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteClient } from "../../actions/clients-actions";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";

interface DeleteClientButtonProps {
  clientId: string;
}

export function DeleteClientButton({ clientId }: DeleteClientButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDeleting = useRef(false);

  const handleDelete = async () => {
    if (isDeleting.current) return;
    isDeleting.current = true;
    setLoading(true);
    const result = await deleteClient(clientId);
    if (result.success) {
      router.push("/clients");
      router.refresh();
    } else {
      isDeleting.current = false;
      setLoading(false);
      setOpen(false);
      toast({
        title: messages.error.delete_failed,
        description: result.error || "تعذّر حذف العميل",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" aria-label="Delete client">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the client and all associated articles.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
