import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold } from '@expo-google-fonts/tajawal';
import { DarkTheme, DefaultTheme, NavigationContainer, StackActions, useFocusEffect, useNavigation, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppShell } from '@/src/components/navigation/AppShell';
import { ConfirmProvider } from '@/src/components/ui/ConfirmProvider';
import { BackgroundGlow } from '@/src/components/ui/Nabd';
import { observeLiveSignals, onLiveRefresh } from '@/src/services/live-refresh';
import { captureNotificationTaps, configureForegroundPresentation, consumeNotificationTaps, ensureAndroidChannel, registerForPushNotifications, type PushTapTarget } from '@/src/services/push-registration';
import { LoginRoute } from '@/src/routes/auth/LoginRoute';
import { SessionRestoreRoute } from '@/src/routes/auth/SessionRestoreRoute';
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
import { getDecisionArticles, getPublishedArticles } from '@/src/services/articles-api';
import { connectionErrorText, getCurrentClient, getDashboard, loginWithEmail, logoutMobileSession, MobileClientProfile, MobileDashboard, MobileOfflineError, MobileSessionExpiredError, MobileShellCopy, onMobileSessionRejected, refreshMobileAccessToken } from '@/src/services/mobile-api';
import { clearMobileAccessToken, clearPushDeviceId, readMobileAccessToken, readPushDeviceId, saveMobileAccessToken } from '@/src/services/mobile-session';
import { clearResourceCache, useEngagementResource, type RefreshFailure } from '@/src/services/use-engagement-resource';

