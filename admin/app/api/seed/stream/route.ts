import { NextRequest } from "next/server";
import { runFullSeed } from "@/app/(dashboard)/settings/seed/actions/seed-core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface LogEntry {
  message: string;
  level: "info" | "success" | "error";
  timestamp: string;
}

function createSSEStream(
  articleCount: number,
  clientCount: number,
  useOpenAI: boolean,
  industryBrief?: string,
  clearDatabase?: boolean,
  seedPhase?: "clients-only" | "full",
  useNewsAPI?: boolean
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: LogEntry) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("Error sending SSE message:", error);
        }
      };

      const logCallback = (message: string, level: "info" | "success" | "error" = "info") => {
        send({
          message,
          level,
          timestamp: new Date().toISOString(),
        });
        console.log(message);
      };

      try {
        send({
          message: "Starting seed process...",
          level: "info",
          timestamp: new Date().toISOString(),
        });

        const summary = await runFullSeed({
          articleCount,
          clientCount,
          useOpenAI,
          industryBrief,
          clearDatabase,
          seedPhase: seedPhase || "full",
          useNewsAPI: useNewsAPI || false,
          logCallback,
        });

        send({
          message: `✅ Seed completed successfully! Created ${summary.articles.total} articles (${summary.articles.published} published, ${summary.articles.draft} draft).`,
          level: "success",
          timestamp: new Date().toISOString(),
        });

        send({
          message: "[COMPLETE]",
          level: "success",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("Seed process error:", error);
        send({
          message: `❌ Error: ${errorMessage}${errorStack ? `\n\nStack: ${errorStack}` : ""}`,
          level: "error",
          timestamp: new Date().toISOString(),
        });
        
        // Send completion signal even on error so client knows to close
        send({
          message: "[COMPLETE]",
          level: "error",
          timestamp: new Date().toISOString(),
        });
      } finally {
        try {
          controller.close();
        } catch (closeError) {
          console.error("Error closing stream:", closeError);
        }
      }
    },
  });

  return stream;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return new Response(
      JSON.stringify({ error: "This endpoint is only available in development" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const articleCount = parseInt(searchParams.get("articleCount") || "10", 10);
  const clientCount = parseInt(searchParams.get("clientCount") || "0", 10);
  const useOpenAI = searchParams.get("useOpenAI") === "true";
  const useNewsAPI = searchParams.get("useNewsAPI") === "true";
  const industryBrief = searchParams.get("industryBrief") || undefined;
  const clearDatabase = searchParams.get("clearDatabase") !== "false"; // Default true
  const seedPhase = (searchParams.get("seedPhase") as "clients-only" | "full") || "full";

  if (seedPhase === "clients-only") {
    if (isNaN(clientCount) || clientCount < 1 || clientCount > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid client count for Phase 1 (must be 1-50)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } else {
    if (isNaN(articleCount) || articleCount < 3 || articleCount > 300) {
      return new Response(
        JSON.stringify({ error: "Invalid article count (must be 3-300)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  const stream = createSSEStream(articleCount, clientCount, useOpenAI, industryBrief, clearDatabase, seedPhase, useNewsAPI);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
