'use client';

import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FeaturedClientCard } from "./featured-client-card";

interface FeaturedClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  description?: string;
  industry?: { name: string; slug: string };
  logo?: string;
  articleCount: number;
  viewsCount: number;
  subscribersCount: number;
  commentsCount: number;
  likesCount: number;
  dislikesCount: number;
  favoritesCount: number;
  subscriptionTier?: string;
  isVerified: boolean;
  url?: string;
}

interface FeaturedClientsProps {
  clients: FeaturedClient[];
}

export function FeaturedClients({ clients }: FeaturedClientsProps) {
  if (clients.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto max-w-[1128px] px-4">
        <div className="flex items-center gap-2 mb-8">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <h2 className="text-3xl font-bold">عملاء مميزون</h2>
        </div>
        
        <div dir="ltr">
          <Carousel 
            className="w-full" 
            opts={{ 
              align: "start", 
              loop: true, 
              direction: "ltr"
            }}
          >
            <CarouselContent>
              {clients.map(client => (
                <CarouselItem key={client.id}>
                  <FeaturedClientCard {...client} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
