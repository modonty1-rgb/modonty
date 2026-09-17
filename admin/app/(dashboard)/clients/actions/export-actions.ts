"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import { ClientFilters } from "./clients-actions";
import { getPaymentStates, paymentStateLabel, NO_INVOICES } from "@/lib/clients/payment-state";

function escapeCsvValue(value: string | null | undefined): string {
  if (!value) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function exportClientsToCSV(filters?: ClientFilters): Promise<string> {
  try {
    const where: Prisma.ClientWhereInput = {};

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.hasArticles !== undefined) {
      if (filters.hasArticles) {
        where.articles = {
          some: {
            status: ArticleStatus.PUBLISHED,
          },
        };
      } else {
        where.articles = {
          none: {},
        };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const clients = await db.client.findMany({
      where,
      include: {
        industry: { select: { name: true } },
        // اسمُ الباقة للعمود — بلا هذا الجلب يطبع الملفُّ «بلا باقة» للجميع بصمت.
        subscriptionTierConfig: { select: { name: true } },
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let filteredClients = clients;

    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredClients = clients.filter((client) => {
        const articleCount = client._count.articles;
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    const headers = [
      "Name",
      "Legal Name",
      "Email",
      "Phone",
      "Website",
      "Industry",
      "Subscription Plan",
      "Subscription Status",
      "Payment Status",
      "Start Date",
      "End Date",
      "Articles/Month",
      "Published Articles",
      "City",
      "Country",
      "CR Number",
      "VAT ID",
      "Created Date",
    ];

    /**
     * حالةُ الدفع تُحسب من الفواتير، لا من `Client.paymentStatus`.
     *
     * ذاك حقلٌ لا يُكتب فيه «متأخّر» في أيّ مسار، فكان التصديرُ يخرج بعمودٍ كلُّه
     * «مسدَّد» — ومنهم ٢٦ عميلاً بلا فاتورةٍ واحدة. و«بلا فواتير» حالةٌ ثالثة لا
     * تُطوى في «مسدَّد»: مَن لم تُصدَر له فاتورةٌ بعدُ ليس مسدِّداً ولا متأخّراً.
     */
    const paymentStates = await getPaymentStates(filteredClients.map((c) => c.id));

    const csvRows = [headers.join(",")];

    for (const client of filteredClients) {
      const row = [
        escapeCsvValue(client.name),
        escapeCsvValue(client.legalName),
        escapeCsvValue(client.email),
        escapeCsvValue(client.phone),
        escapeCsvValue(client.url),
        escapeCsvValue(client.industry?.name),
        // اسمُ الباقة لا رمزُها: ملفّ التصدير يُفتح في إكسل ويُقرأ بشراً.
        escapeCsvValue(client.subscriptionTierConfig?.name ?? "بلا باقة"),
        escapeCsvValue(client.subscriptionStatus),
        escapeCsvValue(paymentStateLabel(paymentStates.get(client.id) ?? NO_INVOICES)),
        formatDate(client.subscriptionStartDate),
        formatDate(client.subscriptionEndDate),
        (client.articlesPerMonth ?? "").toString(),
        client._count.articles.toString(),
        escapeCsvValue(client.addressCity),
        escapeCsvValue(client.addressCountry),
        escapeCsvValue(client.commercialRegistrationNumber),
        escapeCsvValue(client.vatID),
        formatDate(client.createdAt),
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  } catch (error) {
    throw new Error("Failed to export clients to CSV");
  }
}
