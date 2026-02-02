"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Mail, CheckCircle, Archive, Inbox, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContactMessagesStatsProps {
  stats: {
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  };
}

export function ContactMessagesStats({ stats }: ContactMessagesStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const statCards = [
    {
      title: "Total Messages",
      value: stats.total,
      icon: MessageSquare,
      href: "/contact-messages",
      className: "text-primary",
    },
    {
      title: "New",
      value: stats.new,
      icon: Inbox,
      href: "/contact-messages?status=new",
      className: "text-blue-500",
      highlight: stats.new > 0,
    },
    {
      title: "Read",
      value: stats.read,
      icon: Mail,
      href: "/contact-messages?status=read",
      className: "text-secondary-foreground",
    },
    {
      title: "Replied",
      value: stats.replied,
      icon: CheckCircle,
      href: "/contact-messages?status=replied",
      className: "text-green-500",
    },
    {
      title: "Archived",
      value: stats.archived,
      icon: Archive,
      href: "/contact-messages?status=archived",
      className: "text-muted-foreground",
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle>Statistics</CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Link key={stat.title} href={stat.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <Icon className={`h-4 w-4 ${stat.className}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {stat.highlight && (
                          <p className="text-xs text-muted-foreground mt-1">Action needed</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
