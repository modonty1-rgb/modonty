"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { clientFormSchema, type ClientFormSchemaType } from "../client-form-schema";
import { mapInitialDataToFormData } from "../map-initial-data-to-form-data";
import type { ClientFormData, ClientWithRelations, FormSubmitResult } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { updateClient } from "../../actions/clients-actions";
import { SubscriptionTier } from "@prisma/client";
import { getActiveTierConfigs } from "@/app/(dashboard)/subscription-tiers/actions/tier-actions";

interface UseClientFormOptions {
  initialData?: Partial<ClientWithRelations>;
  onSubmit: (data: ClientFormData) => Promise<FormSubmitResult>;
  clientId?: string;
}

export function useClientForm({ initialData, onSubmit, clientId }: UseClientFormOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // Auto-update slug when name changes (pure Arabic slug for SEO - best practice)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update slug when name field changes, not on any other field change
      if (name === "name" && value.name) {
        // Common Arabic business stop words to remove for catchier slugs
        const arabicStopWords = [
          "الشركة",
          "المؤسسة",
          "الشاملة",
          "للتكنولوجيا",
          "الخدمات",
          "الحلول",
          "المحدودة",
          "المساهمة",
          "الشركات",
          "المجموعة",
          "الدولية",
          "العالمية",
          "للتسويق",
          "للإعلام",
          "للاستشارات",
        ];

        let slug = value.name;

        // Remove Arabic stop words for catchier slugs
        for (const word of arabicStopWords) {
          slug = slug.replace(new RegExp(word, "gi"), " ");
        }

        // Remove Arabic definite article "ال" at start of words for cleaner slugs
        slug = slug.replace(/\bال(?=[\u0600-\u06FF])/g, "");

        // Remove English business stop words if mixed with Arabic
        const englishStopWords = /\b(inc|incorporated|llc|ltd|limited|corp|corporation|company|co|group|international|global|enterprises|holdings|solutions|services|systems|tech|technology|saudi|arabia)\b/gi;
        slug = slug.replace(englishStopWords, " ");

        // Generate pure Arabic slug (UTF-8 supported - SEO best practice)
        // Keep Arabic characters (\u0600-\u06FF), English letters, numbers, spaces, hyphens
        const newSlug = slug
          .trim()
          .replace(/[^\u0600-\u06FFa-z0-9\s-]+/g, "") // Keep Arabic, English, numbers, spaces, hyphens
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .replace(/(^-|-$)/g, "") // Remove leading/trailing hyphens
          .substring(0, 50); // Limit length for catchiness

        // Only update if slug actually changed to prevent infinite loops
        const currentSlug = form.getValues("slug") || "";
        if (newSlug !== currentSlug && newSlug.length > 0) {
          form.setValue("slug", newSlug, { shouldValidate: false, shouldDirty: false });
          // Trigger validation for slug field to clear any "required" errors
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

      // Additional validation for edit mode
      if (isEditMode) {
        if (data.gtmId && !/^GTM-[A-Z0-9]+$/.test(data.gtmId)) {
          setError("GTM ID must be in format GTM-XXXXXXX");
          setLoading(false);
          form.setFocus("gtmId");
          return;
        }
      }

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
        taxID: data.vatID || data.taxID || null, // Use VAT ID as Tax ID if Tax ID is not provided
        legalForm: data.legalForm || null,
        businessActivityCode: data.businessActivityCode || null,
        isicV4: data.isicV4 || null,
        numberOfEmployees: data.numberOfEmployees || null,
        licenseNumber: data.licenseNumber || null,
        licenseAuthority: data.licenseAuthority || null,
        alternateName: data.alternateName || null,
        slogan: data.slogan || null,
        organizationType: data.organizationType || null,
        parentOrganizationId: data.parentOrganizationId || null,
        twitterCard: data.twitterCard && data.twitterCard !== "auto" ? data.twitterCard : null,
        twitterTitle: data.twitterTitle || null,
        twitterDescription: data.twitterDescription || null,
        twitterSite: data.twitterSite || null,
        canonicalUrl: data.canonicalUrl || null,
        metaRobots: data.metaRobots || null,
      } as ClientFormData;

      const result = clientId
        ? await updateClient(clientId, submitData)
        : await onSubmit(submitData);

      if (result.success) {
        const clientName = data.name || "Client";
        toast({
          title: isEditMode ? "Client Updated Successfully" : "Client Created Successfully",
          description: isEditMode
            ? `${clientName} has been updated successfully.`
            : `${clientName} has been created successfully and is ready for use.`,
        });
        router.push("/clients");
        router.refresh();
      } else {
        setError(result.error || "Failed to save client. Please check all required fields and try again.");
        setLoading(false);
      }
    },
    (errors) => {
      // Handle validation errors - aggregate all field errors
      const errorMessages: string[] = [];

      if (errors.name) {
        errorMessages.push(`Name: ${errors.name.message}`);
      }
      if (errors.slug) {
        errorMessages.push(`Slug: ${errors.slug.message}`);
      }
      if (errors.subscriptionTier) {
        errorMessages.push(`Subscription Tier: ${errors.subscriptionTier.message}`);
      }
      if (errors.businessBrief) {
        errorMessages.push(`Business Brief: ${errors.businessBrief.message}`);
      }

      // Add other field errors
      Object.entries(errors).forEach(([field, error]) => {
        if (field !== "name" && field !== "slug" && field !== "subscriptionTier" && field !== "businessBrief" && error?.message) {
          const fieldLabel = field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
          errorMessages.push(`${fieldLabel}: ${error.message}`);
        }
      });

      // Set aggregated error message
      if (errorMessages.length > 0) {
        setError(`Please fix the following errors:\n${errorMessages.join("\n")}`);
      }

      // Focus on first error field (exclude "root")
      const errorKeys = Object.keys(errors).filter(key => key !== "root") as Array<keyof ClientFormData>;
      const firstErrorField = errorKeys[0];
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
    tierConfigs,
    isEditMode,
  };
}
