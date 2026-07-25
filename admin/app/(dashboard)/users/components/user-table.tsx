"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Mail, ScrollText, Pencil } from "lucide-react";
import Link from "next/link";

import { DataTable } from "@/components/admin/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { roleMeta } from "../lib/roles";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isActive: boolean | null;
  createdAt: Date;
  /** How many actions this staff member has recorded in the audit log. */
  logCount: number;
}

interface UserTableProps {
  users: AdminUser[];
}

function RoleBadge({ role }: { role: string }) {
  const meta = roleMeta(role);
  return <Badge className={cn("border-transparent", meta.badge)}>{meta.label}</Badge>;
}

export function UserTable({ users }: UserTableProps) {
  return (
    <DataTable
      data={users}
      columns={[
        {
          key: "name",
          header: "Staff",
          render: (user) => (
            <Link
              href={`/users/${user.id}`}
              className={cn(
                "flex items-center gap-3 hover:text-primary",
                user.isActive === false && "opacity-50"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback className="text-xs font-medium">
                  {(user.name || "S").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name || "—"}</span>
            </Link>
          ),
        },
        {
          key: "email",
          header: "Email",
          render: (user) => (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user.email || "—"}
            </span>
          ),
        },
        {
          key: "role",
          header: "Role",
          render: (user) => (
            <div className="flex items-center gap-1.5">
              <RoleBadge role={user.role} />
              {user.isActive === false && (
                <Badge className="border-transparent bg-red-500/15 text-red-600 dark:text-red-300">
                  Inactive
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "createdAt",
          header: "Added",
          render: (user) => (
            <span
              className="text-sm text-muted-foreground tabular-nums"
              title={format(new Date(user.createdAt), "PPP")}
              suppressHydrationWarning
            >
              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </span>
          ),
        },
        {
          key: "logCount",
          header: "Log",
          render: (user) => (
            <div onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/users/${user.id}/log`}
                title={`${user.logCount} action${user.logCount === 1 ? "" : "s"} in the audit log`}
                aria-label={`Audit log for ${user.name || user.email || "staff"} — ${user.logCount} actions`}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ScrollText className="h-4 w-4" />
                <span className="tabular-nums font-medium">{user.logCount}</span>
              </Link>
            </div>
          ),
        },
        {
          key: "edit",
          header: "",
          sortable: false,
          render: (user) => (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <Link
                href={`/users/${user.id}`}
                title="Edit"
                aria-label={`Edit ${user.name || user.email || "staff"}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
          ),
        },
      ]}
      onRowClick={(user) => {
        window.location.href = `/users/${user.id}`;
      }}
    />
  );
}
