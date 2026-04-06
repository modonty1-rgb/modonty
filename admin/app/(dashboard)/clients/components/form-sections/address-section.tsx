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
          hint="Default: SA (Saudi Arabia) — used in Schema.org Address and ContactPoint — helps define the service area (areaServed)"
        />
        <FormInput
          name="addressRegion"
          label="Region/Province"
          value={watch("addressRegion") || ""}
          onChange={(e) => setValue("addressRegion", e.target.value || null, { shouldValidate: true })}
          error={errors.addressRegion?.message}
          placeholder="e.g., Riyadh, Dubai, London"
          hint="Region, province, or state — used in Schema.org Address to define the company's geographic location — supports all countries, not just Saudi Arabia"
        />
        <FormInput
          name="addressCity"
          label="City"
          value={watch("addressCity") || ""}
          onChange={(e) => setValue("addressCity", e.target.value || null, { shouldValidate: true })}
          error={errors.addressCity?.message}
          placeholder="e.g., Riyadh"
          hint="City name — part of the Saudi National Address system — used in Schema.org Address to define the company's geographic location"
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
          hint="Neighborhood or district — part of the Saudi National Address system — used to pinpoint location within the city"
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
          hint="Geographic latitude — used in Schema.org GeoCoordinates — helps pinpoint location on maps — value between -90 and 90"
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
          hint="Geographic longitude — used in Schema.org GeoCoordinates — helps pinpoint location on maps — value between -180 and 180"
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
          hint="Street name — part of the Saudi National Address system — used in Schema.org Address to pinpoint location"
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
          hint="9-digit postal code — part of the Saudi National Address system — mandatory from 2026 — used in Schema.org Address to pinpoint location"
        />
        <FormInput
          name="addressBuildingNumber"
          label="Building Number"
          value={watch("addressBuildingNumber") || ""}
          onChange={(e) => setValue("addressBuildingNumber", e.target.value || null, { shouldValidate: true })}
          error={errors.addressBuildingNumber?.message}
          placeholder="e.g., 1234"
          hint="Building number in the Saudi National Address — used with additional number to pinpoint location — part of the Saudi National Address system"
        />
        <FormInput
          name="addressAdditionalNumber"
          label="Unit/Additional Number"
          value={watch("addressAdditionalNumber") || ""}
          onChange={(e) => setValue("addressAdditionalNumber", e.target.value || null, { shouldValidate: true })}
          error={errors.addressAdditionalNumber?.message}
          placeholder="e.g., 5 (for unit 5)"
          hint="Additional number or unit number (e.g., apartment, office, floor) — used with building number to pinpoint location — part of the Saudi National Address system — optional"
        />
      </div>
    </div>
  );
}
