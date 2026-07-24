"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Globe2,
  MousePointerClick,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
  X,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  saveCountry,
  deleteCountry,
  setCountryActive,
  saveAuthority,
  deleteAuthority,
  setAuthorityActive,
  saveCtaPreset,
  deleteCtaPreset,
  setCtaPresetActive,
  seedReferenceDefaults,
  type CountryDTO,
  type AuthorityDTO,
  type CtaPresetDTO,
  type CtaPresetMode,
} from "../actions/reference-data-actions";

type Category = AuthorityDTO["category"];

const CATEGORIES: Category[] = ["medical", "legal", "financial"];
const CATEGORY_LABELS: Record<Category, string> = {
  medical: "Medical",
  legal: "Legal",
  financial: "Financial",
};

// ── Small shared bits ───────────────────────────────────────────────────────
function StatusToggle({
  active,
  onToggle,
  disabled,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
          : "border-slate-400/40 bg-slate-400/10 text-slate-600 dark:text-slate-400 hover:bg-slate-400/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
        onClick={onDelete}
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export function ReferenceDataClient({
  initialCountries,
  initialAuthorities,
  initialCtaPresets,
}: {
  initialCountries: CountryDTO[];
  initialAuthorities: AuthorityDTO[];
  initialCtaPresets: CtaPresetDTO[];
}) {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryDTO[]>(initialCountries);
  const [authorities, setAuthorities] = useState<AuthorityDTO[]>(initialAuthorities);
  const [ctaPresets, setCtaPresets] = useState<CtaPresetDTO[]>(initialCtaPresets);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-sync with server truth after revalidation / router.refresh() (seed,
  // error-revert). Optimistic local edits are confirmed by the fresh props.
  useEffect(() => setCountries(initialCountries), [initialCountries]);
  useEffect(() => setAuthorities(initialAuthorities), [initialAuthorities]);
  useEffect(() => setCtaPresets(initialCtaPresets), [initialCtaPresets]);

  const fail = (msg?: string) => setError(msg ?? "Something went wrong.");

  // ── Country handlers ──
  const saveCountryRow = async (row: {
    id?: string;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }): Promise<boolean> => {
    const res = await saveCountry(row);
    if (!res.success || !res.country) {
      fail(res.error);
      return false;
    }
    const saved = res.country;
    setCountries((prev) =>
      prev.some((c) => c.id === saved.id)
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved],
    );
    setError(null);
    return true;
  };
  const deleteCountryRow = (id: string) =>
    startTransition(async () => {
      const res = await deleteCountry(id);
      if (!res.success) return fail(res.error);
      setCountries((prev) => prev.filter((c) => c.id !== id));
    });
  const toggleCountryRow = (id: string, current: boolean) => {
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
    startTransition(async () => {
      const res = await setCountryActive(id, !current);
      if (!res.success) {
        fail(res.error);
        router.refresh();
      }
    });
  };

  // ── Authority handlers ──
  const saveAuthorityRow = async (row: {
    id?: string;
    countryCode: string;
    category: Category;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }): Promise<boolean> => {
    const res = await saveAuthority(row);
    if (!res.success || !res.authority) {
      fail(res.error);
      return false;
    }
    const saved = res.authority;
    setAuthorities((prev) =>
      prev.some((a) => a.id === saved.id)
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved],
    );
    setError(null);
    return true;
  };
  const deleteAuthorityRow = (id: string) =>
    startTransition(async () => {
      const res = await deleteAuthority(id);
      if (!res.success) return fail(res.error);
      setAuthorities((prev) => prev.filter((a) => a.id !== id));
    });
  const toggleAuthorityRow = (id: string, current: boolean) => {
    setAuthorities((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a)));
    startTransition(async () => {
      const res = await setAuthorityActive(id, !current);
      if (!res.success) {
        fail(res.error);
        router.refresh();
      }
    });
  };

  // ── CTA preset handlers ──
  // Returns the message instead of raising it page-level: a save started INSIDE the
  // dialog must report inside the dialog, or the banner lands behind the overlay and
  // the person filling the form is told nothing (caught in live test 2026-07-24).
  const saveCtaRow = async (row: {
    id?: string;
    labelAr: string;
    mode: CtaPresetMode;
    defaultUrl: string | null;
    isActive: boolean;
  }): Promise<{ ok: boolean; error?: string }> => {
    const res = await saveCtaPreset(row);
    if (!res.success || !res.preset) {
      return { ok: false, error: res.error ?? "Could not save the button." };
    }
    const saved = res.preset;
    setCtaPresets((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved],
    );
    setError(null);
    return { ok: true };
  };
  const deleteCtaRow = (id: string) =>
    startTransition(async () => {
      const res = await deleteCtaPreset(id);
      if (!res.success) return fail(res.error);
      setCtaPresets((prev) => prev.filter((p) => p.id !== id));
    });
  const toggleCtaRow = (id: string, current: boolean) => {
    setCtaPresets((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p)));
    startTransition(async () => {
      const res = await setCtaPresetActive(id, !current);
      if (!res.success) {
        fail(res.error);
        router.refresh();
      }
    });
  };

  const seed = () =>
    startTransition(async () => {
      const res = await seedReferenceDefaults();
      if (!res.success) return fail(res.error);
      router.refresh();
    });

  const isEmpty = countries.length === 0 && authorities.length === 0 && ctaPresets.length === 0;

  return (
    <div className="max-w-[1080px] mx-auto pb-8">
      {/* Header */}
      <div className="space-y-1.5 mb-4">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Dropdown Lists</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The lists the rest of the platform picks from — edit them once here, everywhere updates.
          CTA buttons are what a visitor clicks on a client page; countries drive the client country
          picker; authorities power YMYL verification (medical, legal, financial).
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <h3 className="mt-3 text-sm font-semibold">No lists yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Load the standard CTA buttons, countries (Saudi Arabia, Egypt, UAE) and their licensing
            authorities to get started. You can edit everything afterwards.
          </p>
          <Button onClick={seed} disabled={pending} className="mt-4 gap-1.5">
            <Sparkles className="h-4 w-4" />
            {pending ? "Loading…" : "Load default data"}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="cta">
          <TabsList>
            <TabsTrigger value="cta" className="gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5" />
              CTA Buttons
            </TabsTrigger>
            <TabsTrigger value="authorities" className="gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              Licensing Authorities
            </TabsTrigger>
            <TabsTrigger value="countries" className="gap-1.5">
              <Globe2 className="h-3.5 w-3.5" />
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cta" className="mt-4">
            <CtaPresetsPanel
              presets={ctaPresets}
              onSave={saveCtaRow}
              onDelete={deleteCtaRow}
              onToggle={toggleCtaRow}
              onSeed={seed}
              busy={pending}
            />
          </TabsContent>

          <TabsContent value="authorities" className="mt-4">
            <AuthoritiesPanel
              authorities={authorities}
              countries={countries}
              onSave={saveAuthorityRow}
              onDelete={deleteAuthorityRow}
              onToggle={toggleAuthorityRow}
              busy={pending}
            />
          </TabsContent>

          <TabsContent value="countries" className="mt-4">
            <CountriesPanel
              countries={countries}
              authorities={authorities}
              onSave={saveCountryRow}
              onDelete={deleteCountryRow}
              onToggle={toggleCountryRow}
              busy={pending}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ── CTA buttons panel ───────────────────────────────────────────────────────
type CtaRow = {
  id?: string;
  labelAr: string;
  mode: CtaPresetMode;
  defaultUrl: string | null;
  isActive: boolean;
};

/** The two behaviours live in code — this only names which one a preset carries. */
const MODE_LABELS: Record<CtaPresetMode, string> = {
  FORM: "Booking form",
  LINK: "External link",
};

function ModeBadge({ mode }: { mode: CtaPresetMode }) {
  const form = mode === "FORM";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        form
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-400"
      }`}
    >
      {MODE_LABELS[mode]}
    </span>
  );
}

function CtaPresetsPanel({
  presets,
  onSave,
  onDelete,
  onToggle,
  onSeed,
  busy,
}: {
  presets: CtaPresetDTO[];
  onSave: (row: CtaRow) => Promise<{ ok: boolean; error?: string }>;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  onSeed: () => void;
  busy: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CtaPresetDTO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* What this list actually controls — the admin picking a button needs to know
          that FORM keeps the lead and LINK gives it away. */}
      <div className="rounded-lg border bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground">
        These are the buttons a client page can show. <strong>Booking form</strong> opens our own
        sheet — the lead lands in your database. <strong>External link</strong> sends the visitor away
        (store, WhatsApp, phone) — you see the click, never the lead. The destination is set per
        client on their edit page.
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{presets.length} buttons</span>
        {/* The page-level seed only shows when EVERY list is empty, so a database that
            already has countries would leave this tab with no way to load its defaults. */}
        {presets.length === 0 && (
          <Button onClick={onSeed} disabled={busy} size="sm" variant="outline" className="ms-auto gap-1.5">
            <Sparkles className="h-4 w-4" />
            {busy ? "Loading…" : "Load default buttons"}
          </Button>
        )}
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          size="sm"
          className={presets.length === 0 ? "gap-1.5" : "ms-auto gap-1.5"}
        >
          <Plus className="h-4 w-4" />
          Add button
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Button text</TableHead>
              <TableHead className="w-[150px]">Behaviour</TableHead>
              <TableHead>Default destination</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[90px] text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No buttons yet — add one, or load the defaults.
                </TableCell>
              </TableRow>
            ) : (
              presets.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-semibold" dir="rtl">
                    {p.labelAr}
                  </TableCell>
                  <TableCell>
                    <ModeBadge mode={p.mode} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.mode === "FORM" ? (
                      <span className="italic">internal — no link</span>
                    ) : (
                      p.defaultUrl || <span className="italic">set per client</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusToggle
                      active={p.isActive}
                      disabled={busy}
                      onToggle={() => onToggle(p.id, p.isActive)}
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <RowActions
                      onEdit={() => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
                      onDelete={() => setDeleteId(p.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CtaPresetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={onSave}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this button?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears from the picker on the client edit page. Clients already using it keep
              their current button — their saved text and link are untouched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
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

function CtaPresetDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: CtaPresetDTO | null;
  onSave: (row: CtaRow) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [labelAr, setLabelAr] = useState("");
  const [mode, setMode] = useState<CtaPresetMode>("LINK");
  const [defaultUrl, setDefaultUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [syncKey, setSyncKey] = useState("");
  const wantKey = `${open}-${editing?.id ?? "new"}`;
  if (open && wantKey !== syncKey) {
    setSyncKey(wantKey);
    setLabelAr(editing?.labelAr ?? "");
    setMode(editing?.mode ?? "LINK");
    setDefaultUrl(editing?.defaultUrl ?? "");
    setSaveError(null);
  }

  const urlOk = mode === "FORM" || !defaultUrl.trim() || /^(https?:\/\/|tel:|mailto:)/i.test(defaultUrl.trim());
  const valid = labelAr.trim().length > 0 && urlOk;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    setSaveError(null);
    const res = await onSave({
      id: editing?.id,
      labelAr: labelAr.trim(),
      mode,
      defaultUrl: mode === "FORM" ? null : defaultUrl.trim() || null,
      // A button you are creating is a button you intend to use — it starts on. Turning
      // one off later is a separate, deliberate act, done from the toggle in the table.
      isActive: editing?.isActive ?? true,
    });
    setSaving(false);
    if (res.ok) onOpenChange(false);
    else setSaveError(res.error ?? "Could not save the button.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Capped + scrollable: the window is often short (laptop screen), and a dialog
          whose buttons fall off the bottom is a dialog you cannot submit. */}
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit button" : "Add button"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          {saveError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Button text — must be unique</Label>
            <Input
              value={labelAr}
              onChange={(e) => setLabelAr(e.target.value)}
              placeholder="احجز الآن"
              maxLength={40}
              dir="rtl"
              className="text-base font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Behaviour</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as CtaPresetMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FORM">Booking form — lead is ours</SelectItem>
                <SelectItem value="LINK">External link — click only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "LINK" && (
            <div className="space-y-1.5">
              <Label>Destination — optional, can be set per client</Label>
              <Input
                value={defaultUrl}
                onChange={(e) => setDefaultUrl(e.target.value)}
                placeholder="https://… · tel:+966… · mailto:…"
                maxLength={500}
              />
              {!urlOk && (
                <p className="text-[11px] text-red-600">Must start with https:// , tel: or mailto:</p>
              )}
            </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add button"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Licensing Authorities panel ─────────────────────────────────────────────
function AuthoritiesPanel({
  authorities,
  countries,
  onSave,
  onDelete,
  onToggle,
  busy,
}: {
  authorities: AuthorityDTO[];
  countries: CountryDTO[];
  onSave: (row: {
    id?: string;
    countryCode: string;
    category: Category;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  busy: boolean;
}) {
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AuthorityDTO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const countryName = (code: string) => countries.find((c) => c.code === code)?.nameEn ?? code;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return authorities.filter((a) => {
      if (countryFilter !== "all" && a.countryCode !== countryFilter) return false;
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (q && ![a.code, a.nameAr, a.nameEn].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [authorities, countryFilter, categoryFilter, query]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code or name…"
            className="h-9 w-[220px] ps-8"
          />
        </div>

        <span className="text-xs text-muted-foreground">
          {filtered.length} of {authorities.length}
        </span>

        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          size="sm"
          className="ms-auto gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add authority
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Country</TableHead>
              <TableHead className="w-[110px]">Category</TableHead>
              <TableHead className="w-[110px]">Code</TableHead>
              <TableHead>Name (Arabic)</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[90px] text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No authorities match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{countryName(a.countryCode)}</TableCell>
                  <TableCell className="text-sm">{CATEGORY_LABELS[a.category]}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{a.code}</code>
                  </TableCell>
                  <TableCell className="text-sm font-medium" dir="rtl">
                    {a.nameAr}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.nameEn}</TableCell>
                  <TableCell>
                    <StatusToggle
                      active={a.isActive}
                      disabled={busy}
                      onToggle={() => onToggle(a.id, a.isActive)}
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <RowActions
                      onEdit={() => {
                        setEditing(a);
                        setDialogOpen(true);
                      }}
                      onDelete={() => setDeleteId(a.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AuthorityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        countries={countries}
        onSave={onSave}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this authority?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the list clients can pick during verification. You can add it
              again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
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

function AuthorityDialog({
  open,
  onOpenChange,
  editing,
  countries,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: AuthorityDTO | null;
  countries: CountryDTO[];
  onSave: (row: {
    id?: string;
    countryCode: string;
    category: Category;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }) => Promise<boolean>;
}) {
  const firstCountry = countries[0]?.code ?? "SA";
  const [countryCode, setCountryCode] = useState(firstCountry);
  const [category, setCategory] = useState<Category>("medical");
  const [code, setCode] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [syncKey, setSyncKey] = useState("");
  const wantKey = `${open}-${editing?.id ?? "new"}`;
  if (open && wantKey !== syncKey) {
    setSyncKey(wantKey);
    setCountryCode(editing?.countryCode ?? firstCountry);
    setCategory(editing?.category ?? "medical");
    setCode(editing?.code ?? "");
    setNameAr(editing?.nameAr ?? "");
    setNameEn(editing?.nameEn ?? "");
    setIsActive(editing?.isActive ?? true);
  }

  const valid = code.trim() && nameAr.trim() && nameEn.trim();

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    const ok = await onSave({
      id: editing?.id,
      countryCode,
      category,
      code: code.trim(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      isActive,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit authority" : "Add authority"}</DialogTitle>
          <DialogDescription>
            The licensing body that issues a client&apos;s professional license.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.nameEn} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MOH"
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Name (Arabic)</Label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="وزارة الصحة"
              dir="rtl"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Name (English)</Label>
            <Input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Ministry of Health"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Show this option to clients.</p>
            </div>
            <StatusToggle active={isActive} onToggle={() => setIsActive((v) => !v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add authority"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Countries panel ─────────────────────────────────────────────────────────
function CountriesPanel({
  countries,
  authorities,
  onSave,
  onDelete,
  onToggle,
  busy,
}: {
  countries: CountryDTO[];
  authorities: AuthorityDTO[];
  onSave: (row: {
    id?: string;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
  busy: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CountryDTO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const authCount = (code: string) => authorities.filter((a) => a.countryCode === code).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{countries.length} countries</span>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          size="sm"
          className="ms-auto gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add country
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Code</TableHead>
              <TableHead>Name (Arabic)</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead className="w-[110px]">Authorities</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[90px] text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                  No countries yet.
                </TableCell>
              </TableRow>
            ) : (
              countries.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{c.code}</code>
                  </TableCell>
                  <TableCell className="text-sm font-medium" dir="rtl">
                    {c.nameAr}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.nameEn}</TableCell>
                  <TableCell className="text-sm tabular-nums">{authCount(c.code)}</TableCell>
                  <TableCell>
                    <StatusToggle
                      active={c.isActive}
                      disabled={busy}
                      onToggle={() => onToggle(c.id, c.isActive)}
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <RowActions
                      onEdit={() => {
                        setEditing(c);
                        setDialogOpen(true);
                      }}
                      onDelete={() => setDeleteId(c.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CountryDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSave={onSave} />

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this country?</AlertDialogTitle>
            <AlertDialogDescription>
              Authorities linked to it will no longer appear for clients in that country.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
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

function CountryDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: CountryDTO | null;
  onSave: (row: {
    id?: string;
    code: string;
    nameAr: string;
    nameEn: string;
    isActive: boolean;
  }) => Promise<boolean>;
}) {
  const [code, setCode] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [syncKey, setSyncKey] = useState("");
  const wantKey = `${open}-${editing?.id ?? "new"}`;
  if (open && wantKey !== syncKey) {
    setSyncKey(wantKey);
    setCode(editing?.code ?? "");
    setNameAr(editing?.nameAr ?? "");
    setNameEn(editing?.nameEn ?? "");
    setIsActive(editing?.isActive ?? true);
  }

  const valid = code.trim().length === 2 && nameAr.trim() && nameEn.trim();

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    const ok = await onSave({
      id: editing?.id,
      code: code.trim().toUpperCase(),
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      isActive,
    });
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit country" : "Add country"}</DialogTitle>
          <DialogDescription>
            Use the 2-letter ISO code (SA, EG, AE) — it&apos;s what the client country picker stores.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>ISO code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SA"
              maxLength={2}
              className="font-mono w-24 uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Name (Arabic)</Label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="السعودية"
              dir="rtl"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Name (English)</Label>
            <Input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Saudi Arabia"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Offer this country to clients.</p>
            </div>
            <StatusToggle active={isActive} onToggle={() => setIsActive((v) => !v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add country"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
