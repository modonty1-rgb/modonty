"use client";

import { UseFormReturn } from "react-hook-form";
import { FormInput } from "@/components/admin/form-field";
import type { ClientFormSchemaType } from "../../helpers/client-form-schema";

interface AddressSectionProps {
  form: UseFormReturn<ClientFormSchemaType>;
}

export function AddressSection({ form }: AddressSectionProps) {
  const { watch, setValue, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FormInput
          name="addressCountry"
          label="Country"
          value={watch("addressCountry") || "SA"}
          onChange={(e) => setValue("addressCountry", e.target.value || null, { shouldValidate: true })}
          error={errors.addressCountry?.message}
          placeholder="SA (Saudi Arabia)"
          hint="افتراضي: SA (المملكة العربية السعودية) - يُستخدم في بيانات Schema.org Address و ContactPoint - يساعد في تحديد منطقة الخدمة (areaServed)"
        />
        <FormInput
          name="addressRegion"
          label="Region/Province"
          value={watch("addressRegion") || ""}
          onChange={(e) => setValue("addressRegion", e.target.value || null, { shouldValidate: true })}
          error={errors.addressRegion?.message}
          placeholder="e.g., Riyadh, Dubai, London"
          hint="المنطقة أو المحافظة أو الولاية - يُستخدم في بيانات Schema.org Address لتحديد الموقع الجغرافي للشركة - يدعم جميع الدول وليس فقط السعودية"
        />
        <FormInput
          name="addressCity"
          label="City"
          value={watch("addressCity") || ""}
          onChange={(e) => setValue("addressCity", e.target.value || null, { shouldValidate: true })}
          error={errors.addressCity?.message}
          placeholder="e.g., Riyadh"
          hint="اسم المدينة - جزء من نظام العنوان الوطني السعودي - يُستخدم في بيانات Schema.org Address لتحديد الموقع الجغرافي للشركة"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-5">
        <FormInput
          name="addressNeighborhood"
          label="Neighborhood"
          value={watch("addressNeighborhood") || ""}
          onChange={(e) => setValue("addressNeighborhood", e.target.value || null, { shouldValidate: true })}
          error={errors.addressNeighborhood?.message}
          placeholder="e.g., Al Olaya"
          hint="الحي أو المنطقة - جزء من نظام العنوان الوطني السعودي - يُستخدم لتحديد الموقع بدقة ضمن المدينة"
        />
        <FormInput
          name="addressLatitude"
          label="Latitude"
          type="number"
          step="any"
          value={watch("addressLatitude") != null ? String(watch("addressLatitude")) : ""}
          onChange={(e) => {
            const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
            const value = numValue !== null && !isNaN(numValue) ? numValue : null;
            setValue("addressLatitude", value, { shouldValidate: true });
          }}
          error={errors.addressLatitude?.message}
          placeholder="e.g., 24.7136"
          hint="خط العرض الجغرافي للموقع - يُستخدم في بيانات Schema.org GeoCoordinates - يساعد في تحديد الموقع بدقة على الخرائط - القيمة بين -90 و 90"
        />
        <FormInput
          name="addressLongitude"
          label="Longitude"
          type="number"
          step="any"
          value={watch("addressLongitude") != null ? String(watch("addressLongitude")) : ""}
          onChange={(e) => {
            const numValue = e.target.value === "" ? null : parseFloat(e.target.value);
            const value = numValue !== null && !isNaN(numValue) ? numValue : null;
            setValue("addressLongitude", value, { shouldValidate: true });
          }}
          error={errors.addressLongitude?.message}
          placeholder="e.g., 46.6753"
          hint="خط الطول الجغرافي للموقع - يُستخدم في بيانات Schema.org GeoCoordinates - يساعد في تحديد الموقع بدقة على الخرائط - القيمة بين -180 و 180"
        />
      </div>
      <div>
        <FormInput
          name="addressStreet"
          label="Street Address"
          value={watch("addressStreet") || ""}
          onChange={(e) => setValue("addressStreet", e.target.value || null, { shouldValidate: true })}
          error={errors.addressStreet?.message}
          placeholder="King Fahd Road"
          hint="اسم الشارع - جزء من نظام العنوان الوطني السعودي - يُستخدم في بيانات Schema.org Address لتحديد الموقع بدقة"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FormInput
          name="addressPostalCode"
          label="Postal Code"
          value={watch("addressPostalCode") || ""}
          onChange={(e) => setValue("addressPostalCode", e.target.value || null, { shouldValidate: true })}
          error={errors.addressPostalCode?.message}
          placeholder="12345-6789"
          hint="الرمز البريدي المكون من 9 أرقام - جزء من نظام العنوان الوطني السعودي - إلزامي اعتباراً من عام 2026 - يُستخدم في بيانات Schema.org Address لتحديد الموقع بدقة"
        />
        <FormInput
          name="addressBuildingNumber"
          label="Building Number"
          value={watch("addressBuildingNumber") || ""}
          onChange={(e) => setValue("addressBuildingNumber", e.target.value || null, { shouldValidate: true })}
          error={errors.addressBuildingNumber?.message}
          placeholder="e.g., 1234"
          hint="رقم المبنى في العنوان الوطني السعودي - يُستخدم مع الرقم الإضافي لتحديد الموقع بدقة - جزء من نظام العنوان الوطني السعودي"
        />
        <FormInput
          name="addressAdditionalNumber"
          label="Unit/Additional Number"
          value={watch("addressAdditionalNumber") || ""}
          onChange={(e) => setValue("addressAdditionalNumber", e.target.value || null, { shouldValidate: true })}
          error={errors.addressAdditionalNumber?.message}
          placeholder="e.g., 5 (for unit 5)"
          hint="الرقم الإضافي أو رقم الوحدة في المبنى (مثل: رقم الشقة، المكتب، الطابق) - يُستخدم مع رقم المبنى لتحديد الموقع بدقة - جزء من نظام العنوان الوطني السعودي - اختياري"
        />
      </div>
    </div>
  );
}
