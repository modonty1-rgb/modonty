import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold } from '@expo-google-fonts/tajawal';
import { DarkTheme, DefaultTheme, NavigationContainer, useFocusEffect, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppShell } from '@/src/components/navigation/AppShell';
import { ConfirmProvider } from '@/src/components/ui/ConfirmProvider';
import { ScreenRef } from '@/src/components/ui/ScreenRef';
import { LoginRoute } from '@/src/routes/auth/LoginRoute';
import { AccountRoute } from '@/src/routes/account/AccountRoute';
import { ArticleReviewApiRoute } from '@/src/routes/articles/ArticleReviewApiRoute';
import { ArticlesApiRoute } from '@/src/routes/articles/ArticlesApiRoute';
import { AudienceReplyRoute } from '@/src/routes/audience/AudienceReplyRoute';
import { AudienceApiRoute } from '@/src/routes/audience/AudienceApiRoute';
import { BookingsRoute } from '@/src/routes/bookings/BookingsRoute';
import { HomeRoute } from '@/src/routes/home/HomeRoute';
import { ReferralRoute } from '@/src/routes/referral/ReferralRoute';
import { NotificationsRoute } from '@/src/routes/notifications/NotificationsRoute';
import { BottomTabRoute, PushedRoute, RootStackParamList } from '@/src/routes/route-types';
import { SupportRoute } from '@/src/routes/support/SupportRoute';
import { SubscriptionRoute } from '@/src/routes/subscription/SubscriptionRoute';
import { VideoUploadRoute } from '@/src/routes/videos/VideoUploadRoute';
import { VideosRoute } from '@/src/routes/videos/VideosRoute';
import { AppThemeProvider, useAppTheme } from '@/src/theme/ThemeProvider';
import { articleFallbackText, ArticleListCollection, getDecisionArticles, getPublishedArticles } from '@/src/services/articles-api';
import { getCurrentClient, getDashboard, loginWithEmail, logoutMobileSession, MobileClientProfile, MobileDashboard, MobileOfflineError, MobileSessionExpiredError, MobileShellCopy, refreshMobileAccessToken } from '@/src/services/mobile-api';
import { clearMobileAccessToken, readMobileAccessToken, saveMobileAccessToken } from '@/src/services/mobile-session';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function App() {
  return <SafeAreaProvider><AppThemeProvider><ConfirmProvider><MobileConsole /></ConfirmProvider></AppThemeProvider></SafeAreaProvider>;
}

/**
 * Every pushed screen draws its own «عنوان + رجوع» header and carries no tab bar — that is
 * what S03 · S04 · S06 · S07 · S08-reply · S10 · S13 · S14 show. The stack header stays off;
 * this wrapper only pays back the safe area the shell would otherwise have supplied.
 */
