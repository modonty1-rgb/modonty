"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/admin/form-field";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Loader2, Save, DollarSign, FileText, Star, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateTierConfig } from "../actions/tier-actions";

interface TierConfig {
  id: string;
  tier: string;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive: boolean;
  isPopular: boolean;
  description: string | null;
}

interface TierFormProps {
  initialData: TierConfig;
}

export function TierForm({ initialData }: TierFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData.name,
    articlesPerMonth: initialData.articlesPerMonth,
    price: initialData.price,
    isActive: initialData.isActive,
    isPopular: initialData.isPopular,
    description: initialData.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.articlesPerMonth <= 0) {
      setError("Articles per month must be at least 1");
      setLoading(false);
      return;
    }

    if (formData.price < 0) {
      setError("Price cannot be negative");
      setLoading(false);
      return;
    }

    const result = await updateTierConfig(initialData.id, {
      name: formData.name,
      articlesPerMonth: formData.articlesPerMonth,
      price: formData.price,
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      description: formData.description || null,
    });

    if (result.success) {
      toast({
        title: "Plan Updated",
        description: `${formData.name} plan has been saved successfully.`,
      });
      router.push("/subscription-tiers");
      router.refresh();
    } else {
      setError(result.error || "Could not save. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/subscription-tiers">
            <Button variant="ghost" size="icon" type="button">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Edit {initialData.name} Plan</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Update pricing, limits, and visibility</p>
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 me-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 me-2" /> Save Changes</>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Plan Details</CardTitle>
                <CardDescription>Name, pricing, and article limits</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormInput
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Basic, Standard, Pro"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Articles Per Month"
                name="articlesPerMonth"
                type="number"
                value={formData.articlesPerMonth.toString()}
                onChange={(e) => setFormData({ ...formData, articlesPerMonth: parseInt(e.target.value) || 0 })}
                required
                hint="How many articles the client gets monthly"
              />
              <FormInput
                label="Price (SAR / Year)"
                name="price"
                type="number"
                value={formData.price.toString()}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                hint="Annual subscription price"
                step="0.01"
              />
            </div>
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="What's included in this plan..."
              hint="Shown to clients when choosing a plan"
            />
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
            <CardDescription>Control how this plan appears</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                className="mt-0.5"
              />
              <div>
                <label htmlFor="isActive" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Power className="h-4 w-4" />
                  Active
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When off, this plan won't appear as an option for new clients
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="isPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked === true })}
                className="mt-0.5"
              />
              <div>
                <label htmlFor="isPopular" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4" />
                  Highlight as Recommended
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shows a "Recommended" badge to help clients choose this plan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
