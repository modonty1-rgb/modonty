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
  createKeyword,
  updateKeyword,
  deleteKeyword,
} from "../actions/seo-actions";
import type { ClientKeyword } from "@prisma/client";

const INTENTS = [
  { value: "transactional", label: ar.seo.transactional },
  { value: "informational", label: ar.seo.informational },
  { value: "commercial", label: ar.seo.commercial },
];

interface KeywordsTabProps {
  clientId: string;
  keywords: ClientKeyword[];
}

export function KeywordsTab({ clientId, keywords }: KeywordsTabProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    keyword: "",
    intent: "",
    priority: "0",
    reason: "",
  });

  async function handleAdd() {
    if (!form.keyword.trim()) return;
    setLoading(true);
    setError(null);
    const res = await createKeyword(clientId, {
      keyword: form.keyword,
      intent: form.intent || null,
      priority: parseInt(form.priority, 10) || 0,
      reason: form.reason || null,
    });
    setLoading(false);
    if (res.success) {
      setAdding(false);
      setForm({ keyword: "", intent: "", priority: "0", reason: "" });
      router.refresh();
    } else setError(res.error ?? "Failed");
  }

  async function handleUpdate(
    id: string,
    data: { keyword: string; intent: string | null; priority: number; reason: string | null }
  ) {
    setLoading(true);
    setError(null);
    const res = await updateKeyword(id, data);
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
    const res = await deleteKeyword(id);
    setLoading(false);
    if (res.success) router.refresh();
    else setError(res.error ?? "Failed");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{ar.seo.keywords}</CardTitle>
        <Button size="sm" onClick={() => setAdding(true)} disabled={loading}>
          {ar.seo.addKeyword}
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
                <Label>{ar.seo.keyword}</Label>
                <Input
                  value={form.keyword}
                  onChange={(e) => setForm((p) => ({ ...p, keyword: e.target.value }))}
                  placeholder="الكلمة المفتاحية"
                />
              </div>
              <div>
                <Label>{ar.seo.intent}</Label>
                <select
                  value={form.intent}
                  onChange={(e) => setForm((p) => ({ ...p, intent: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">—</option>
                  {INTENTS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>{ar.seo.priority}</Label>
                <Input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                />
              </div>
              <div>
                <Label>{ar.seo.reason}</Label>
                <Input
                  value={form.reason}
                  onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={loading || !form.keyword.trim()}>
                {ar.seo.save}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                {ar.seo.cancel}
              </Button>
            </div>
          </div>
        )}

        {keywords.length === 0 && !adding ? (
          <p className="text-muted-foreground text-sm">{ar.seo.noKeywords}</p>
        ) : (
          <div className="space-y-3">
            {keywords.map((k) => (
              <KeywordRow
                key={k.id}
                keyword={k}
                editing={editing === k.id}
                loading={loading}
                onEdit={() => setEditing(k.id)}
                onCancel={() => setEditing(null)}
                onSave={(data) => handleUpdate(k.id, data)}
                onDelete={() => handleDelete(k.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KeywordRow({
  keyword,
  editing,
  loading,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: {
  keyword: ClientKeyword;
  editing: boolean;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: { keyword: string; intent: string | null; priority: number; reason: string | null }) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState({
    keyword: keyword.keyword,
    intent: keyword.intent ?? "",
    priority: String(keyword.priority),
    reason: keyword.reason ?? "",
  });

  if (editing) {
    return (
      <div className="p-4 border border-border rounded-md space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>{ar.seo.keyword}</Label>
            <Input
              value={form.keyword}
              onChange={(e) => setForm((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <div>
            <Label>{ar.seo.intent}</Label>
            <select
              value={form.intent}
              onChange={(e) => setForm((p) => ({ ...p, intent: e.target.value }))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">—</option>
              {INTENTS.map((i) => (
                <option key={i.value} value={i.value}>
                  {i.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>{ar.seo.priority}</Label>
            <Input
              type="number"
              value={form.priority}
              onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
            />
          </div>
          <div>
            <Label>{ar.seo.reason}</Label>
            <Input
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              onSave({
                keyword: form.keyword,
                intent: form.intent || null,
                priority: parseInt(form.priority, 10) || 0,
                reason: form.reason || null,
              })
            }
            disabled={loading || !form.keyword.trim()}
          >
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
        <p className="font-medium">{keyword.keyword}</p>
        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
          {keyword.intent && <span>{INTENTS.find((i) => i.value === keyword.intent)?.label ?? keyword.intent}</span>}
          {keyword.priority > 0 && <span>• الأولوية: {keyword.priority}</span>}
        </div>
        {keyword.reason && <p className="text-sm text-muted-foreground mt-1">{keyword.reason}</p>}
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
