"use client";

import { UseFormReturn } from "react-hook-form";
import { FormSelect } from "@/components/admin/form-field";
import { SelectItem } from "@/components/ui/select";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface SettingsSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function SettingsSection({ form }: SettingsSectionProps) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;

  const subscriptionStatus = watch("subscriptionStatus") || "PENDING";
  const paymentStatus = watch("paymentStatus") || "PENDING";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-foreground">
          Subscription & Billing Status
        </h2>
        <p className="text-xs text-muted-foreground">
          Control the current subscription and payment status for this client.
        </p>
      </div>

      <FormSelect
        label="Subscription Status"
        name="subscriptionStatus"
        value={subscriptionStatus}
        onValueChange={(value) =>
          setValue("subscriptionStatus", value as any, { shouldValidate: true })
        }
        error={errors.subscriptionStatus?.message}
        hint="الحالة الحالية للوصول إلى الاشتراك - يحدد ما إذا كان العميل يمكنه الوصول إلى الخدمات أم لا - يُستخدم لتتبع حالة الاشتراك وإدارة الوصول"
      >
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="ACTIVE">Active</SelectItem>
        <SelectItem value="EXPIRED">Expired</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
      </FormSelect>

      <FormSelect
        label="Payment Status"
        name="paymentStatus"
        value={paymentStatus}
        onValueChange={(value) =>
          setValue("paymentStatus", value as any, { shouldValidate: true })
        }
        error={errors.paymentStatus?.message}
        hint="حالة الفوترة للاشتراك - يحدد ما إذا تم دفع الفاتورة أم لا - يُستخدم لتتبع حالة الدفع وإدارة الفواتير"
      >
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="OVERDUE">Overdue</SelectItem>
      </FormSelect>
    </div>
  );
}