function PushedScreen({ code, children }: { code: string; children: ReactNode }) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  return <View style={[styles.pushed, { backgroundColor: theme.colors.page, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
    <ScreenRef code={code} />
    {children}
  </View>;
}

/**
 * A stack screen that still wears the app chrome.
 *
 * S05 «مقالات بانتظار قرارك» is reached from the home card, yet the approved image shows the
 * header AND the tab bar with «المقالات» lit — so it is a pushed screen with chrome, not a tab.
 * Tapping a tab from here returns to the tab host rather than stacking a second copy of it.
 */
function ChromeScreen({ code, client, shellCopy, activeTab, unreadCount, onSelectTab, children }: {
  code: string;
  client: MobileClientProfile | null;
  shellCopy: MobileShellCopy;
  activeTab: BottomTabRoute;
  unreadCount: number;
  onSelectTab: (tab: BottomTabRoute) => void;
  children: ReactNode;
}) {
  const navigation = useNavigation<Nav>();
  return <AppShell
    client={client}
    copy={shellCopy}
    activeRoute={activeTab}
    unreadCount={unreadCount}
    onSelectTab={(nextTab) => { onSelectTab(nextTab); navigation.navigate('tabs'); }}
    onOpenPushed={(route: PushedRoute) => navigation.navigate(route)}
  >
    <ScreenRef code={code} />
    {children}
  </AppShell>;
}

/** رموز الشاشات كما في تقرير التست — مرجع تطوير فقط، لا يظهر في الإنتاج. */
const tabScreenCodes: Record<BottomTabRoute, string> = { home: 'S02', articles: 'S11', videos: 'S09', audience: 'S08', notifications: 'S12' };

function MobileConsole() {
  const [client, setClient] = useState<MobileClientProfile | null>(null);
  const [dashboard, setDashboard] = useState<MobileDashboard | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardOffline, setDashboardOffline] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tab, setTab] = useState<BottomTabRoute>('home');
  const [isDashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [isSessionRestoring, setSessionRestoring] = useState(true);
  const [sessionRestoreError, setSessionRestoreError] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold });
  const { theme, mode } = useAppTheme();

  /**
   * Restore only what the first screen draws.
   *
   * ENGINEERING-RULES §4.1: a screen loads what it renders and nothing else. Audience, videos,
   * notifications and subscription each fetch on open, so they are deliberately absent here —
   * this used to preload five collections before the home screen had drawn once.
   */
  useEffect(() => {
    if (!fontsLoaded) return;
    let mounted = true;
    void (async () => {
      try {
        const storedToken = await readMobileAccessToken();
        if (!storedToken) return;
        const refreshedToken = await refreshMobileAccessToken(storedToken);
        const [profile, summary] = await Promise.all([getCurrentClient(refreshedToken), getDashboard(refreshedToken)]);
        if (!mounted) return;
        setClient(profile);
        setDashboard(summary);
        setUnreadCount(summary.unreadNotifications);
        setAccessToken(refreshedToken);
        await saveMobileAccessToken(refreshedToken);
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : null;
        if (reason instanceof MobileSessionExpiredError) {
          try {
            await clearMobileAccessToken();
          } catch (clearReason) {
            if (mounted) setSessionRestoreError(clearReason instanceof Error ? clearReason.message : message);
            return;
          }
        }
        if (mounted) setSessionRestoreError(message);
      } finally {
        if (mounted) setSessionRestoring(false);
      }
    })();
    return () => { mounted = false; };
  }, [fontsLoaded]);

  useEffect(() => { if (fontsLoaded && !isSessionRestoring) SplashScreen.hideAsync(); }, [fontsLoaded, isSessionRestoring]);

  const handleLogin = async (email: string, password: string) => {
    const session = await loginWithEmail(email, password);
    const [profile, summary] = await Promise.all([getCurrentClient(session.accessToken), getDashboard(session.accessToken)]);
    await saveMobileAccessToken(session.accessToken);
    setClient(profile);
    setDashboard(summary);
    setUnreadCount(summary.unreadNotifications);
    setAccessToken(session.accessToken);
  };

  const loadDashboard = useCallback(() => {
    if (!accessToken) return;
    setDashboardError(null);
    setDashboardOffline(false);
    void getDashboard(accessToken).then((next) => { setDashboard(next); setUnreadCount(next.unreadNotifications); }).catch((reason: unknown) => {
      setDashboardOffline(reason instanceof MobileOfflineError);
      setDashboardError(reason instanceof Error ? reason.message : articleFallbackText.loadArticlesFailed);
    });
  }, [accessToken]);

  /** السحب يُبقي الرئيسية تحت الإصبع؛ `loadDashboard` وحدها هي التي تُظهر الهيكل. */
  const refreshDashboard = useCallback(() => {
    if (!accessToken) return;
    setDashboardRefreshing(true);
    void getDashboard(accessToken)
      .then((next) => { setDashboard(next); setUnreadCount(next.unreadNotifications); setDashboardError(null); setDashboardOffline(false); })
      .catch((reason: unknown) => {
        setDashboardOffline(reason instanceof MobileOfflineError);
        setDashboardError(reason instanceof Error ? reason.message : articleFallbackText.loadArticlesFailed);
      })
      .finally(() => setDashboardRefreshing(false));
  }, [accessToken]);

  const handleLogout = useCallback(() => {
    const finish = () => {
      setClient(null); setDashboard(null); setUnreadCount(0);
      setAccessToken(null); setSessionRestoreError(null);
    };
    const clearLocal = () => {
      void clearMobileAccessToken().then(finish).catch((reason) => {
        setSessionRestoreError(reason instanceof Error ? reason.message : null);
        finish();
      });
    };
    if (!accessToken) { clearLocal(); return; }
    void logoutMobileSession(accessToken).catch((reason) => {
      setSessionRestoreError(reason instanceof Error ? reason.message : null);
    }).finally(clearLocal);
  }, [accessToken]);

  if (!fontsLoaded || isSessionRestoring) return null;
  if (!accessToken) return <><StatusBar style="light" /><View style={styles.pushed}><ScreenRef code="S01" /><LoginRoute onLogin={handleLogin} restoreError={sessionRestoreError} /></View></>;

  const navTheme = mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.colors.page, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.page, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent } };

  return <>
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left', contentStyle: { backgroundColor: theme.colors.page } }}>
        <Stack.Screen name="tabs">
          {() => dashboard === null ? null : <TabsShell tab={tab} onSelectTab={setTab} client={client} dashboard={dashboard} dashboardError={dashboardError} dashboardOffline={dashboardOffline} accessToken={accessToken} unreadCount={unreadCount} onUnreadCountChange={setUnreadCount} onReloadDashboard={loadDashboard} onRefreshDashboard={refreshDashboard} isDashboardRefreshing={isDashboardRefreshing} />}
        </Stack.Screen>
        <Stack.Screen name="article-decisions">
          {() => dashboard === null ? <PushedScreen code="S05"><DecisionArticlesScreen accessToken={accessToken} /></PushedScreen> : <ChromeScreen code="S05" client={client} shellCopy={dashboard.shell} activeTab="articles" unreadCount={unreadCount} onSelectTab={setTab}><DecisionArticlesScreen accessToken={accessToken} /></ChromeScreen>}
        </Stack.Screen>
        <Stack.Screen name="article-review">
          {({ route, navigation }) => <PushedScreen code="S07"><ArticleReviewApiRoute accessToken={accessToken} articleId={route.params.articleId} onDone={() => { loadDashboard(); navigation.goBack(); }} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="video-upload">
          {({ navigation }) => <PushedScreen code="S10"><VideoUploadRoute accessToken={accessToken} onDone={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="audience-reply">
          {({ route, navigation }) => <PushedScreen code="S08-reply"><AudienceReplyRoute accessToken={accessToken} questionId={route.params.questionId} onBack={() => navigation.goBack()} onSent={() => { loadDashboard(); navigation.goBack(); }} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="subscription">
          {({ navigation }) => <PushedScreen code="S04"><SubscriptionRoute accessToken={accessToken} onBack={() => navigation.goBack()} onSupport={() => navigation.navigate('support')} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="referral">
          {({ navigation }) => <PushedScreen code="S03"><ReferralRoute accessToken={accessToken} onBack={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="account">
          {({ navigation }) => <PushedScreen code="S13"><AccountRoute accessToken={accessToken} onBack={() => navigation.goBack()} onSupport={() => navigation.navigate('support')} onLogout={handleLogout} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="bookings">
          {({ navigation }) => <PushedScreen code="S15"><BookingsRoute accessToken={accessToken} onBack={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="support">
          {({ navigation }) => <PushedScreen code="S14"><SupportRoute accessToken={accessToken} onDone={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  </>;
}

/**
 * القائمة تُعيد القراءة عند **عودة التركيز إليها**، لا عند التركيب وحده.
 *
 * قِيس حيّاً على الجهاز: بعد اعتماد المقال يرجع العميل إلى الطابور فيرى المقال **ما زال
 * «بانتظار قرارك»** — لأن `onDone` كان يُحدِّث الرئيسية ثم `goBack()`، والقائمة التي يرجع
 * إليها فعلاً لا تُخبَر بشيء. فيظنّ العميل أن الاعتماد فشل ويعيده (والعقد يردّه بـ409،
 * لكن الثقة تُخدَش). الآن الشاشة مسؤولة عن طزاجة بياناتها بنفسها.
 *
 * التركيز الأول يُحمّل بالهيكل، وما بعده **يُحدّث بصمت** فلا يومض هيكلٌ فوق قائمة موجودة.
 * `useCallback` إلزاميّ هنا بنصّ التوثيق وإلا أُعيد تشغيل الأثر مع كل رسمة.
 */
function useReloadOnFocus(load: () => void, refresh: () => void) {
  const hasLoaded = useRef(false);
  useFocusEffect(useCallback(() => {
    if (hasLoaded.current) refresh(); else { hasLoaded.current = true; load(); }
  }, [load, refresh]));
}

/** S05 lives on the stack, not on a tab — the tab bar shows the PUBLISHED list (S11). */
function DecisionArticlesScreen({ accessToken }: { accessToken: string }) {
  const navigation = useNavigation<Nav>();
  const [collection, setCollection] = useState<ArticleListCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const fetchDecisions = useCallback((isPullToRefresh: boolean) => {
    setError(null); setOffline(false);
    // السحب يُبقي القائمة تحت الإصبع؛ التحميل الأول وحده يستبدلها بالهيكل.
    if (isPullToRefresh) setRefreshing(true); else setCollection(null);
    void getDecisionArticles(accessToken).then(setCollection).catch((reason: unknown) => {
      setOffline(reason instanceof MobileOfflineError);
      setError(reason instanceof Error ? reason.message : articleFallbackText.loadArticlesFailed);
    }).finally(() => setRefreshing(false));
  }, [accessToken]);
  const load = useCallback(() => fetchDecisions(false), [fetchDecisions]);
  const refresh = useCallback(() => fetchDecisions(true), [fetchDecisions]);
  useReloadOnFocus(load, refresh);
  return <ArticlesApiRoute collection={collection} error={error} offline={offline} siteOpenError={null} onRetry={load} onRefresh={refresh} isRefreshing={isRefreshing} onOpenSite={() => undefined} onReview={(articleId) => navigation.navigate('article-review', { articleId })} />;
}

/** S11 — the «المقالات» tab. */
function PublishedArticlesScreen({ accessToken }: { accessToken: string }) {
  const navigation = useNavigation<Nav>();
  const [collection, setCollection] = useState<ArticleListCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [siteOpenError, setSiteOpenError] = useState<string | null>(null);
  const [isRefreshing, setRefreshing] = useState(false);
  const fetchPublished = useCallback((isPullToRefresh: boolean) => {
    setError(null); setOffline(false);
    if (isPullToRefresh) setRefreshing(true); else setCollection(null);
    void getPublishedArticles(accessToken).then(setCollection).catch((reason: unknown) => {
      setOffline(reason instanceof MobileOfflineError);
      setError(reason instanceof Error ? reason.message : articleFallbackText.loadArticlesFailed);
    }).finally(() => setRefreshing(false));
  }, [accessToken]);
  const load = useCallback(() => fetchPublished(false), [fetchPublished]);
  const refresh = useCallback(() => fetchPublished(true), [fetchPublished]);
  useReloadOnFocus(load, refresh);
  const openSite = useCallback((url: string) => {
    setSiteOpenError(null);
    void Linking.openURL(url).catch(() => setSiteOpenError(collection?.review.openSiteError ?? null));
  }, [collection?.review.openSiteError]);
  return <ArticlesApiRoute collection={collection} error={error} offline={offline} siteOpenError={siteOpenError} onRetry={load} onRefresh={refresh} isRefreshing={isRefreshing} onOpenSite={openSite} onReview={(articleId) => navigation.navigate('article-review', { articleId })} />;
}

function TabsShell({ tab, onSelectTab, client, dashboard, dashboardError, dashboardOffline, accessToken, unreadCount, onUnreadCountChange, onReloadDashboard, onRefreshDashboard, isDashboardRefreshing }: {
  tab: BottomTabRoute;
  onSelectTab: (tab: BottomTabRoute) => void;
  client: MobileClientProfile | null;
  /** غير قابل للـnull هنا: الغلاف يستهلك نصوصه، والتوكن والرئيسية يُضبطان في نفس الخطوة. */
  dashboard: MobileDashboard;
  dashboardError: string | null;
  dashboardOffline: boolean;
  accessToken: string;
  unreadCount: number;
  onUnreadCountChange: (unreadCount: number) => void;
  onReloadDashboard: () => void;
  onRefreshDashboard: () => void;
  isDashboardRefreshing: boolean;
}) {
  const navigation = useNavigation<Nav>();
  useReloadOnFocus(onReloadDashboard, onRefreshDashboard);

  const screen = tab === 'home' ? <HomeRoute clientName={client?.name} dashboard={dashboard} error={dashboardError} offline={dashboardOffline} onRetry={onReloadDashboard} onRefresh={onRefreshDashboard} isRefreshing={isDashboardRefreshing} onOpenDecisionArticles={() => navigation.navigate('article-decisions')} onOpenVideos={() => onSelectTab('videos')} onOpenAudience={() => onSelectTab('audience')} onOpenBookings={() => navigation.navigate('bookings')} onOpenSubscription={() => navigation.navigate('subscription')} onOpenReferral={() => navigation.navigate('referral')} />
    : tab === 'articles' ? <PublishedArticlesScreen accessToken={accessToken} />
    : tab === 'videos' ? <VideosRoute accessToken={accessToken} onUpload={() => navigation.navigate('video-upload')} />
    : tab === 'audience' ? <AudienceApiRoute accessToken={accessToken} onOpenQuestion={(questionId) => navigation.navigate('audience-reply', { questionId })} />
    : <NotificationsRoute accessToken={accessToken} onOpenArticle={() => navigation.navigate('article-decisions')} onOpenAudience={() => onSelectTab('audience')} onOpenVideos={() => onSelectTab('videos')} onUnreadCountChange={onUnreadCountChange} />;
  return <AppShell client={client} copy={dashboard.shell} activeRoute={tab} unreadCount={unreadCount} onSelectTab={onSelectTab} onOpenPushed={(route: PushedRoute) => navigation.navigate(route)}>
    <ScreenRef code={tabScreenCodes[tab]} />
    {screen}
  </AppShell>;
}

const styles = StyleSheet.create({
  pushed: { flex: 1 },
});
