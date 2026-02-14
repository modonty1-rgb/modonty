import { CheckCircle2 } from "lucide-react";

interface HeroNameRowProps {
  clientName: string;
}

export function HeroNameRow({ clientName }: HeroNameRowProps) {
  return (
    <h1 className="flex items-center gap-2 flex-wrap text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
      {clientName}
      <CheckCircle2
        className="h-5 w-5 md:h-6 md:w-6 text-blue-500 flex-shrink-0"
        aria-label="موثق"
      />
    </h1>
  );
}
