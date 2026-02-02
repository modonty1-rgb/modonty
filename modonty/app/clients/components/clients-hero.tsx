import { Search } from "lucide-react";

interface ClientsHeroProps {
  totalClients: number;
  totalIndustries: number;
  totalArticles: number;
  onSearch?: (query: string) => void;
}

export function ClientsHero({ 
  totalClients, 
  totalIndustries, 
  totalArticles 
}: ClientsHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-b">
      <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            اكتشف أفضل الشركات والعملاء
          </h1>
          <p className="text-lg text-muted-foreground">
            تصفح دليل شامل للشركات والمؤسسات الرائدة
          </p>

          <div className="flex items-center justify-center gap-8 pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalClients}</div>
              <div className="text-sm text-muted-foreground">شركة</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalIndustries}</div>
              <div className="text-sm text-muted-foreground">صناعة</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalArticles}</div>
              <div className="text-sm text-muted-foreground">مقال</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
