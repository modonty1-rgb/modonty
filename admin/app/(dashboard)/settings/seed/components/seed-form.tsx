"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { checkClientsExist } from "../actions/seed-actions";
import { SeedLogViewer } from "./seed-log-viewer";
import { SeedFormInputs } from "./seed-form-inputs";
import { SeedFormSettings } from "./seed-form-settings";
import { SeedDistributionSummary } from "./seed-distribution-summary";
import { SeedFormActions } from "./seed-form-actions";
import { SeedTestResult } from "./seed-test-result";

const MIN_ARTICLES = 3;
const MAX_ARTICLES = 300;

interface LogEntry {
  message: string;
  level: "info" | "success" | "error";
  timestamp: string;
}

export function SeedForm() {
  const { toast } = useToast();
  const [articleCount, setArticleCount] = useState<number>(10);
  const [clientCount, setClientCount] = useState<number>(5);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [useNewsAPI, setUseNewsAPI] = useState(false);
  const [industryBrief, setIndustryBrief] = useState<string>("");
  const [clearDatabase, setClearDatabase] = useState<boolean>(true);
  const [seedPhase, setSeedPhase] = useState<"clients-only" | "full">("full");
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingUnsplash, setIsTestingUnsplash] = useState(false);
  const [isTestingNewsAPI, setIsTestingNewsAPI] = useState(false);
  const [isTestingClientCreation, setIsTestingClientCreation] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    clientId?: string;
    clientName?: string;
    logoUrl?: string;
    logoCloudinaryPublicId?: string;
    logoCloudinaryVersion?: string;
    logoMediaId?: string;
    ogImageUrl?: string;
    ogImageCloudinaryPublicId?: string;
    ogImageCloudinaryVersion?: string;
    ogImageMediaId?: string;
    databaseVerified?: boolean;
    error?: string;
  } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasClients, setHasClients] = useState<boolean>(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isRunning) {
      setProgress(0);
      return;
    }
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        return current + 10;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  const isDev = process.env.NODE_ENV === "development";

  const distributions = useMemo(() => {
    const total = Math.min(Math.max(articleCount || 0, MIN_ARTICLES), MAX_ARTICLES);

    const published = Math.round(total * 0.6);
    const draft = Math.round(total * 0.25);
    const writing = Math.round(total * 0.1);
    const scheduled = total - (published + draft + writing);

    const shortCount = Math.round(total * 0.3);
    const mediumCount = Math.round(total * 0.4);
    const longCount = total - (shortCount + mediumCount);

    // Calculate client count based on articles (1 per 12 articles, min 3, max 20)
    const estimatedClientCount = Math.max(3, Math.min(20, Math.ceil(total / 12)));

    // Calculate other data counts
    const articleTagsCount = total * 3.5; // Average 2-5 tags per article
    const mediaCount = total + estimatedClientCount * 2; // Featured images + client logos/OG
    const analyticsCount = published * 15; // 5-20 per published article
    const faqsCount = published * 3.5; // 2-5 per published article
    const relatedArticlesCount = published * 3.5; // 2-5 per published article
    const subscribersCount = estimatedClientCount * 17.5; // 10-25 per client
    const articleVersionsCount = Math.round(total * 0.4); // 40% of articles
    const articleMediaCount = Math.round(total * 0.45 * 2.5); // 45% of articles, 2-3 items each

    // Interactions
    const commentsCount = published * 3.5; // 2-5 per article + replies
    const clientCommentsCount = estimatedClientCount * 2; // 1-3 per client + replies
    const articleLikesCount = published * 10; // 5-15 per article
    const articleDislikesCount = published * 1.5; // 0-3 per article
    const clientLikesCount = estimatedClientCount * 6.5; // 3-10 per client
    const clientDislikesCount = estimatedClientCount * 1; // 0-2 per client
    const articleViewsCount = published * 30; // 10-50 per article
    const clientViewsCount = estimatedClientCount * 12.5; // 5-20 per client
    const sharesCount = published * 5.5 + estimatedClientCount * 2.5; // 1-10 per article + 0-5 per client
    const conversionsCount = published * 1.2 + estimatedClientCount * 3; // 0-3 per article + 1-5 per client
    const ctaClicksCount = published * 5 + estimatedClientCount * 3; // 2-8 per article + 1-5 per client
    const campaignTrackingCount = published * 2.5 + estimatedClientCount * 5.5; // 0-5 per article + 1-10 per client
    const leadScoringCount = estimatedClientCount * 12.5; // 5-20 per client
    const engagementDurationCount = published * 10 + estimatedClientCount * 4.5; // 5-15 per article + 2-7 per client
    const articleLinkClicksCount = published * 9; // 3-15 per article

    return {
      total,
      statuses: { published, draft, writing, scheduled },
      lengths: { short: shortCount, medium: mediumCount, long: longCount },
      core: {
        industries: 8, // Fixed count
        clients: estimatedClientCount,
        categories: 12, // 8 main + 4 subcategories
        tags: 50, // Fixed count
        authors: 1, // Singleton
      },
      articles: {
        articles: total,
        articleTags: Math.round(articleTagsCount),
        media: Math.round(mediaCount),
        analytics: Math.round(analyticsCount),
        faqs: Math.round(faqsCount),
        relatedArticles: Math.round(relatedArticlesCount),
        articleVersions: articleVersionsCount,
        articleMedia: Math.round(articleMediaCount),
      },
      interactions: {
        comments: Math.round(commentsCount),
        clientComments: Math.round(clientCommentsCount),
        articleLikes: Math.round(articleLikesCount),
        articleDislikes: Math.round(articleDislikesCount),
        clientLikes: Math.round(clientLikesCount),
        clientDislikes: Math.round(clientDislikesCount),
        commentLikes: Math.round(commentsCount * 2.5), // Estimated from comments
        commentDislikes: Math.round(commentsCount * 1),
      },
      tracking: {
        articleViews: Math.round(articleViewsCount),
        clientViews: Math.round(clientViewsCount),
        shares: Math.round(sharesCount),
        conversions: Math.round(conversionsCount),
        ctaClicks: Math.round(ctaClicksCount),
        campaignTracking: Math.round(campaignTrackingCount),
        leadScoring: Math.round(leadScoringCount),
        engagementDuration: Math.round(engagementDurationCount),
        articleLinkClicks: Math.round(articleLinkClicksCount),
      },
      other: {
        subscribers: Math.round(subscribersCount),
      },
    };
  }, [articleCount]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkClients = async () => {
      try {
        const result = await checkClientsExist();
        setHasClients(result.exists);
      } catch (error) {
        console.error("Error checking clients:", error);
        setHasClients(false);
      }
    };

    // Only check clients when seedPhase is "full" (creating articles requires clients)
    if (seedPhase === "full") {
      checkClients();
    } else {
      // For "clients-only", we don't need existing clients
      setHasClients(true);
    }
  }, [seedPhase]);

  const handleCreateClientSeed = async () => {
    if (!isDev) {
      toast({
        title: "Not available in this environment",
        description: "The seeding UI is only enabled in development.",
        variant: "destructive",
      });
      return;
    }

    const input = prompt("How many clients would you like to create? (1-50)", clientCount.toString());
    if (input === null) {
      return;
    }

    const requestedCount = parseInt(input, 10);
    if (isNaN(requestedCount) || requestedCount < 1 || requestedCount > 50) {
      toast({
        title: "Invalid client count",
        description: "Please enter a value between 1 and 50 for client seed.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRunning(true);
      setLogs([]);
      setIsConnected(false);

      const params = new URLSearchParams({
        articleCount: "0",
        clientCount: requestedCount.toString(),
        useOpenAI: useOpenAI.toString(),
        useNewsAPI: useNewsAPI.toString(),
        clearDatabase: clearDatabase.toString(),
        seedPhase: "clients-only",
      });
      if (useOpenAI && industryBrief.trim()) {
        params.append("industryBrief", industryBrief.trim());
      }
      const url = `/api/seed/stream?${params.toString()}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      setIsConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const logEntry: LogEntry = JSON.parse(event.data);
          
          if (logEntry.message === "[COMPLETE]") {
            setIsRunning(false);
            setIsConnected(false);
            eventSource.close();
            eventSourceRef.current = null;
            toast({
              title: "Client seed completed",
              description: `Created ${requestedCount} clients with media from Unsplash`,
            });
            setHasClients(true);
            return;
          }

          setLogs((prev) => [...prev, logEntry]);
        } catch (error) {
          console.error("Error parsing log entry:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        setIsConnected(false);
        setIsRunning(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        setLogs((prev) => [
          ...prev,
          {
            message: "❌ Connection error. Client seed process may have failed.",
            level: "error",
            timestamp: new Date().toISOString(),
          },
        ]);

        toast({
          title: "Connection error",
          description: "Lost connection to seed stream. Check logs for details.",
          variant: "destructive",
        });
      };
    } catch (error) {
      setIsRunning(false);
      setIsConnected(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred while starting the client seed process.",
        variant: "destructive",
      });
    }
  };

  const handleRunSeed = async () => {
    if (!isDev) {
      toast({
        title: "Not available in this environment",
        description: "The seeding UI is only enabled in development.",
        variant: "destructive",
      });
      return;
    }

    if (seedPhase === "clients-only") {
      if (!clientCount || clientCount < 1 || clientCount > 50) {
        toast({
          title: "Invalid client count",
          description: `Please enter a value between 1 and 50 for Phase 1.`,
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!articleCount || articleCount < MIN_ARTICLES || articleCount > MAX_ARTICLES) {
        toast({
          title: "Invalid article count",
          description: `Please enter a value between ${MIN_ARTICLES} and ${MAX_ARTICLES}.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsRunning(true);
      setLogs([]);
      setIsConnected(false);

      const params = new URLSearchParams({
        articleCount: seedPhase === "clients-only" ? "0" : distributions.total.toString(),
        clientCount: seedPhase === "clients-only" ? clientCount.toString() : "0",
        useOpenAI: useOpenAI.toString(),
        useNewsAPI: useNewsAPI.toString(),
        clearDatabase: clearDatabase.toString(),
        seedPhase: seedPhase,
      });
      if (useOpenAI && industryBrief.trim()) {
        params.append("industryBrief", industryBrief.trim());
      }
      const url = `/api/seed/stream?${params.toString()}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      setIsConnected(true);

      eventSource.onmessage = (event) => {
        try {
          const logEntry: LogEntry = JSON.parse(event.data);
          
          if (logEntry.message === "[COMPLETE]") {
            setIsRunning(false);
            setIsConnected(false);
            eventSource.close();
            eventSourceRef.current = null;
            const message = seedPhase === "clients-only"
              ? `Phase 1 completed: Created ${clientCount} clients with media from Unsplash`
              : `Cleared DB and seeded ${distributions.total} articles (${distributions.statuses.published} published, ${distributions.statuses.draft} draft).`;
            toast({
              title: "Seed completed",
              description: message,
            });
            return;
          }

          setLogs((prev) => [...prev, logEntry]);
        } catch (error) {
          console.error("Error parsing log entry:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        setIsConnected(false);
        setIsRunning(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        setLogs((prev) => [
          ...prev,
          {
            message: "❌ Connection error. Seed process may have failed.",
            level: "error",
            timestamp: new Date().toISOString(),
          },
        ]);

        toast({
          title: "Connection error",
          description: "Lost connection to seed stream. Check logs for details.",
          variant: "destructive",
        });
      };
    } catch (error) {
      setIsRunning(false);
      setIsConnected(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred while starting the seed process.",
        variant: "destructive",
      });
    }
  };


  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="mt-8 space-y-4">
      {!isDev && (
        <Alert variant="destructive">
          <AlertTitle>Dev only</AlertTitle>
          <AlertDescription>
            Database seeding can only be configured and triggered in the development environment.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Article Seeding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SeedFormInputs
            seedPhase={seedPhase}
            articleCount={articleCount}
            clientCount={clientCount}
            onArticleCountChange={setArticleCount}
            onClientCountChange={setClientCount}
          />

          <SeedFormSettings
            useOpenAI={useOpenAI}
            useNewsAPI={useNewsAPI}
            industryBrief={industryBrief}
            clearDatabase={clearDatabase}
            seedPhase={seedPhase}
            isTestingOpenAI={isTestingOpenAI}
            isTestingUnsplash={isTestingUnsplash}
            isTestingNewsAPI={isTestingNewsAPI}
            onUseOpenAIChange={setUseOpenAI}
            onUseNewsAPIChange={setUseNewsAPI}
            onIndustryBriefChange={setIndustryBrief}
            onClearDatabaseChange={setClearDatabase}
            onSeedPhaseChange={setSeedPhase}
            onTestingOpenAIChange={setIsTestingOpenAI}
            onTestingUnsplashChange={setIsTestingUnsplash}
            onTestingNewsAPIChange={setIsTestingNewsAPI}
          />

          <SeedDistributionSummary distributions={distributions} />

          <SeedFormActions
            isRunning={isRunning}
            progress={progress}
            seedPhase={seedPhase}
            hasClients={hasClients}
            clientCount={clientCount}
            useOpenAI={useOpenAI}
            industryBrief={industryBrief}
            clearDatabase={clearDatabase}
            isDev={isDev}
            isTestingClientCreation={isTestingClientCreation}
            testResult={testResult}
            onRunSeed={handleRunSeed}
            onCreateClientSeed={handleCreateClientSeed}
            onTestingClientCreationChange={setIsTestingClientCreation}
            onTestResultChange={setTestResult}
          />
        </CardContent>
      </Card>

      <SeedTestResult testResult={testResult} />

      <SeedLogViewer
        logs={logs}
        onClear={handleClearLogs}
        isConnected={isConnected}
      />
    </div>
  );
}

