import type { CategoryScore, ChecklistItem } from "./types";

export function calculateCategoryScore(items: ChecklistItem[], maxScore: number): CategoryScore {
  const passed = items.filter((item) => item.status === "pass").length;
  const total = items.length;
  const score = items.reduce((sum, item) => {
    if (item.status === "pass") return sum + maxScore / total;
    if (item.status === "warning") return sum + (maxScore / total) * 0.5;
    return sum;
  }, 0);

  return {
    score: Math.round(score),
    maxScore,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
    passed,
    total,
  };
}

