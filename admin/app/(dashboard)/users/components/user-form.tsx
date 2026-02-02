"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormNativeSelect } from "@/components/admin/form-field";
import { UserRole, User } from "@prisma/client";
import { UserFormData, FormSubmitResult } from "@/lib/types";

interface UserFormProps {
  initialData?: Partial<User>;
  clients: Array<{ id: string; name: string }>;
  onSubmit: (data: UserFormData) => Promise<FormSubmitResult>;
}

export function UserForm({ initialData, clients, onSubmit }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "EDITOR",
    clientAccess: initialData?.clientAccess?.join(",") || "",
    image: initialData?.image || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onSubmit({
      ...formData,
      role: formData.role as UserRole | undefined,
      password: formData.password || undefined,
      clientAccess: formData.clientAccess
        ? formData.clientAccess.split(",").map((c: string) => c.trim()).filter(Boolean)
        : [],
    });

    if (result.success) {
      router.push("/users");
      router.refresh();
    } else {
      setError(result.error || "Failed to save user");
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
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormInput
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label={initialData ? "New Password (leave empty to keep current)" : "Password"}
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!initialData}
            />
            <FormNativeSelect
              label="Role"
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="CLIENT">Client</option>
              <option value="EDITOR">Editor</option>
            </FormNativeSelect>
            <FormInput
              label="Client Access (comma-separated IDs, leave empty for all)"
              name="clientAccess"
              value={formData.clientAccess}
              onChange={(e) => setFormData({ ...formData, clientAccess: e.target.value })}
              placeholder="client-id-1, client-id-2"
            />
            <FormInput
              label="Avatar URL"
              name="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update User" : "Create User"}
          </Button>
        </div>
      </div>
    </form>
  );
}
