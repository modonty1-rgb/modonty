"use client";

import { DataTable } from "@/components/admin/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Member } from "../actions/members-actions";

interface MemberTableProps {
  members: Member[];
}

export function MemberTable({ members }: MemberTableProps) {
  return (
    <DataTable
      data={members}
      columns={[
        {
          key: "name",
          header: "Member",
          render: (m) => (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={m.image || undefined} alt={m.name || ""} />
                <AvatarFallback className="text-xs">
                  {(m.name || m.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{m.name || "—"}</p>
                <p className="text-xs text-muted-foreground">{m.email || "—"}</p>
              </div>
            </div>
          ),
        },
        {
          key: "via",
          header: "Method",
          render: (m) => (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                m.via === "google"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {m.via === "google" ? "Google" : "Email"}
            </span>
          ),
        },
        {
          key: "verified",
          header: "Verified",
          render: (m) => (
            <span className={`text-xs ${m.verified ? "text-emerald-600" : "text-muted-foreground"}`}>
              {m.verified ? "Verified" : "—"}
            </span>
          ),
        },
        {
          key: "createdAt",
          header: "Joined",
          render: (m) => (
            <span className="text-muted-foreground text-sm">
              {format(new Date(m.createdAt), "MMM d, yyyy")}
            </span>
          ),
        },
      ]}
      searchKey="email"
      searchPlaceholder="Search by email..."
    />
  );
}
