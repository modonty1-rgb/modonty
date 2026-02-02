"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface UploadSuccessProps {
  onAddNew: () => void;
  initialClientId?: string | null;
}

export function UploadSuccess({ onAddNew, initialClientId }: UploadSuccessProps) {
  const router = useRouter();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Media saved successfully!</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={onAddNew} variant="outline" className="flex-1">
              Add New Media
            </Button>
            {initialClientId ? (
              <Button onClick={() => router.push(`/clients/${initialClientId}/edit`)} className="flex-1">
                Back to Client
              </Button>
            ) : (
              <Button onClick={() => router.push("/media")} className="flex-1">
                Go to Media Library
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
