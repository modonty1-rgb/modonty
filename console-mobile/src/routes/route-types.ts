/** The five top-level destinations in the tab bar, in the RTL order the approved images show. */
export type BottomTabRoute = 'home' | 'articles' | 'videos' | 'audience' | 'notifications';

/**
 * Screens the native stack pushes. None of them wears the tab bar — that is what the approved
 * images show for S03 · S04 · S06 · S07 · S08-reply · S10 · S13 · S14.
 *
 * `article-review` and `audience-reply` carry the id of the thing being reviewed, so a
 * restored stack reopens the same record instead of an empty screen.
 */
export type RootStackParamList = {
  tabs: undefined;
  'article-decisions': undefined;
  'article-review': { articleId: string };
  'video-upload': undefined;
  'audience-reply': { questionId: string };
  subscription: undefined;
  referral: undefined;
  account: undefined;
  support: undefined;
  bookings: undefined;
};

/** Stack destinations reachable without arguments — what the shell's menu may open. */
export type PushedRoute = 'account' | 'support' | 'subscription' | 'referral' | 'article-decisions' | 'video-upload' | 'bookings';
