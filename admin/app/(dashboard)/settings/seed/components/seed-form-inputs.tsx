/**
 * Seed Form Inputs Component
 * Input fields for article/client count selection
 */

"use client";

import { Input } from "@/components/ui/input";

const MIN_ARTICLES = 3;
const MAX_ARTICLES = 300;

interface SeedFormInputsProps {
  seedPhase: "clients-only" | "full";
  articleCount: number;
  clientCount: number;
  onArticleCountChange: (value: number) => void;
  onClientCountChange: (value: number) => void;
}

export function SeedFormInputs({
  seedPhase,
  articleCount,
  clientCount,
  onArticleCountChange,
  onClientCountChange,
}: SeedFormInputsProps) {
  if (seedPhase === "clients-only") {
    return (
      <div className="flex flex-row items-center gap-4">
        <label className="text-sm font-medium" htmlFor="client-count">
          Number of clients
        </label>
        <Input
          id="client-count"
          type="number"
          min={1}
          max={50}
          value={clientCount}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (Number.isNaN(value)) {
              onClientCountChange(1);
              return;
            }
            onClientCountChange(value);
          }}
          className="w-32"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-4">
      <label className="text-sm font-medium" htmlFor="article-count">
        Number of articles
      </label>
      <Input
        id="article-count"
        type="number"
        min={MIN_ARTICLES}
        max={MAX_ARTICLES}
        value={articleCount}
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          if (Number.isNaN(value)) {
            onArticleCountChange(MIN_ARTICLES);
            return;
          }
          onArticleCountChange(value);
        }}
        className="w-32"
      />
    </div>
  );
}
