import { db } from "@/lib/db";
import type { CompetitorRow } from "../components/competitor-manager";

/** قائمة المنافسين كلّها (المفعَّل والموقوف) لنموذج إدارتها في تبويب «المنافسون». */
export async function getCompetitors(): Promise<CompetitorRow[]> {
  return db.ideaCompetitor.findMany({
    select: { domain: true, name: true, active: true },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    take: 100,
  });
}
