"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Building2,
  Calendar,
  CreditCard,
  AlertTriangle,
  Plus,
} from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/articles/new">
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              New Article
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/clients/new">
              <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
              New Client
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/clients?filter=expiring">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              Expiring
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/clients?filter=overdue">
              <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
              Overdue
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/clients?filter=at-limit">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              At Limit
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start text-sm">
            <Link href="/analytics">
              <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
              Analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
