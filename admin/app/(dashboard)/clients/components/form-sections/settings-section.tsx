"use client";

import { UseFormReturn } from "react-hook-form";
import { messages } from "@/lib/messages";
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
          setValue("subscriptionStatus", value as ClientFormSchemaType["subscriptionStatus"], { shouldValidate: true })
        }
        error={errors.subscriptionStatus?.message}
        hint="Current subscription status"
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
          setValue("paymentStatus", value as ClientFormSchemaType["paymentStatus"], { shouldValidate: true })
        }
        error={errors.paymentStatus?.message}
        hint={messages.hints.client.paymentStatus}
      >
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="OVERDUE">Overdue</SelectItem>
      </FormSelect>
    </div>
  );
}

