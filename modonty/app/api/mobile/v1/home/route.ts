import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { getHomeScreen } from "@/lib/mobile-api/get-home-screen";

/** C1 — GET /api/mobile/v1/home · public. */
export const GET = handle("home", async (_request: Request) => {
  return ok(await getHomeScreen(), PUBLIC_CACHE);
});
