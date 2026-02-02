"use client";

import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { UserRole } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  clientAccess: string[];
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, "default" | "secondary" | "destructive"> = {
      ADMIN: "destructive",
      CLIENT: "default",
      EDITOR: "secondary",
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  return (
    <DataTable
      data={users}
      columns={[
        {
          key: "name",
          header: "Name",
          render: (user) => (
            <Link href={`/users/${user.id}`} className="font-medium hover:text-primary">
              {user.name || "-"}
            </Link>
          ),
        },
        {
          key: "email",
          header: "Email",
          render: (user) => user.email || "-",
        },
        {
          key: "role",
          header: "Role",
          render: (user) => getRoleBadge(user.role),
        },
        {
          key: "clientAccess",
          header: "Client Access",
          render: (user) => (user.clientAccess.length > 0 ? `${user.clientAccess.length} clients` : "All"),
        },
        {
          key: "createdAt",
          header: "Created",
          render: (user) => format(new Date(user.createdAt), "MMM d, yyyy"),
        },
      ]}
      searchKey="email"
      onRowClick={(user) => {
        window.location.href = `/users/${user.id}`;
      }}
    />
  );
}
