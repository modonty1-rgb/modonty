"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { SubscriptionTier } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

interface TierConfig {
  id: string;
  tier: SubscriptionTier;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive: boolean;
  isPopular: boolean;
  description: string | null;
}

interface TierFormProps {
  initialData?: TierConfig;
  onSubmit: (data: {
    name: string;
    articlesPerMonth: number;
    price: number;
    isActive: boolean;
    isPopular: boolean;
    description: string | null;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function TierForm({ initialData, onSubmit }: TierFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    articlesPerMonth: initialData?.articlesPerMonth || 0,
    price: initialData?.price || 0,
    isActive: initialData?.isActive ?? true,
    isPopular: initialData?.isPopular ?? false,
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.articlesPerMonth <= 0) {
      setError("Articles per month must be greater than 0");
      setLoading(false);
      return;
    }

    if (formData.price < 0) {
      setError("Price must be greater than or equal to 0");
      setLoading(false);
      return;
    }

    const result = await onSubmit({
      name: formData.name,
      articlesPerMonth: formData.articlesPerMonth,
      price: formData.price,
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      description: formData.description || null,
    });

    if (result.success) {
      toast({
        title: "Tier config updated",
        description: "Subscription tier configuration has been saved successfully.",
      });
      router.push("/subscription-tiers");
      router.refresh();
    } else {
      setError(result.error || "Failed to save tier config");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Tier Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="Tier Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              hint="Display name for this tier (e.g., 'Basic', 'Standard')"
            />

            <FormInput
              label="Articles Per Month"
              name="articlesPerMonth"
              type="number"
              value={formData.articlesPerMonth.toString()}
              onChange={(e) =>
                setFormData({ ...formData, articlesPerMonth: parseInt(e.target.value) || 0 })
              }
              required
              hint="Number of articles included per month for this tier"
            />

            <FormInput
              label="Price (SAR/year)"
              name="price"
              type="number"
              value={formData.price.toString()}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              required
              hint="Annual subscription price in Saudi Riyals"
            />

            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              hint="Optional description of what this tier includes"
            />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked === true })
                  }
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Inactive tiers will not appear in client form tier selection
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPopular"
                  checked={formData.isPopular}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPopular: checked === true })
                  }
                />
                <label
                  htmlFor="isPopular"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Most Popular
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Display "Most Popular" badge on this tier in client form
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
