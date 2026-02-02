import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  User,
  Building,
  TrendingUp,
} from "lucide-react";
import { getJsonLdStats } from "@/lib/seo";
import {
  getSearchConsoleCredentials,
  initSearchConsoleClient,
  fetchStructuredDataErrors,
  fetchErrorTrends,
  isSearchConsoleConfigured,
} from "@/lib/seo/search-console-api";
import { db } from "@/lib/db";
import Link from "next/link";
import { SearchConsoleErrorsSection } from "./components/search-console-errors-section";
import { PageValidator } from "./components/page-validator";

export const metadata: Metadata = {
  title: "صحة SEO - لوحة المراقبة",
  description: "مراقبة حالة JSON-LD والبيانات المهيكلة للمقالات",
};

async function getSEOHealthData() {
  // Get JSON-LD stats
  const jsonLdStats = await getJsonLdStats();

  // Get articles with issues
  const articlesWithIssues = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { jsonLdStructuredData: null },
        { featuredImageId: null },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      jsonLdStructuredData: true,
      jsonLdValidationReport: true,
      featuredImageId: true,
      dateModified: true,
    },
    take: 10,
    orderBy: { dateModified: "desc" },
  });

  // Get authors without complete E-E-A-T data
  const authorsWithIssues = await db.author.count({
    where: {
      OR: [
        { bio: null },
        { image: null },
        { expertiseAreas: { isEmpty: true } },
      ],
    },
  });

  // Get clients without logos
  const clientsWithoutLogos = await db.client.count({
    where: { logoMediaId: null },
  });

  // Calculate scores
  const validationRate = jsonLdStats.total > 0
    ? Math.round(((jsonLdStats.withJsonLd - jsonLdStats.withErrors) / jsonLdStats.total) * 100)
    : 0;

  const coverageRate = jsonLdStats.total > 0
    ? Math.round((jsonLdStats.withJsonLd / jsonLdStats.total) * 100)
    : 0;

  // Fetch Search Console data if configured
  let searchConsoleErrors: any[] = [];
  let errorTrends: any[] = [];
  let searchConsoleConfigured = false;

  if (isSearchConsoleConfigured()) {
    searchConsoleConfigured = true;
    try {
      const credentials = getSearchConsoleCredentials();
      if (credentials) {
        const auth = await initSearchConsoleClient(credentials);
        if (auth) {
          searchConsoleErrors = await fetchStructuredDataErrors(credentials.siteUrl, auth);
          errorTrends = await fetchErrorTrends(credentials.siteUrl, auth, 30);
        }
      }
    } catch (error) {
      console.error("Failed to fetch Search Console data:", error);
    }
  }

  return {
    jsonLdStats,
    articlesWithIssues,
    authorsWithIssues,
    clientsWithoutLogos,
    validationRate,
    coverageRate,
    searchConsoleErrors,
    errorTrends,
    searchConsoleConfigured,
  };
}

async function handleGenerateWeeklyReport() {
  "use server";
  const { generateWeeklyReport, sendWeeklyReport } = await import("@/lib/seo/weekly-report-generator");
  const { getAlertConfig } = await import("@/lib/seo");
  const report = await generateWeeklyReport();
  const config = getAlertConfig();
  await sendWeeklyReport(report, config);
}

export default async function SEOHealthPage() {
  const data = await getSEOHealthData();

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">صحة SEO</h1>
          <p className="text-muted-foreground mt-1">
            مراقبة حالة JSON-LD والبيانات المهيكلة
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          تحديث
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التغطية</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.coverageRate}%</div>
            <Progress value={data.coverageRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.jsonLdStats.withJsonLd} من {data.jsonLdStats.total} مقال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الصحة</CardTitle>
            {data.validationRate >= 90 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : data.validationRate >= 70 ? (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.validationRate}%</div>
            <Progress
              value={data.validationRate}
              className={`mt-2 ${
                data.validationRate >= 90
                  ? "[&>div]:bg-green-500"
                  : data.validationRate >= 70
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-red-500"
              }`}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {data.jsonLdStats.withErrors} مقال مع أخطاء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التحذيرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.jsonLdStats.withWarnings}</div>
            <p className="text-xs text-muted-foreground mt-2">
              مقال مع تحذيرات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              مشاكل تحتاج إصلاح
            </CardTitle>
            <CardDescription>مقالات بدون JSON-LD أو صورة رئيسية</CardDescription>
          </CardHeader>
          <CardContent>
            {data.articlesWithIssues.length > 0 ? (
              <ul className="space-y-2">
                {data.articlesWithIssues.map((article) => (
                  <li key={article.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div>
                      <Link
                        href={`/articles/${article.id}`}
                        className="font-medium hover:underline text-sm"
                      >
                        {article.title.slice(0, 40)}...
                      </Link>
                      <div className="flex gap-2 mt-1">
                        {!article.jsonLdStructuredData && (
                          <Badge variant="destructive" className="text-xs">بدون JSON-LD</Badge>
                        )}
                        {!article.featuredImageId && (
                          <Badge variant="secondary" className="text-xs">بدون صورة</Badge>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span>لا توجد مشاكل حالياً</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              E-E-A-T Status
            </CardTitle>
            <CardDescription>حالة بيانات الخبرة والمصداقية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>كتاب بدون بيانات كاملة</span>
              </div>
              <Badge variant={data.authorsWithIssues > 0 ? "destructive" : "default"}>
                {data.authorsWithIssues}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span>عملاء بدون شعار</span>
              </div>
              <Badge variant={data.clientsWithoutLogos > 0 ? "destructive" : "default"}>
                {data.clientsWithoutLogos}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span>مقالات بدون صور رئيسية</span>
              </div>
              <Badge variant={data.articlesWithIssues.filter(a => !a.featuredImageId).length > 0 ? "secondary" : "default"}>
                {data.articlesWithIssues.filter(a => !a.featuredImageId).length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Console Errors Section (if configured) */}
      {data.searchConsoleConfigured && (
        <SearchConsoleErrorsSection
          errors={data.searchConsoleErrors}
          trends={data.errorTrends}
        />
      )}

      {/* Page Validator */}
      <PageValidator />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة توليد JSON-LD لجميع المقالات
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/articles?filter=no-jsonld">
              <FileText className="h-4 w-4" />
              عرض المقالات بدون JSON-LD
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/authors?filter=incomplete">
              <User className="h-4 w-4" />
              إكمال بيانات الكتاب
            </Link>
          </Button>
          {data.searchConsoleConfigured && (
            <form action={handleGenerateWeeklyReport}>
              <Button variant="outline" type="submit" className="gap-2">
                <FileText className="h-4 w-4" />
                إنشاء تقرير أسبوعي
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

