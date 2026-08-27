import { ok } from "@/lib/mobile-api/http";

// Tokens are stateless in v1. The app removes its encrypted local token after this acknowledgement.
export async function POST() { return ok({ signedOut: true }); }
