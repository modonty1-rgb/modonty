"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { clientFormSchema, type ClientFormSchemaType } from "../client-form-schema";
import { mapInitialDataToFormData } from "../map-initial-data-to-form-data";
import type { ClientFormData, ClientWithRelations } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { slugify } from "@/lib/utils";
import { updateClient, createClient } from "../../actions/clients-actions";
import { SubscriptionTier } from "@prisma/client";
import { getActiveTierConfigs } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";

// Friendly labels for the "can't save" toast so it names the blocking fields
// in human terms instead of raw schema keys.
const FIELD_LABELS: Record<string, string> = {
  name: "Client Name",
  slug: "Slug",
  email: "Email",
  phone: "Phone",
  industryId: "Industry",
  subscriptionTier: "Subscription Tier",
  businessBrief: "Business Brief",
  logoMediaId: "Logo",
  heroImageMediaId: "Hero Image",
  seoTitle: "SEO Title",
  seoDescription: "SEO Description",
  canonicalUrl: "Canonical URL",
  url: "Website URL",
  legalForm: "Legal Form",
  organizationType: "Organization Type",
};

// Turn raw zod messages into plain guidance an admin (non-developer) understands —
// never expose enum internals like "Invalid enum value. Expected 'LLC' | ...".
function friendlyMessage(rawMessage?: string): string {
  const m = (rawMessage || "").toLowerCase();
  if (!m) return "needs a valid value";
  if (m.includes("enum") || m.includes("expected") || m.includes("invalid type")) {
    return "this value isn't allowed — pick one from the list";
  }
  if (m.includes("required")) return "is required";
  if (m.includes("email")) return "must be a valid email";
  if (m.includes("url")) return "must be a valid link";
  // Length / format messages are already readable — keep them as-is.
  return rawMessage || "needs a valid value";
}

interface UseClientFormOptions {
  initialData?: Partial<ClientWithRelations>;
  clientId?: string;
  // Create mode only: fires after a successful create so the caller can show the
  // welcome-email confirm dialog before navigating (instead of the default push).
  onCreated?: (client: { id: string; name: string; email: string }) => void;
}

