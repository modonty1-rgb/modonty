export type BottomTabRoute = 'home' | 'articles' | 'videos' | 'audience' | 'notifications';
export type AppRoute =
  | 'login'
  | BottomTabRoute
  | 'account'
  | 'article-review'
  | 'video-upload'
  | 'audience-reply'
  | 'support'
  | 'subscription';

export type ShellRoute = BottomTabRoute | 'account';
