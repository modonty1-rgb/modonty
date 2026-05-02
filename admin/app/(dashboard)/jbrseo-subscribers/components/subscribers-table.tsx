"use client";

import { useState } from "react";
import { Search, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { JbrseoSubscriberRow } from "../helpers/queries";

interface Props {
  rows: JbrseoSubscriberRow[];
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function SubscribersTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<"all" | "SA" | "EG">("all");
  const [billing, setBilling] = useState<"all" | "annual" | "monthly">("all");

  const filtered = rows.filter((r) => {
    if (country !== "all" && r.country !== country) return false;
    if (billing === "annual" && !r.isAnnual) return false;
    if (billing === "monthly" && r.isAnnual) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      (r.contactName?.toLowerCase().includes(q) ?? false) ||
      (r.businessName?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search name, email, phone, business..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-9"
          />
        </div>

        <div className="flex gap-1">
          {(["all", "SA", "EG"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                country === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(["all", "annual", "monthly"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                billing === b
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {b === "all" ? "All" : b === "annual" ? "Annual" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Billing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Inbox className="h-10 w-10 opacity-50" />
                    <p className="text-sm">
                      {rows.length === 0
                        ? "No subscribers yet — click 'Sync from jbrseo' to import."
                        : "No subscribers match the current filter."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {dateFmt.format(new Date(r.jbrseoCreatedAt))}
                  </TableCell>
                  <TableCell>{r.contactName ?? "—"}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${r.email}`}
                      className="text-primary hover:underline"
                    >
                      {r.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {r.phone}
                    </a>
                  </TableCell>
                  <TableCell>{r.businessName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{r.planName}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.country}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.isAnnual ? "default" : "secondary"}>
                      {r.isAnnual ? "Annual" : "Monthly"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer count */}
      <p className="text-muted-foreground text-xs">
        Showing {filtered.length} of {rows.length} subscribers
      </p>
    </div>
  );
}
