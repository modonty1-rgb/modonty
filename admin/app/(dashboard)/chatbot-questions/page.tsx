import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, BarChart3, CheckCircle } from "lucide-react";
import { getChatbotQuestions, getChatbotStats } from "./actions/chatbot-questions-actions";
import { ChatbotQuestionsClient } from "./components/chatbot-questions-client";

export default async function ChatbotQuestionsPage() {
  const [groups, stats] = await Promise.all([
    getChatbotQuestions(),
    getChatbotStats(),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader
        title="Chatbot Questions"
        description="Review repeated user questions and convert them to published FAQs on articles."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique Questions</p>
              <p className="text-2xl font-bold">{groups.length.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Converted to FAQ</p>
              <p className="text-2xl font-bold">{stats.converted.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChatbotQuestionsClient groups={groups} />
    </div>
  );
}
