/**
 * Arabic strings - Single source of truth for console app.
 * All user-facing text MUST come from here.
 */

import { confirm } from "./ar/confirm";
import { common } from "./ar/common";
import { meta } from "./ar/meta";
import { login } from "./ar/login";
import { signedOut } from "./ar/signed-out";
import { logo } from "./ar/logo";
import { nav } from "./ar/nav";
import { header } from "./ar/header";
import { dashboard } from "./ar/dashboard";
import { articles } from "./ar/articles";
import { media } from "./ar/media";
import { analytics } from "./ar/analytics";
import { leads } from "./ar/leads";
import { subscribers } from "./ar/subscribers";
import { campaigns } from "./ar/campaigns";
import { comments } from "./ar/comments";
import { faqs } from "./ar/faqs";
import { questions } from "./ar/questions";
import { bookings } from "./ar/bookings";
import { support } from "./ar/support";
import { profile } from "./ar/profile";
import { seo } from "./ar/seo";
import { settings } from "./ar/settings";
import { telegram } from "./ar/telegram";
import { articleStats } from "./ar/article-stats";

export const ar = {
  confirm,
  common,
  meta,
  login,
  signedOut,
  logo,
  nav,
  header,
  dashboard,
  articles,
  media,
  analytics,
  leads,
  subscribers,
  campaigns,
  comments,
  faqs,
  questions,
  bookings,
  support,
  profile,
  seo,
  settings,
  telegram,
  articleStats,
} as const;
