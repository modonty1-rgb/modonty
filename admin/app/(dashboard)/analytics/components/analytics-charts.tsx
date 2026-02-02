import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TopArticle {
  articleId: string;
  title: string;
  client: string;
  views: number;
}

interface TrafficSource {
  [key: string]: number;
}

interface ChannelSummary {
  views: number;
  sessions: number;
  avgTimeOnPage: number;
  bounceRate: number;
  avgScrollDepth: number;
}

interface AnalyticsChartsProps {
  topArticles: TopArticle[];
  trafficSources: TrafficSource;
  channelSummary?: Record<string, ChannelSummary>;
}

export function AnalyticsCharts({
  topArticles,
  trafficSources,
  channelSummary,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                topArticles.map((article) => (
                  <TableRow key={article.articleId}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.client}</TableCell>
                    <TableCell className="text-right">{article.views}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(trafficSources).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(trafficSources)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <TableRow key={source}>
                      <TableCell className="font-medium">{source}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Bounce Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!channelSummary || Object.keys(channelSummary).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                Object.entries(channelSummary)
                  .sort(([, a], [, b]) => b.views - a.views)
                  .map(([channel, data]) => (
                    <TableRow key={channel}>
                      <TableCell className="font-medium">{channel}</TableCell>
                      <TableCell className="text-right">{data.views}</TableCell>
                      <TableCell className="text-right">{data.sessions}</TableCell>
                      <TableCell className="text-right">
                        {data.bounceRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
