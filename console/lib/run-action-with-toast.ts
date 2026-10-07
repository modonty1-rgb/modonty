import type { TransitionStartFunction } from "react";
import { toast } from "sonner";

export function createRunActionWithToast(
  setActionId: (id: string | null) => void,
  startTransition: TransitionStartFunction
) {
  return function run(id: string, fn: () => Promise<{ success: boolean; error?: string }>, msg: string) {
    setActionId(id);
    startTransition(async () => {
      const res = await fn();
      if (res.success) toast.success(msg);
      else toast.error(res.error || "فشل التنفيذ");
      setActionId(null);
    });
  };
}
