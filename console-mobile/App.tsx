import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from '@expo-google-fonts/tajawal';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppShell } from '@/src/components/navigation/AppShell';
import { LoginRoute } from '@/src/routes/auth/LoginRoute';
import { AccountRoute } from '@/src/routes/account/AccountRoute';
import { ArticleReviewRoute } from '@/src/routes/articles/ArticleReviewRoute';
import { ArticleReviewApiRoute } from '@/src/routes/articles/ArticleReviewApiRoute';
import { ArticlesApiRoute } from '@/src/routes/articles/ArticlesApiRoute';
import { AudienceReplyRoute } from '@/src/routes/audience/AudienceReplyRoute';
import { AudienceRoute } from '@/src/routes/audience/AudienceRoute';
import { HomeRoute } from '@/src/routes/home/HomeRoute';
import { NotificationsRoute } from '@/src/routes/notifications/NotificationsRoute';
import { AppRoute, ShellRoute } from '@/src/routes/route-types';
import { SupportRoute } from '@/src/routes/support/SupportRoute';
import { SubscriptionRoute } from '@/src/routes/subscription/SubscriptionRoute';
import { VideoUploadRoute } from '@/src/routes/videos/VideoUploadRoute';
import { VideosRoute } from '@/src/routes/videos/VideosRoute';
import { AppThemeProvider, useAppTheme } from '@/src/theme/ThemeProvider';
import { getArticles, getCurrentClient, getDashboard, loginWithEmail, MobileArticle, MobileClientProfile, MobileDashboard } from '@/src/services/mobile-api';

SplashScreen.preventAutoHideAsync();

export default function App() {
  return <SafeAreaProvider><AppThemeProvider><MobileConsole /></AppThemeProvider></SafeAreaProvider>;
}

function MobileConsole() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('login');
  const [client, setClient] = useState<MobileClientProfile | null>(null);
  const [dashboard, setDashboard] = useState<MobileDashboard | null>(null);
  const [articles, setArticles] = useState<MobileArticle[] | null>(null);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });
  const { mode } = useAppTheme();
  useEffect(() => { if (fontsLoaded) SplashScreen.hideAsync(); }, [fontsLoaded]);
  if (!fontsLoaded) return null;
  const handleLogin = async (email: string, password: string) => {
    const session = await loginWithEmail(email, password);
    const [profile, summary, articleItems] = await Promise.all([getCurrentClient(session.accessToken), getDashboard(session.accessToken), getArticles(session.accessToken)]);
    setClient(profile);
    setDashboard(summary);
    setArticles(articleItems);
    setAccessToken(session.accessToken);
    setActiveRoute('home');
  };
  const retryArticles = useCallback(() => {
    if (!accessToken) return;
    setArticlesError(null);
    setArticles(null);
    void getArticles(accessToken).then(setArticles).catch((reason) => setArticlesError(reason instanceof Error ? reason.message : 'تعذّر تحميل المقالات.'));
  }, [accessToken]);
  if (activeRoute === 'login') return <><StatusBar style="light"/><LoginRoute onLogin={handleLogin} /></>;
  const route = activeRoute;
  const activeShellRoute: ShellRoute = route === 'article-review' ? 'articles'
    : route === 'video-upload' ? 'videos'
    : route === 'audience-reply' ? 'audience'
    : route === 'support' || route === 'subscription' ? 'account'
    : route;
  const screen = route === 'home' ? <HomeRoute clientName={client?.name} dashboard={dashboard} onOpenArticles={() => setActiveRoute('articles')} onOpenAudience={() => setActiveRoute('audience')} onOpenSubscription={() => setActiveRoute('subscription')} />
    : route === 'articles' ? <ArticlesApiRoute articles={articles} error={articlesError} onRetry={retryArticles} onReview={(articleId) => { setSelectedArticleId(articleId); setActiveRoute('article-review'); }} />
    : route === 'article-review' && accessToken && selectedArticleId ? <ArticleReviewApiRoute accessToken={accessToken} articleId={selectedArticleId} onDone={() => { retryArticles(); setActiveRoute('articles'); }} />
    : route === 'article-review' ? <ArticleReviewRoute onDone={() => setActiveRoute('articles')} />
    : route === 'videos' ? <VideosRoute onUpload={() => setActiveRoute('video-upload')} />
    : route === 'video-upload' ? <VideoUploadRoute onDone={() => setActiveRoute('videos')} />
    : route === 'audience' ? <AudienceRoute onReply={() => setActiveRoute('audience-reply')} />
    : route === 'audience-reply' ? <AudienceReplyRoute onDone={() => setActiveRoute('audience')} />
    : route === 'notifications' ? <NotificationsRoute onOpenArticle={() => setActiveRoute('article-review')} onOpenAudience={() => setActiveRoute('audience-reply')} onOpenVideo={() => setActiveRoute('videos')} />
    : route === 'support' ? <SupportRoute onDone={() => setActiveRoute('account')} />
    : route === 'subscription' ? <SubscriptionRoute subscription={dashboard?.subscription ?? null} onBack={() => setActiveRoute('home')} />
    : <AccountRoute client={client} onSupport={() => setActiveRoute('support')} onLogout={() => { setClient(null); setDashboard(null); setArticles(null); setAccessToken(null); setSelectedArticleId(null); setActiveRoute('login'); }} />;
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><AppShell client={client} activeRoute={activeShellRoute} onNavigate={setActiveRoute}>{screen}</AppShell></>;
}
