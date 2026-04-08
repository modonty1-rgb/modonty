"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { messages } from "@/lib/messages";
import { updateClient } from "../../actions/clients-actions";
import { clientFormSchema, clientMediaSchema, type ClientFormSchemaType, type ClientMediaSchemaType } from "../../helpers/client-form-schema";
import { mapInitialDataToFormData } from "../../helpers/map-initial-data-to-form-data";
import type { ClientWithRelations, ClientFormData } from "@/lib/types";

interface UseClientMediaModalOptions {
  clientId: string;
  initialData?: Partial<ClientWithRelations>;
}

export function useClientMediaModal({
  clientId,
  initialData,
}: UseClientMediaModalOptions) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with MEDIA-ONLY schema - only validates media fields
  // This prevents validation errors from full client form schema
  const form = useForm<ClientMediaSchemaType>({
    resolver: zodResolver(clientMediaSchema),
    defaultValues: {
      logoMediaId: initialData?.logoMediaId || null,
      heroImageMediaId: initialData?.heroImageMediaId || null,
    },
    mode: "onSubmit",
  });

  const handleSave = form.handleSubmit(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        // Prepare form data for updateClient (only media fields)
        const submitData: Partial<ClientFormData> = {
          logoMediaId: data.logoMediaId,
          heroImageMediaId: data.heroImageMediaId,
        } as ClientFormData;

        const result = await updateClient(clientId, submitData as ClientFormData);

        if (result.success) {
          toast({
            title: messages.success.updated,
            description: "Media updated successfully.",
          });
          setLoading(false);
          // Return success flag for modal to close
          return { success: true };
        } else {
          setError(result.error || "Failed to save media. Please try again.");
          setLoading(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setLoading(false);
      }
    },
    (errors) => {
      // Handle validation errors
      const errorMessages: string[] = [];

      if (errors.logoMediaId?.message) {
        errorMessages.push(`Logo: ${errors.logoMediaId.message}`);
      }
      if (errors.heroImageMediaId?.message) {
        errorMessages.push(`Hero Image: ${errors.heroImageMediaId.message}`);
      }

      if (errorMessages.length > 0) {
        setError(errorMessages.join("\n"));
      }
      setLoading(false);
    }
  );

  return {
    form,
    handleSave,
    loading,
    error,
    setError,
  };
}