SplashScreen.preventAutoHideAsync();
// قبل أيّ رسم أو جلسة: ضغطة الفتح البارد تُلتقط هنا وتنتظر الشاشات (السبب في `push-registration.ts`).
captureNotificationTaps();

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
function PushedScreen({ children }: { children: ReactNode }) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  return <View style={[styles.pushed, { backgroundColor: theme.colors.page, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
    <BackgroundGlow />
    {children}
  </View>;
}

/**
 * A stack screen that still wears the app chrome.
 *
 * S05 «مقالات بانتظار قرارك» is reached from the home card, yet the approved image shows the
 * header AND the tab bar with «المقالات» lit — so it is a pushed screen with chrome, not a tab.
 * Tapping a tab from here returns to the tab host rather than stacking a second copy of it.
 *
 * **`popTo` لا `navigate`:** في React Navigation 7 صار `navigate` إلى شاشة موجودة في المكدّس
 * **يدفع نسخة جديدة** (خيار `pop` افتراضه `false`) — قِيس على جوّال خالد: تاب «الرئيسية» من هنا
 * دفع غلاف تابات ثانياً، فصار زرّ الرجوع من الرئيسية يعيد فتح «مقالات بانتظار قرارك» القديمة.
 * `popTo('tabs')` يُسقط ما فوق غلاف التابات ويرجع إليه نفسه (التوثيق: stack-actions#popto).
 */
function ChromeScreen({ client, shellCopy, activeTab, unreadCount, onSelectTab, children }: {
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
    onSelectTab={(nextTab) => { onSelectTab(nextTab); navigation.popTo('tabs'); }}
    onOpenPushed={(route: PushedRoute) => navigation.navigate(route)}
  >
    {children}
  </AppShell>;
}


function MobileConsole() {
  const [client, setClient] = useState<MobileClientProfile | null>(null);
  const [dashboard, setDashboard] = useState<MobileDashboard | null>(null);
  /** فشل **تحديث** الرئيسية وهي حاضرة — سطرٌ فوقها لا شاشة بدلها. */
  const [dashboardRefreshFailure, setDashboardRefreshFailure] = useState<RefreshFailure | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tab, setTab] = useState<BottomTabRoute>('home');
  const [isDashboardRefreshing, setDashboardRefreshing] = useState(false);
  const [isSessionRestoring, setSessionRestoring] = useState(true);
  const [sessionRestoreError, setSessionRestoreError] = useState<string | null>(null);
  /** جلسة محفوظة تعذّر التحقق منها بلا ٤٠١ (انقطاع · عطل خادم) — تبقى، ولا تُعرض شاشة الدخول. */
  const [restoreFailure, setRestoreFailure] = useState<{ offline: boolean; message: string } | null>(null);
  const [isRestoreRetrying, setRestoreRetrying] = useState(false);
  const [fontsLoaded] = useFonts({ Tajawal_400Regular, Tajawal_500Medium, Tajawal_700Bold, Tajawal_800ExtraBold });
  const accessTokenRef = useRef<string | null>(null);
  accessTokenRef.current = accessToken;

  /**
   * تسجيل الجهاز للتنبيهات — **مرّة واحدة لكل دخول**، لا لكل توكن.
   *
   * الخادم يملك `devices/register` وموديل `MobileDevice` منذ البداية، والتطبيق لم ينادِهما
   * ولا مرّة: صندوقٌ ينتظر عنواناً لا يصله. فالعميل لا يعرف بالمقال المنتظر قراره إلّا لو
   * فتح التطبيق بنفسه — وهذا يقلب التطبيق من «ينبّهك» إلى «تفقّده كل يوم».
   *
   * وموضعه بعد الجلسة لا قبلها: الرمز يُربط بعميل، ولا عميل قبل الدخول. والفشل لا يُعرض
   * للعميل — تسجيلُ جهازٍ شأنٌ تشغيليّ، وإخفاقُه لا يمنعه من استعمال التطبيق. والتوكن يتجدّد
   * أثناء الجلسة، فالعلَم يُصفَّر عند الخروج وحده كي لا يُعاد التسجيل مع كل تجديد.
   */
  const isPushRegistered = useRef(false);
  useEffect(() => {
    if (accessToken === null || isPushRegistered.current) return;
    isPushRegistered.current = true;
    configureForegroundPresentation();
    void ensureAndroidChannel();
    void registerForPushNotifications(accessToken).then((outcome) => {
      if (outcome.status !== 'registered') console.warn('تسجيل التنبيهات:', outcome);
    });
  }, [accessToken]);

  /**
   * الضغط على التنبيه يفتح وجهته: **المقال نفسه** لو عُرف معرّفه، وإلا تبويبه.
   *
   * التبويب وحده لا يكفي: لو كان العميل داخل شاشة مكدَّسة (مراجعة مقال · الردّ على سؤال)
   * فتغييرُ التبويب يقع **تحتها** ولا يراه. فنعود إلى `tabs` أوّلاً بالمرجع الرسمي.
   *
   * والتنفيذ **حالةٌ تنتظر شروطها** لا نداءٌ فوري: الهدف يُحفظ في `tapTarget` ولا يُنفَّذ إلا
   * والجلسة والرئيسية والملاحة جاهزة معاً (`isNavigationReady` من `onReady`). كان مرجعاً يُفرَّغ
   * في `onReady` الذي يُطلق مرّة واحدة — وكل ما يصل بعدها أو قبل اكتمال الجلسة كان يُترك
   * لأثرٍ بلا تبعيات. و`setTab('home')` في استرجاع الجلسة يقع قبل تركيب الملاحة، فلا يطغى
   * على الوجهة بعد تنفيذها.
   */
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [isNavigationReady, setNavigationReady] = useState(false);
  const [tapTarget, setTapTarget] = useState<PushTapTarget | null>(null);
  const isSignedIn = accessToken !== null;
  useEffect(() => consumeNotificationTaps(setTapTarget), []);
  useEffect(() => {
    if (tapTarget === null || !isSignedIn || dashboard === null || !isNavigationReady || !navigationRef.isReady()) return;
    setTapTarget(null);
    if (tapTarget.articleId) { navigationRef.navigate('article-review', { articleId: tapTarget.articleId }); return; }
    if (tapTarget.tab === 'bookings') { navigationRef.navigate('bookings'); return; }
    setTab(tapTarget.tab);
    // `popTo` يُسقط الشاشات المكدَّسة فوق التابات؛ `navigate` كان يدفع غلافاً ثانياً فوقها.
    navigationRef.dispatch(StackActions.popTo('tabs'));
  }, [dashboard, isNavigationReady, isSignedIn, navigationRef, tapTarget]);

  const { theme, mode } = useAppTheme();

  /** كل ما يخصّ الجلسة يُمسح معاً — ومعه ذاكرة الشاشات كي لا يرى حسابٌ بيانات حسابٍ قبله. */
  const resetSessionState = useCallback((loginMessage: string | null) => {
    clearResourceCache();
    isPushRegistered.current = false;
    // الملاحة تُزال مع الجلسة؛ `onReady` يُطلق من جديد حين تُركَّب بعد الدخول التالي.
    setNavigationReady(false);
    setTapTarget(null);
    setClient(null); setDashboard(null); setUnreadCount(0); setDashboardRefreshFailure(null);
    setTab('home');
    setAccessToken(null);
    setRestoreFailure(null);
    setSessionRestoreError(loginMessage);
  }, []);

  const clearStoredSession = useCallback(async () => {
    await clearMobileAccessToken().catch((reason: unknown) => console.warn('[session] clear token failed', reason));
    await clearPushDeviceId().catch((reason: unknown) => console.warn('[session] clear device id failed', reason));
  }, []);

  /**
   * Restore only what the first screen draws.
   *
   * ENGINEERING-RULES §4.1: a screen loads what it renders and nothing else. Audience, videos,
   * notifications and subscription each fetch on open, so they are deliberately absent here.
   *
   * **٤٠١ وحده يُخرج العميل.** الانقطاع أو عطل الخادم يُبقي الجلسة ويعرض «ما في اتصال» مع
   * إعادة المحاولة — كان أيّ فشل يرميه إلى شاشة الدخول بـ«Network request failed».
   */
  const restoreSession = useCallback(async () => {
    try {
      const storedToken = await readMobileAccessToken();
      if (!storedToken) { setRestoreFailure(null); return; }
      const refreshedToken = await refreshMobileAccessToken(storedToken);
      await saveMobileAccessToken(refreshedToken);
      const [profile, summary] = await Promise.all([getCurrentClient(refreshedToken), getDashboard(refreshedToken)]);
      setClient(profile);
      setDashboard(summary);
      setUnreadCount(summary.unreadNotifications);
      setRestoreFailure(null);
      setTab('home');
      setAccessToken(refreshedToken);
    } catch (reason) {
      if (reason instanceof MobileSessionExpiredError) {
        await clearStoredSession();
        setRestoreFailure(null);
        setSessionRestoreError(reason.message);
        return;
      }
      setRestoreFailure({
        offline: reason instanceof MobileOfflineError,
        message: reason instanceof Error && reason.message ? reason.message : connectionErrorText.verifySessionFailed,
      });
    }
  }, [clearStoredSession]);

  useEffect(() => {
    if (!fontsLoaded) return;
    void restoreSession().finally(() => setSessionRestoring(false));
  }, [fontsLoaded, restoreSession]);

  const retryRestore = useCallback(() => {
    setRestoreRetrying(true);
    void restoreSession().finally(() => setRestoreRetrying(false));
  }, [restoreSession]);

  const { isReady: isThemeReady } = useAppTheme();
  useEffect(() => { if (fontsLoaded && !isSessionRestoring && isThemeReady) SplashScreen.hideAsync(); }, [fontsLoaded, isSessionRestoring, isThemeReady]);

  /**
   * توكنٌ رُفض **أثناء** الجلسة: نجرّب التجديد مرّة. ٤٠١ على التجديد نفسه وحده يُخرج العميل؛
   * الانقطاع لا يفعل شيئاً (الشاشة تعرض حالتها)، والنجاح يستبدل التوكن فتُعيد الشاشات الجلب.
   */
  const isHandlingRejection = useRef(false);
  useEffect(() => onMobileSessionRejected((rejectedToken) => {
    if (isHandlingRejection.current || rejectedToken !== accessTokenRef.current) return;
    isHandlingRejection.current = true;
    void refreshMobileAccessToken(rejectedToken)
      .then(async (freshToken) => {
        await saveMobileAccessToken(freshToken);
        if (accessTokenRef.current === rejectedToken) setAccessToken(freshToken);
      })
      .catch(async (reason: unknown) => {
        if (!(reason instanceof MobileSessionExpiredError) || accessTokenRef.current !== rejectedToken) return;
        await clearStoredSession();
        resetSessionState(reason.message);
      })
      .finally(() => { isHandlingRejection.current = false; });
  }), [clearStoredSession, resetSessionState]);

  const handleLogin = async (identifier: string, password: string) => {
    const session = await loginWithEmail(identifier, password);
    const [profile, summary] = await Promise.all([getCurrentClient(session.accessToken), getDashboard(session.accessToken)]);
    await saveMobileAccessToken(session.accessToken);
    clearResourceCache();
    setClient(profile);
    setDashboard(summary);
    setUnreadCount(summary.unreadNotifications);
    setDashboardRefreshFailure(null);
    setSessionRestoreError(null);
    setTab('home');
    setAccessToken(session.accessToken);
  };

  /**
   * السحب والعودة للتاب يقرآن الرئيسية **بصمت**: البيانات الحاضرة لا تُمسح أبداً.
   * كان أيّ فشل يمسح الرئيسية كلها ويضع مكانها «Network request failed» بالإنجليزي.
   */
  const fetchDashboard = useCallback((showSpinner: boolean) => {
    const token = accessTokenRef.current;
    if (!token) return;
    if (showSpinner) setDashboardRefreshing(true);
    void getDashboard(token)
      .then((next) => { setDashboard(next); setUnreadCount(next.unreadNotifications); setDashboardRefreshFailure(null); })
      .catch((reason: unknown) => {
        setDashboardRefreshFailure({
          offline: reason instanceof MobileOfflineError,
          message: reason instanceof Error && reason.message ? reason.message : connectionErrorText.loadHomeFailed,
        });
      })
      .finally(() => { if (showSpinner) setDashboardRefreshing(false); });
  }, []);
  const loadDashboard = useCallback(() => fetchDashboard(false), [fetchDashboard]);
  const refreshDashboard = useCallback(() => fetchDashboard(true), [fetchDashboard]);
  // التحديث الحيّ: تنبيه يصل أو رجوع من الخلفية ← الرئيسية والشارة تتحدّثان بصمت (`live-refresh.ts`).
  useEffect(() => {
    if (!isSignedIn) return;
    const stopSignals = observeLiveSignals();
    const stopDashboard = onLiveRefresh(loadDashboard);
    return () => { stopSignals(); stopDashboard(); };
  }, [isSignedIn, loadDashboard]);

  /**
   * الخروج: `auth/logout` ومعه معرّف الجهاز (يعطّل تنبيهاته) ← ثم مسح محلي.
   *
   * الجهاز كان يبقى مسجَّلاً بعد الخروج فتصل تنبيهات العميل إلى جوال خرج منه. والنداء
   * بمهلة قصيرة، وفشله (بلا شبكة مثلاً) لا يمنع الخروج: المسح المحلي يقع دائماً.
   */
  const isLoggingOut = useRef(false);
  const handleLogout = useCallback(() => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    const token = accessTokenRef.current;
    void (async () => {
      const deviceId = await readPushDeviceId().catch(() => null);
      if (token) {
        await logoutMobileSession(token, deviceId)
          .then((result) => { if (deviceId && result.deviceUnregistered !== true) console.warn('[logout] device not unregistered', deviceId); })
          .catch((reason: unknown) => console.warn('[logout] server logout failed', reason instanceof Error ? reason.message : reason));
      }
      await clearStoredSession();
      resetSessionState(null);
      isLoggingOut.current = false;
    })();
  }, [clearStoredSession, resetSessionState]);

  if (!fontsLoaded || isSessionRestoring || !isThemeReady) return null;
  if (!accessToken && restoreFailure) return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><View style={styles.pushed}><SessionRestoreRoute failure={restoreFailure} isRetrying={isRestoreRetrying} onRetry={retryRestore} /></View></>;
  // شريط الحالة يتبع الوضع هنا أيضاً — كان «light» ثابتاً فتختفي ساعته على أرضية الوضع الفاتح.
  if (!accessToken) return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><View style={styles.pushed}><LoginRoute onLogin={handleLogin} restoreError={sessionRestoreError} /></View></>;

  const navTheme = mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.colors.page, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.page, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent } };

  return <>
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <NavigationContainer ref={navigationRef} theme={navTheme} onReady={() => setNavigationReady(true)}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left', contentStyle: { backgroundColor: theme.colors.page } }}>
        <Stack.Screen name="tabs">
          {() => dashboard === null ? null : <TabsShell tab={tab} onSelectTab={setTab} client={client} dashboard={dashboard} dashboardRefreshFailure={dashboardRefreshFailure} accessToken={accessToken} unreadCount={unreadCount} onUnreadCountChange={setUnreadCount} onReloadDashboard={loadDashboard} onRefreshDashboard={refreshDashboard} isDashboardRefreshing={isDashboardRefreshing} />}
        </Stack.Screen>
        <Stack.Screen name="article-decisions">
          {() => dashboard === null ? <PushedScreen><DecisionArticlesScreen accessToken={accessToken} /></PushedScreen> : <ChromeScreen client={client} shellCopy={dashboard.shell} activeTab="articles" unreadCount={unreadCount} onSelectTab={setTab}><DecisionArticlesScreen accessToken={accessToken} /></ChromeScreen>}
        </Stack.Screen>
        <Stack.Screen name="article-review">
          {({ route, navigation }) => <PushedScreen><ArticleReviewApiRoute accessToken={accessToken} articleId={route.params.articleId} onDone={() => { loadDashboard(); navigation.goBack(); }} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="video-upload">
          {({ navigation }) => <PushedScreen><VideoUploadRoute accessToken={accessToken} onDone={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="audience-reply">
          {({ route, navigation }) => <PushedScreen><AudienceReplyRoute accessToken={accessToken} questionId={route.params.questionId} onBack={() => navigation.goBack()} onSent={() => { loadDashboard(); navigation.goBack(); }} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="subscription">
          {({ navigation }) => <PushedScreen><SubscriptionRoute accessToken={accessToken} onBack={() => navigation.goBack()} onSupport={() => navigation.navigate('support')} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="referral">
          {({ navigation }) => <PushedScreen><ReferralRoute accessToken={accessToken} onBack={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="account">
          {({ navigation }) => <PushedScreen><AccountRoute accessToken={accessToken} onBack={() => navigation.goBack()} onSupport={() => navigation.navigate('support')} onLogout={handleLogout} logoUrl={client?.logoUrl ?? null} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="bookings">
          {({ navigation }) => <PushedScreen><BookingsRoute accessToken={accessToken} onBack={() => navigation.goBack()} /></PushedScreen>}
        </Stack.Screen>
        <Stack.Screen name="support">
          {({ navigation }) => <PushedScreen><SupportRoute accessToken={accessToken} onDone={() => navigation.goBack()} /></PushedScreen>}
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
    return onLiveRefresh(refresh);
  }, [load, refresh]));
}

/**
 * S05 lives on the stack, not on a tab — the tab bar shows the PUBLISHED list (S11).
 *
 * القائمتان تمرّان بنفس آلة الحالات التي تخدم بقية الشاشات (`useEngagementResource`): جلبٌ
 * أوّل بهيكل · تحديثٌ صامت عند العودة للشاشة (بعد الاعتماد يرجع العميل فيرى الطابور محدَّثاً)
 * · وفشل التحديث يُبقي القائمة ويضع فوقها سطراً — لا يهدمها.
 */
function DecisionArticlesScreen({ accessToken }: { accessToken: string }) {
  const navigation = useNavigation<Nav>();
  const { resource, reload, refresh, isRefreshing, refreshFailure } = useEngagementResource(accessToken, getDecisionArticles);
  return <ArticlesApiRoute collection={resource.data} error={resource.status === 'error' ? resource.message : null} offline={resource.status === 'offline'} refreshFailure={refreshFailure} siteOpenError={null} onRetry={reload} onRefresh={refresh} isRefreshing={isRefreshing} onOpenSite={() => undefined} onReview={(articleId) => navigation.navigate('article-review', { articleId })} />;
}

/** S11 — the «المقالات» tab. */
function PublishedArticlesScreen({ accessToken }: { accessToken: string }) {
  const navigation = useNavigation<Nav>();
  const { resource, reload, refresh, isRefreshing, refreshFailure } = useEngagementResource(accessToken, getPublishedArticles);
  const collection = resource.data;
  const [siteOpenError, setSiteOpenError] = useState<string | null>(null);
  const openSite = useCallback((url: string) => {
    setSiteOpenError(null);
    void Linking.openURL(url).catch(() => setSiteOpenError(collection?.review.openSiteError ?? null));
  }, [collection?.review.openSiteError]);
  return <ArticlesApiRoute collection={collection} error={resource.status === 'error' ? resource.message : null} offline={resource.status === 'offline'} refreshFailure={refreshFailure} siteOpenError={siteOpenError} onRetry={reload} onRefresh={refresh} isRefreshing={isRefreshing} onOpenSite={openSite} onReview={(articleId) => navigation.navigate('article-review', { articleId })} />;
}

function TabsShell({ tab, onSelectTab, client, dashboard, dashboardRefreshFailure, accessToken, unreadCount, onUnreadCountChange, onReloadDashboard, onRefreshDashboard, isDashboardRefreshing }: {
  tab: BottomTabRoute;
  onSelectTab: (tab: BottomTabRoute) => void;
  client: MobileClientProfile | null;
  /** غير قابل للـnull هنا: الغلاف يستهلك نصوصه، والتوكن والرئيسية يُضبطان في نفس الخطوة. */
  dashboard: MobileDashboard;
  dashboardRefreshFailure: RefreshFailure | null;
  accessToken: string;
  unreadCount: number;
  onUnreadCountChange: (unreadCount: number) => void;
  onReloadDashboard: () => void;
  onRefreshDashboard: () => void;
  isDashboardRefreshing: boolean;
}) {
  const navigation = useNavigation<Nav>();
  useReloadOnFocus(onReloadDashboard, onReloadDashboard);

  /**
   * زرّ الرجوع في أيّ تاب غير الرئيسية **يعود إلى الرئيسية** ولا يغلق التطبيق — نمط أندرويد
   * المعتمد لشريط التنقّل السفلي. من الرئيسية يبقى سلوك النظام (الخروج). والدرج `Modal`
   * يلتقط الرجوع بنفسه قبل هذا.
   */
  useFocusEffect(useCallback(() => {
    if (tab === 'home') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onSelectTab('home'); return true; });
    return () => subscription.remove();
  }, [onSelectTab, tab]));

  const openArticleFromNotification = useCallback((articleId: string | null) => {
    if (articleId) navigation.navigate('article-review', { articleId });
    else navigation.navigate('article-decisions');
  }, [navigation]);

  const screen = tab === 'home' ? <HomeRoute clientName={client?.name} unreadCount={unreadCount} onOpenNotifications={() => onSelectTab('notifications')} accessToken={accessToken} dashboard={dashboard} refreshFailure={dashboardRefreshFailure} onRetry={onRefreshDashboard} onRefresh={onRefreshDashboard} isRefreshing={isDashboardRefreshing} onOpenDecisionArticles={() => navigation.navigate('article-decisions')} onOpenVideos={() => onSelectTab('videos')} onOpenAudience={() => onSelectTab('audience')} onOpenBookings={() => navigation.navigate('bookings')} onOpenSubscription={() => navigation.navigate('subscription')} onOpenReferral={() => navigation.navigate('referral')} />
    : tab === 'articles' ? <PublishedArticlesScreen accessToken={accessToken} />
    : tab === 'videos' ? <VideosRoute accessToken={accessToken} onUpload={() => navigation.navigate('video-upload')} />
    : tab === 'audience' ? <AudienceApiRoute accessToken={accessToken} onOpenQuestion={(questionId) => navigation.navigate('audience-reply', { questionId })} />
    : <NotificationsRoute accessToken={accessToken} onOpenArticle={openArticleFromNotification} onOpenAudience={() => onSelectTab('audience')} onOpenVideos={() => onSelectTab('videos')} onOpenBookings={() => navigation.navigate('bookings')} onUnreadCountChange={onUnreadCountChange} />;
  return <AppShell client={client} copy={dashboard.shell} activeRoute={tab} unreadCount={unreadCount} onSelectTab={onSelectTab} onOpenPushed={(route: PushedRoute) => navigation.navigate(route)}>
    {screen}
  </AppShell>;
}

const styles = StyleSheet.create({
  pushed: { flex: 1 },
});
