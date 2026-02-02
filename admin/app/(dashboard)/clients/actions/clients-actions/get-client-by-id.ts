"use server";

import { db } from "@/lib/db";

export async function getClientById(id: string) {
  try {
    const client = await db.client.findUnique({
      where: { id },
      include: {
        logoMedia: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        ogImageMedia: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        twitterImageMedia: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
        subscriptionTierConfig: {
          select: {
            id: true,
            tier: true,
            name: true,
            articlesPerMonth: true,
            price: true,
            isPopular: true,
          },
        },
        parentOrganization: {
          select: {
            id: true,
            name: true,
            url: true,
            slug: true,
          },
        },
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });
    return client;
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
}

