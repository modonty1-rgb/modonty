"use client";

import { DataTable } from "@/components/admin/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
}

interface UserTableProps {
  users: AdminUser[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <DataTable
      data={users}
      columns={[
        {
          key: "name",
          header: "Admin",
          render: (user) => (
            <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:text-primary">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback className="text-xs">
                  {(user.name || "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name || "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email || "—"}</p>
              </div>
            </Link>
          ),
        },
        {
          key: "createdAt",
          header: "Added",
          render: (user) => (
            <span className="text-muted-foreground text-sm">
              {format(new Date(user.createdAt), "MMM d, yyyy")}
            </span>
          ),
        },
      ]}
      searchKey="email"
      searchPlaceholder="Search by email..."
      onRowClick={(user) => {
        window.location.href = `/users/${user.id}`;
      }}
    />
  );
}
