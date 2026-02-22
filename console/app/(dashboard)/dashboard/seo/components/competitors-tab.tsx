"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ar } from "@/lib/ar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
} from "../actions/seo-actions";
import type { ClientCompetitor } from "@prisma/client";

interface CompetitorsTabProps {
  clientId: string;
  competitors: ClientCompetitor[];
}

export function CompetitorsTab({ clientId, competitors }: CompetitorsTabProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "", notes: "" });

  async function handleAdd() {
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    const res = await createCompetitor(clientId, {
      name: form.name,
      url: form.url || null,
      notes: form.notes || null,
      order: competitors.length,
    });
    setLoading(false);
    if (res.success) {
      setAdding(false);
      setForm({ name: "", url: "", notes: "" });
      router.refresh();
    } else setError(res.error ?? "Failed");
  }

  async function handleUpdate(id: string, data: { name: string; url: string; notes: string }) {
    setLoading(true);
    setError(null);
    const res = await updateCompetitor(id, data);
    setLoading(false);
    if (res.success) {
      setEditing(null);
      router.refresh();
    } else setError(res.error ?? "Failed");
  }

  async function handleDelete(id: string) {
    if (!confirm(ar.seo.deleteConfirm)) return;
    setLoading(true);
    setError(null);
    const res = await deleteCompetitor(id);
    setLoading(false);
    if (res.success) router.refresh();
    else setError(res.error ?? "Failed");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{ar.seo.competitors}</CardTitle>
        <Button size="sm" onClick={() => setAdding(true)} disabled={loading}>
          {ar.seo.addCompetitor}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
        )}

        {adding && (
          <div className="p-4 border border-border rounded-md space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>{ar.seo.name}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="اسم المنافس"
                />
              </div>
              <div>
                <Label>{ar.seo.url}</Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <Label>{ar.seo.notes}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !form.name.trim()}>
                {ar.seo.save}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                {ar.seo.cancel}
              </Button>
            </div>
          </div>
        )}

        {competitors.length === 0 && !adding ? (
          <p className="text-muted-foreground text-sm">{ar.seo.noCompetitors}</p>
        ) : (
          <div className="space-y-3">
            {competitors.map((c) => (
              <CompetitorRow
                key={c.id}
                competitor={c}
                editing={editing === c.id}
                loading={loading}
                onEdit={() => setEditing(c.id)}
                onCancel={() => setEditing(null)}
                onSave={(data) => handleUpdate(c.id, data)}
                onDelete={() => handleDelete(c.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitorRow({
  competitor,
  editing,
  loading,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  competitor: ClientCompetitor;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { name: string; url: string; notes: string }) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    name: competitor.name,
    url: competitor.url ?? "",
    notes: competitor.notes ?? "",
  });

  if (editing) {
    return (
      <div className="p-4 border border-border rounded-md space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>{ar.seo.name}</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>{ar.seo.url}</Label>
            <Input
              value={form.url}
              onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label>{ar.seo.notes}</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onSave(form)} disabled={loading || !form.name.trim()}>
            {ar.seo.save}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            {ar.seo.cancel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between p-4 border border-border rounded-md">
      <div>
        <p className="font-medium">{competitor.name}</p>
        {competitor.url && (
          <a
            href={competitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {competitor.url}
          </a>
        )}
        {competitor.notes && <p className="text-sm text-muted-foreground mt-1">{competitor.notes}</p>}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={onEdit} disabled={loading}>
          {ar.seo.edit}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} disabled={loading} className="text-destructive">
          {ar.seo.delete}
        </Button>
      </div>
    </div>
  );
}
