"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  GripVertical, X, Loader2, AlertCircle, ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { IntakeQuestionType } from "@prisma/client";
import {
  createQuestion, updateQuestion, deleteQuestion, setQuestionEnabled,
  moveQuestion, setSectionEnabled,
  type IntakeFormTree, type IntakeQuestionTree, type QuestionInput,
} from "../actions/intake-admin-actions";

// Admin-facing answer categories — deliberately few + plain language. The engine
// supports more internal types (SELECT/CHECKBOX/REPEATED_GROUP/GROUP), but the admin
// only ever picks from these five. Editing keeps the stored type AS-IS unless the
// admin actually switches category, so seeded questions never silently convert.
type FriendlyCat = "short" | "long" | "single" | "multi" | "boolean";

const FRIENDLY_LABEL: Record<FriendlyCat, string> = {
  short: "Short text",
  long: "Long text (paragraph)",
  single: "Pick one",
  multi: "Pick several",
  boolean: "Yes / No",
};

const CAT_PRIMARY: Record<FriendlyCat, IntakeQuestionType> = {
  short: "TEXT",
  long: "TEXTAREA",
  single: "RADIO",
  multi: "MULTI_PILL",
  boolean: "BOOLEAN",
};

function typeToCat(t: IntakeQuestionType): FriendlyCat | "advanced" {
  switch (t) {
    case "TEXT": return "short";
    case "TEXTAREA": return "long";
    case "SELECT":
    case "RADIO": return "single";
    case "MULTI_PILL":
    case "CHECKBOX": return "multi";
    case "BOOLEAN": return "boolean";
    default: return "advanced"; // REPEATED_GROUP, GROUP — locked in the UI
  }
}

function friendlyLabel(t: IntakeQuestionType): string {
  const cat = typeToCat(t);
  return cat === "advanced" ? "Advanced field" : FRIENDLY_LABEL[cat];
}

const CHOICE_TYPES: IntakeQuestionType[] = ["SELECT", "RADIO", "MULTI_PILL", "CHECKBOX"];

interface OptionDraft {
  value: string;
  label: string;
  marketScope: "SA" | "EG" | "ALL";
}

interface QuestionDraft {
  key: string;
  label: string;
  helpText: string;
  placeholder: string;
  type: IntakeQuestionType;
  required: boolean;
  maxLength: string;
  options: OptionDraft[];
}

function emptyDraft(): QuestionDraft {
  return {
    key: "", label: "", helpText: "", placeholder: "",
    type: "TEXT", required: false, maxLength: "", options: [],
  };
}

function toDraft(q: IntakeQuestionTree): QuestionDraft {
  return {
    key: q.key,
    label: q.label,
    helpText: q.helpText ?? "",
    placeholder: q.placeholder ?? "",
    type: q.type,
    required: q.required,
    maxLength: q.maxLength != null ? String(q.maxLength) : "",
    options: q.options.map((o) => ({
      value: o.value,
      label: o.label,
      marketScope: (o.marketScope as "SA" | "EG" | null) ?? "ALL",
    })),
  };
}

function draftToInput(d: QuestionDraft): QuestionInput {
  return {
    // key omitted on create (auto-generated server-side); kept untouched on edit.
    key: d.key.trim() || undefined,
    label: d.label.trim(),
    helpText: d.helpText.trim() || null,
    placeholder: d.placeholder.trim() || null,
    type: d.type,
    required: d.required,
    maxLength: d.maxLength.trim() ? Number(d.maxLength) : null,
    options: CHOICE_TYPES.includes(d.type)
      ? d.options.map((o) => ({
          // value is an internal identifier — admin only edits the visible label.
          value: o.value.trim() || o.label.trim(),
          label: o.label.trim(),
          marketScope: o.marketScope === "ALL" ? null : o.marketScope,
        }))
      : [],
  };
}