export function useClientForm({ initialData, clientId, onCreated }: UseClientFormOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Plain-language list of what's blocking the save — shown as a top banner.
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [tierConfigs, setTierConfigs] = useState<Array<{
    id: string;
    tier: SubscriptionTier;
    name: string;
    articlesPerMonth: number;
    price: number;
    isPopular: boolean;
  }>>([]);

  const isEditMode = Boolean(clientId);

  // Initialize form with React Hook Form
  const form = useForm<ClientFormSchemaType>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: mapInitialDataToFormData(initialData) as Partial<ClientFormSchemaType>,
    mode: "onSubmit", // Validate all fields on submit to show all errors
  });

  // Load tier configs
  useEffect(() => {
    async function loadTierConfigs() {
      try {
        const configs = await getActiveTierConfigs();
        setTierConfigs(configs);
      } catch (error) {
        console.error("Failed to load tier configs:", error);
      }
    }
    loadTierConfigs();
  }, []);

  // Auto-update slug when name changes — uses same slugify as categories/tags/industries
  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === "name") {
        const newSlug = slugify(value.name || "");
        const currentSlug = form.getValues("slug") || "";
        if (newSlug !== currentSlug) {
          form.setValue("slug", newSlug, { shouldValidate: false, shouldDirty: false });
          form.trigger("slug");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-calculate subscription end date (18 months from start)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        (name === "subscriptionTier" || name === "subscriptionStartDate") &&
        value.subscriptionTier &&
        value.subscriptionStartDate
      ) {
        const startDate = new Date(value.subscriptionStartDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 18);
        form.setValue("subscriptionEndDate", endDate, { shouldValidate: false });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-update articlesPerMonth when tier changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "subscriptionTier" && value.subscriptionTier && tierConfigs.length > 0) {
        const tierConfig = tierConfigs.find(
          (config) => config.tier === value.subscriptionTier
        );
        if (tierConfig) {
          form.setValue("articlesPerMonth", tierConfig.articlesPerMonth, { shouldValidate: false });
          form.setValue("subscriptionTierConfigId", tierConfig.id, { shouldValidate: false });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, tierConfigs]);

  const handleSubmit = form.handleSubmit(
    async (data) => {
      setLoading(true);
      setError(null);
      setInvalidFields([]);

      // Convert form data to ClientFormData format
      const submitData = {
        ...data,
        legalName: data.legalName === null ? undefined : data.legalName,
        url: data.url === null ? undefined : data.url,
        sameAs: Array.isArray(data.sameAs) ? data.sameAs : [],
        contentPriorities: Array.isArray(data.contentPriorities) ? data.contentPriorities : [],
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        knowsLanguage: Array.isArray(data.knowsLanguage) ? data.knowsLanguage : [],
        foundingDate: data.foundingDate || null,
        subscriptionStartDate: data.subscriptionStartDate || null,
        subscriptionEndDate: data.subscriptionEndDate || null,
        articlesPerMonth: data.articlesPerMonth ?? undefined,
        subscriptionTierConfigId: data.subscriptionTierConfigId || null,
        subscriptionTier: data.subscriptionTier || null,
        subscriptionStatus: data.subscriptionStatus || "PENDING",
        paymentStatus: data.paymentStatus || "PENDING",
        description: data.description || null,
        contactType: data.contactType || null,
        addressStreet: data.addressStreet || null,
        addressCity: data.addressCity || null,
        addressCountry: data.addressCountry || null,
        addressPostalCode: data.addressPostalCode || null,
        addressRegion: data.addressRegion || null,
        addressNeighborhood: data.addressNeighborhood || null,
        addressBuildingNumber: data.addressBuildingNumber || null,
        addressAdditionalNumber: data.addressAdditionalNumber || null,
        addressLatitude: data.addressLatitude || null,
        addressLongitude: data.addressLongitude || null,
        commercialRegistrationNumber: data.commercialRegistrationNumber || null,
        vatID: data.vatID || null,
        taxID: data.taxID || data.vatID || null, // Fallback to VAT ID only if Tax ID is not provided
        legalForm: data.legalForm || null,
        businessActivityCode: data.businessActivityCode || null,
        isicV4: data.isicV4 || null,
        numberOfEmployees: data.numberOfEmployees || null,
        alternateName: data.alternateName || null,
        slogan: data.slogan || null,
        newsletterCtaText: data.newsletterCtaText || null,
        organizationType: data.organizationType || null,
        parentOrganizationId: data.parentOrganizationId || null,
        // (Twitter card/title/site/description are generated from Settings + hero
        // image, not Client columns — no longer submitted.)
        canonicalUrl: data.canonicalUrl || null,
        metaRobots: data.metaRobots || null,
        // Google Business Profile + Local SEO (explicit so they survive submit)
        gbpProfileUrl: (data as { gbpProfileUrl?: string | null }).gbpProfileUrl || null,
        gbpPlaceId: (data as { gbpPlaceId?: string | null }).gbpPlaceId || null,
        gbpAccountId: (data as { gbpAccountId?: string | null }).gbpAccountId || null,
        gbpLocationId: (data as { gbpLocationId?: string | null }).gbpLocationId || null,
        gbpCategory: (data as { gbpCategory?: string | null }).gbpCategory || null,
        priceRange: (data as { priceRange?: string | null }).priceRange || null,
        // YMYL verification fields
        isYmyl: data.isYmyl ?? false,
        ymylCategory: data.ymylCategory ?? null,
        ymylData: data.ymylData ?? null,
      } as ClientFormData;

      const result = clientId
        ? await updateClient(clientId, submitData)
        : await createClient(submitData);

      if (result.success) {
        const clientName = data.name || "Client";
        toast({
          title: isEditMode ? messages.success.updated : messages.success.created,
          description: isEditMode
            ? `${clientName} has been updated successfully.`
            : `${clientName} has been created successfully and is ready for use.`,
        });
        setLoading(false);
        // Create mode with a handler: hand control to the caller (welcome-email
        // dialog) instead of navigating immediately. result.data carries id/email.
        if (!isEditMode && onCreated && "client" in result && result.client) {
          onCreated({
            id: result.client.id,
            name: result.client.name,
            email: result.client.email ?? "",
          });
          return;
        }
        router.push("/clients");
        router.refresh();
      } else {
        setError(result.error || "Failed to save client. Please check all required fields and try again.");
        setLoading(false);
      }
    },
    (errors) => {
      // Validation failed. Instead of a silent dead button (or a technical toast),
      // collect a plain-language list of what's blocking the save. The form renders
      // it as a prominent banner at the top so the admin sees exactly what to fix.
      const items = (Object.keys(errors) as string[])
        .filter((key) => key !== "root")
        .map((key) => {
          const label =
            FIELD_LABELS[key] ??
            key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
          return `${label} — ${friendlyMessage((errors as Record<string, { message?: string }>)[key]?.message)}`;
        });
      setInvalidFields(items);

      // Focus first error field (exclude "root"). The form reveals every accordion
      // section on a failed submit, so the field is mounted in the DOM.
      const firstErrorField = (Object.keys(errors).filter((key) => key !== "root") as Array<keyof ClientFormData>)[0];
      if (firstErrorField && form) {
        try {
          form.setFocus(firstErrorField as any);
        } catch {
          // Ignore focus errors for invalid field names
        }
      }
    }
  );

  return {
    form,
    handleSubmit,
    loading,
    error,
    setError,
    invalidFields,
    setInvalidFields,
    tierConfigs,
    isEditMode,
  };
}
