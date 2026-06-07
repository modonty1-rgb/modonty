"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Landmark,
  Globe2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
  AlertCircle,
  X,
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
  seedReferenceDefaults,
  type CountryDTO,
  type AuthorityDTO,
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
}: {
  initialCountries: CountryDTO[];
  initialAuthorities: AuthorityDTO[];
}) {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryDTO[]>(initialCountries);
  const [authorities, setAuthorities] = useState<AuthorityDTO[]>(initialAuthorities);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Re-sync with server truth after revalidation / router.refresh() (seed,
  // error-revert). Optimistic local edits are confirmed by the fresh props.
  useEffect(() => setCountries(initialCountries), [initialCountries]);
  useEffect(() => setAuthorities(initialAuthorities), [initialAuthorities]);

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

  const seed = () =>
    startTransition(async () => {
      const res = await seedReferenceDefaults();
      if (!res.success) return fail(res.error);
      router.refresh();
    });

  const isEmpty = countries.length === 0 && authorities.length === 0;

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
        <h1 className="text-2xl font-semibold tracking-tight">Reference Data</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Foundational lookups managed once here and reused across the platform. Countries drive the
          client country picker; licensing authorities power YMYL verification (medical, legal,
          financial).
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
          <Landmark className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <h3 className="mt-3 text-sm font-semibold">No reference data yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Load the standard countries (Saudi Arabia, Egypt, UAE) and their licensing authorities to
            get started. You can edit everything afterwards.
          </p>
          <Button onClick={seed} disabled={pending} className="mt-4 gap-1.5">
            <Sparkles className="h-4 w-4" />
            {pending ? "Loading…" : "Load default data"}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="authorities">
          <TabsList>
            <TabsTrigger value="authorities" className="gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              Licensing Authorities
            </TabsTrigger>
            <TabsTrigger value="countries" className="gap-1.5">
              <Globe2 className="h-3.5 w-3.5" />
              Countries
            </TabsTrigger>
          </TabsList>

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