export function IntakeManager({ form }: { form: IntakeFormTree }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<
    | { mode: "create"; sectionId: string; draft: QuestionDraft }
    | { mode: "edit"; questionId: string; draft: QuestionDraft }
    | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        onOk?.();
        router.refresh();
      } else {
        setError(res.error ?? "خطأ غير متوقع");
      }
    });
  };

  const saveDialog = () => {
    if (!dialog) return;
    const input = draftToInput(dialog.draft);
    if (dialog.mode === "create") {
      run(() => createQuestion(dialog.sectionId, input), () => setDialog(null));
    } else {
      run(() => updateQuestion(dialog.questionId, input), () => setDialog(null));
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {form.sections.map((section) => (
        <div key={section.id} className="overflow-hidden rounded-xl border bg-card">
          {/* Section header */}
          <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {section.order}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-bold">{section.title}</h3>
                  {!section.enabled && <Badge variant="outline" className="text-amber-600">Hidden</Badge>}
                  {section.visibility != null && (
                    <Badge variant="outline" className="text-blue-600">Conditional</Badge>
                  )}
                </div>
                {section.description && (
                  <p className="truncate text-xs text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="sm" variant="ghost" className="gap-1.5"
                disabled={pending}
                onClick={() => run(() => setSectionEnabled(section.id, !section.enabled))}
                title={section.enabled ? "Hide section" : "Show section"}
              >
                {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-amber-600" />}
              </Button>
              <Button
                size="sm" variant="outline" className="gap-1.5"
                onClick={() => setDialog({ mode: "create", sectionId: section.id, draft: emptyDraft() })}
              >
                <Plus className="h-3.5 w-3.5" /> Question
              </Button>
            </div>
          </div>

          {/* Questions */}
          <ul className="divide-y">
            {section.questions.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No questions yet.</li>
            )}
            {section.questions.map((q, i) => (
              <li key={q.id} className={`flex items-center gap-3 px-4 py-2.5 ${!q.enabled ? "opacity-50" : ""}`}>
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{q.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{friendlyLabel(q.type)}</span>
                    {CHOICE_TYPES.includes(q.type) && (
                      <span className="text-[10px] text-muted-foreground">· {q.options.length} choices</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === 0}
                    onClick={() => run(() => moveQuestion(q.id, "up"))} title="Move up">
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending || i === section.questions.length - 1}
                    onClick={() => run(() => moveQuestion(q.id, "down"))} title="Move down">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" disabled={pending}
                    onClick={() => run(() => setQuestionEnabled(q.id, !q.enabled))}
                    title={q.enabled ? "Disable" : "Enable"}>
                    {q.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-amber-600" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600"
                    onClick={() => setDialog({ mode: "edit", questionId: q.id, draft: toDraft(q) })} title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                    onClick={() => setConfirmDelete({ id: q.id, label: q.label })} title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ─── Create / Edit dialog ─────────────────────────────────────────── */}
      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              {dialog?.mode === "create" ? "Add question" : "Edit question"}
            </DialogTitle>
          </DialogHeader>

          {dialog && (
            <QuestionForm
              draft={dialog.draft}
              onChange={(draft) =>
                setDialog((prev) => (prev ? { ...prev, draft } : prev))}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)} disabled={pending}>Cancel</Button>
            <Button onClick={saveDialog} disabled={pending} className="gap-2">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete confirm ───────────────────────────────────────────────── */}
      <AlertDialog open={confirmDelete !== null} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.label}” will be permanently removed. Client answers already saved under its
              key stay in the data and are simply no longer shown. Prefer <b>Disable</b> if you might bring it back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) run(() => deleteQuestion(confirmDelete.id), () => setConfirmDelete(null));
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Question form (inside dialog) ─────────────────────────────────────────────
function QuestionForm({
  draft, onChange,
}: {
  draft: QuestionDraft;
  onChange: (d: QuestionDraft) => void;
}) {
  const set = <K extends keyof QuestionDraft>(key: K, value: QuestionDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const isChoice = CHOICE_TYPES.includes(draft.type);

  const setOption = (i: number, patch: Partial<OptionDraft>) =>
    onChange({ ...draft, options: draft.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) });
  const addOption = () =>
    onChange({ ...draft, options: [...draft.options, { value: "", label: "", marketScope: "ALL" }] });
  const removeOption = (i: number) =>
    onChange({ ...draft, options: draft.options.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label className="text-xs">Question text (shown to client)</Label>
        <Input value={draft.label} onChange={(e) => set("label", e.target.value)} placeholder="نبرة الكتابة" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Answer type</Label>
        {typeToCat(draft.type) === "advanced" ? (
          <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
            Advanced field — type locked (edit text &amp; options only)
          </div>
        ) : (
          <Select
            value={typeToCat(draft.type)}
            onValueChange={(cat) => {
              if (typeToCat(draft.type) !== cat) set("type", CAT_PRIMARY[cat as FriendlyCat]);
            }}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(FRIENDLY_LABEL) as FriendlyCat[]).map((c) => (
                <SelectItem key={c} value={c}>{FRIENDLY_LABEL[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Options editor */}
      {isChoice && (
        <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold">Options</Label>
            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={addOption}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          {draft.options.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">No options yet — add at least one.</p>
          )}
          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={opt.label}
                onChange={(e) => setOption(i, { label: e.target.value })}
                placeholder="Choice text (shown to client)"
                className="flex-1"
              />
              <Select value={opt.marketScope} onValueChange={(v) => setOption(i, { marketScope: v as OptionDraft["marketScope"] })}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All markets</SelectItem>
                  <SelectItem value="SA">🇸🇦 SA</SelectItem>
                  <SelectItem value="EG">🇪🇬 EG</SelectItem>
                </SelectContent>
              </Select>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeOption(i)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
