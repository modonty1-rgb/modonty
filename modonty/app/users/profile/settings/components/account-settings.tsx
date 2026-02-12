"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Download, AlertTriangle } from "lucide-react";
import { exportUserData, deleteAccount } from "../actions/settings-actions";
import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";

export function AccountSettings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!session?.user?.id) return;

    setIsExporting(true);
    setError(null);

    try {
      const result = await exportUserData(session.user.id);
      if (result.success && result.data) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `user-data-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        setError(result.error || "فشل تصدير البيانات");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.id) return;
    if (deleteConfirmation !== "حذف") {
      setError("يرجى كتابة 'حذف' للتأكيد");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteAccount(session.user.id, deleteConfirmation);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "فشل حذف الحساب");
      }
    } catch (err) {
      setError("حدث خطأ أثناء حذف الحساب");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            تصدير البيانات
          </CardTitle>
          <CardDescription>
            قم بتحميل نسخة من جميع بياناتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            يمكنك تصدير جميع بياناتك بما في ذلك التعليقات والإعجابات والمحفوظات.
          </p>
          <Button onClick={handleExport} disabled={isExporting} variant="outline">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                تصدير البيانات
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            حذف الحساب
          </CardTitle>
          <CardDescription>
            حذف حسابك بشكل دائم لا يمكن التراجع عنه
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  تحذير: هذا الإجراء لا يمكن التراجع عنه
                </p>
                <p className="text-sm text-muted-foreground">
                  سيتم حذف جميع بياناتك بشكل دائم بما في ذلك:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>جميع تعليقاتك</li>
                  <li>جميع إعجاباتك ومحفوظاتك</li>
                  <li>جميع إعداداتك وتفضيلاتك</li>
                </ul>
              </div>
            </div>
          </div>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                حذف الحساب
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تأكيد حذف الحساب</DialogTitle>
                <DialogDescription>
                  هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    اكتب <span className="font-mono font-bold">حذف</span> للتأكيد
                  </Label>
                  <Input
                    id="confirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="حذف"
                  />
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmation("");
                    setError(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || deleteConfirmation !== "حذف"}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    "حذف الحساب نهائياً"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
