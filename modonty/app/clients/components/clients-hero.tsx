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
    <div className="relative overflow-hidden border-b border-white/10 bg-primary">
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            اكتشف أفضل الشركات والعملاء
          </h1>
          <p className="text-lg text-white/70">
            تصفح دليل شامل للشركات والمؤسسات الرائدة
          </p>

          <div className="flex items-center justify-center gap-8 pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalClients}</div>
              <div className="text-sm text-white/70">شركة</div>
            </div>
            <div className="h-12 w-px bg-white/15" aria-hidden />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalIndustries}</div>
              <div className="text-sm text-white/70">صناعة</div>
            </div>
            <div className="h-12 w-px bg-white/15" aria-hidden />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{totalArticles}</div>
              <div className="text-sm text-white/70">مقال</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
