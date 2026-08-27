/**
 * Icon Registry — Single Source of Truth for the whole repo
 * ─────────────────────────────────────────────────────────────
 * SCOPE: the whole repo — modonty, admin, console, and the shared UI primitives
 *
 * HOW TO USE:
 *   import { IconLike, IconSaved } from '@/lib/icons'
 *   <IconLike className="h-4 w-4" />
 *
 * RULES:
 *   - Always import from HERE — never directly from 'lucide-react'
 *   - ONE name = ONE icon = ONE meaning across the entire app
 *   - To change an icon → edit only this file
 *   - Tree-shaking is preserved: only imported icons enter the bundle
 *
 * DECISIONS (LinkedIn-aligned + 2024 best practices):
 *   - Like      = ModontyLikeMark
 *   - Save      = ModontyBookmarkMark
 *   - Heart     = REMOVED    (ModontyLikeMark is the unified like icon)
 *   - ThumbsDown = REMOVED   (LinkedIn doesn't use it)
 */

// ── Navigation ───────────────────────────────────────────────────────────────
export { ModontyHomeMark  as IconHome          } from '../components/icons/modonty-home-mark';
export { ModontyTrendingMark as IconTrending   } from '../components/icons/modonty-trending-mark';
export { ModontyCategoriesMark as IconCategories } from '../components/icons/modonty-categories-mark';
export { ModontyTagsMark  as IconCategory      } from '../components/icons/modonty-tags-mark';
export { ModontyPartnerMark as IconClients } from '../components/icons/modonty-partner-mark';
export { ModontyIndustriesMark as IconIndustry } from '../components/icons/modonty-industries-mark';
export { ModontyBookmarkMark as IconSaved      } from '../components/icons/modonty-bookmark-mark';
export { ModontyNotificationsMark as IconNotifications } from '../components/icons/modonty-notifications-mark';
export { ModontySearchMark as IconSearch       } from '../components/icons/modonty-search-mark';
export { ModontyMenuMark as IconMenu } from '../components/icons/modonty-utility-marks';

// ── Directional ──────────────────────────────────────────────────────────────
export { ModontyArrowMark as IconForward } from '../components/icons/modonty-arrow-mark';
export { ModontyArrowMark as IconChevronLeft } from '../components/icons/modonty-arrow-mark';
export { ModontyArrowMark as IconChevronRight } from '../components/icons/modonty-arrow-mark';
export { ModontyArrowMark as IconChevronDown } from '../components/icons/modonty-arrow-mark';
export { ModontyArrowMark as IconChevronUp } from '../components/icons/modonty-arrow-mark';
export { ModontySortMark  as IconSort          } from '../components/icons/modonty-sort-mark';

// ── Auth & User ───────────────────────────────────────────────────────────────
export { ModontyProfileMark as IconUser        } from '../components/icons/modonty-profile-mark';
export { ModontyProfessionalsMark as IconUsers } from '../components/icons/modonty-professionals-mark';
export { ModontyLoginMark as IconLogin         } from '../components/icons/modonty-login-mark';
export { ModontyLogoutMark as IconLogout       } from '../components/icons/modonty-logout-mark';
export { ModontyUploadMark as IconUpload } from '../components/icons/modonty-brand-icons';

// ── Article Interactions ─────────────────────────────────────────────────────
// ModontyLikeMark = the ONE like icon everywhere (article bar + profile tabs)
// ThumbsDown = REMOVED from articles/profile — IconDislike is FAQ /help/faq only
// Heart      = REMOVED
export { ModontyLikeMark  as IconLike          } from '../components/icons/modonty-like-mark';
export { ModontyFeedbackMark as IconDislike } from '../components/icons/modonty-feedback-mark';
export { ModontyCommentMark as IconComment     } from '../components/icons/modonty-comment-mark';
export { ModontyShareMark as IconShare         } from '../components/icons/modonty-share-mark';
export { ModontyViewsMark as IconViews         } from '../components/icons/modonty-views-mark';
export { ModontyArticlesMark as IconRead } from '../components/icons/modonty-articles-mark';
export { ModontyArticlesMark as IconArticle    } from '../components/icons/modonty-articles-mark';
export { ModontyArticlesMark as IconNews } from '../components/icons/modonty-articles-mark';
export { ModontyArticlesMark as IconFeed } from '../components/icons/modonty-articles-mark';
export { ModontyArticlesMark as IconArticleList } from '../components/icons/modonty-articles-mark';
export { ModontyLinkMark as IconLink } from '../components/icons/modonty-brand-icons';
export { ModontyAiMark as IconAi } from '../components/icons/modonty-brand-icons';
export { ModontyFeaturedMark as IconFeatured   } from '../components/icons/modonty-featured-mark';
export { ModontyCommentMark as IconReply } from '../components/icons/modonty-comment-mark';

// ── Client & Contact ─────────────────────────────────────────────────────────
export { ModontyWebsiteMark as IconWebsite } from '../components/icons/modonty-brand-icons';
export { ModontyPhoneMark as IconPhone         } from '../components/icons/modonty-phone-mark';
export { ModontyEmailMark as IconEmail         } from '../components/icons/modonty-email-mark';
export { ModontyCopyMark as IconCopy } from '../components/icons/modonty-brand-icons';
export { ModontyArrowMark as IconExternal } from '../components/icons/modonty-arrow-mark';
export { Linkedin as IconLinkedin } from '../components/icons/linkedin';
export { Twitter as IconTwitter } from '../components/icons/twitter';
export { SocialFacebookOutline as IconFacebook } from '../components/icons/facebook';
export { ModontySupportMark as IconMessage } from '../components/icons/modonty-support-mark';
export { ModontyLocationMark as IconMapPin     } from '../components/icons/modonty-location-mark';

// ── Analytics & Stats ────────────────────────────────────────────────────────
export { ModontyAnalyticsMark as IconAnalytics } from '../components/icons/modonty-brand-icons';
export { ModontyAnalyticsMark as IconTotal } from '../components/icons/modonty-brand-icons';
export { ModontyActivityMark as IconActivity } from '../components/icons/modonty-brand-icons';

// ── UI Controls ──────────────────────────────────────────────────────────────
export { ModontyCloseMark as IconClose         } from '../components/icons/modonty-close-mark';
export { ModontyAddMark as IconAdd } from '../components/icons/modonty-brand-icons';
export { ModontyFilterMark as IconFilter       } from '../components/icons/modonty-filter-mark';
export { ModontyFilterMark as IconFilters      } from '../components/icons/modonty-filter-mark';
export { ModontyGridMark as IconGrid } from '../components/icons/modonty-brand-icons';
export { ModontyListMark as IconList } from '../components/icons/modonty-brand-icons';
export { ModontyFolderMark as IconFolder } from '../components/icons/modonty-brand-icons';
export { ModontyGalleryMark as IconImage       } from '../components/icons/modonty-gallery-mark';
// Technology / programming scope: the approved AI mark is the closest Modonty digital-technology symbol.
export { ModontyAiMark as IconCode } from '../components/icons/modonty-brand-icons';
export { ModontyProfessionalsMark as IconBriefcase } from '../components/icons/modonty-professionals-mark';
export { ModontyAiMark as IconLightbulb } from '../components/icons/modonty-brand-icons';
export { ModontyActivityMark as IconZap } from '../components/icons/modonty-brand-icons';
export { ModontyCoffeeMark as IconCoffee } from '../components/icons/modonty-coffee-mark';
export { ModontyFootprintsMark as IconFootprints } from '../components/icons/modonty-utility-marks';
export { ModontyArmchairMark as IconArmchair } from '../components/icons/modonty-armchair-mark';
export { ModontyTrendingMark as IconRocket } from '../components/icons/modonty-trending-mark';
export { ModontyDirectionsMark as IconTarget } from '../components/icons/modonty-directions-mark';
export { ModontyClockMark as IconClock         } from '../components/icons/modonty-clock-mark';
export { ModontyTocMark   as IconAlignJustify  } from '../components/icons/modonty-toc-mark';
export { ModontyTocMark   as IconContent       } from '../components/icons/modonty-toc-mark';
export { ModontyPlayMark  as IconPlay          } from '../components/icons/modonty-play-mark';
export { ModontyVideoMark as IconVideo } from '../components/icons/modonty-utility-marks';
export { ModontyTrustMark as IconFileCheck } from '../components/icons/modonty-trust-mark';
export { ModontyTagsMark  as IconHash          } from '../components/icons/modonty-tags-mark';
export { ModontySearchMark as IconSearchX } from '../components/icons/modonty-search-mark';
export { ModontyCalendarMark as IconCalendar   } from '../components/icons/modonty-calendar-mark';
export { ModontyBookingMark as IconCalendarCheck } from '../components/icons/modonty-booking-mark';
export { ModontyShoppingMark as IconShoppingBag } from '../components/icons/modonty-shopping-mark';
export { ModontyCheckMark as IconCheck } from '../components/icons/modonty-check-mark';
export { ModontyArrowMark as IconScrollTop } from '../components/icons/modonty-arrow-mark';
export { ModontyRefreshMark as IconRefresh     } from '../components/icons/modonty-refresh-mark';

// ── Status & Feedback ────────────────────────────────────────────────────────
// `modonty-success-mark` does not exist — ModontySuccessMark lives in modonty-brand-icons
// (same file the IconSuccess alias below already points at). The dangling path broke
// `tsc` for console; found 27 Aug 2026.
export { ModontySuccessMark as IconCheckCircle } from '../components/icons/modonty-brand-icons';
export { ModontyTrustMark as IconVerified } from '../components/icons/modonty-trust-mark';
export { ModontySuccessMark as IconSuccess } from '../components/icons/modonty-brand-icons';
export { ModontyErrorMark as IconError         } from '../components/icons/modonty-error-mark';
export { ModontyQuestionMark as IconHelp       } from '../components/icons/modonty-question-mark';
export { ModontyInfoMark  as IconInfo          } from '../components/icons/modonty-info-mark';
export { ModontyLoadingMark as IconLoading     } from '../components/icons/modonty-loading-mark';

// ── Settings ─────────────────────────────────────────────────────────────────
export { ModontyTrustMark as IconLock } from '../components/icons/modonty-trust-mark';
export { ModontyTrustMark as IconShield } from '../components/icons/modonty-trust-mark';
export { ModontyThemeLightMark as IconTheme } from '../components/icons/modonty-brand-icons';
export { ModontyDeleteMark as IconDelete } from '../components/icons/modonty-brand-icons';
export { ModontySettingsMark as IconSettings } from '../components/icons/modonty-brand-icons';

// ── Aliases & extras ─────────────────────────────────────────────────────────
export { ModontyArrowMark as IconArrowRight } from '../components/icons/modonty-arrow-mark';
export { ModontyNotificationsMark as IconBell  } from '../components/icons/modonty-notifications-mark';
export { ModontyProfileMark as IconRegister } from '../components/icons/modonty-profile-mark';
export { ModontyQuestionMark as IconFaqQuestion } from '../components/icons/modonty-question-mark';
export { ModontyQuestionMark as IconHelpCircle } from '../components/icons/modonty-question-mark';
export { ModontyViewsMark as IconEyeOff } from '../components/icons/modonty-views-mark';
// Lucide visibility glyph paired with IconEyeOff; IconViews uses the branded analytics mark.
export { ModontyViewsMark as IconEye } from '../components/icons/modonty-views-mark';
// The three text-size marks — an A shrinking, an A and a small a, an A growing. The shape a
// reader already knows from every word processor, so the control needs no label.
export { ModontyTextSmallerMark as IconTextSmaller } from '../components/icons/modonty-utility-marks';
export { ModontyTextNormalMark as IconTextNormal } from '../components/icons/modonty-utility-marks';
export { ModontyTextBiggerMark as IconTextBigger } from '../components/icons/modonty-utility-marks';
// The listen tab — headphones when the article has an audio version, struck through when not.
export { ModontyListenMark as IconListen } from '../components/icons/modonty-utility-marks';
export { ModontyListenOffMark as IconListenOff } from '../components/icons/modonty-utility-marks';
export { ModontyLinkOffMark as IconLinkOff } from '../components/icons/modonty-brand-icons';
export { ModontyClockMark as IconHistory } from '../components/icons/modonty-clock-mark';
export { ModontyShareMark as IconSend } from '../components/icons/modonty-share-mark';
export { ModontyMoreVerticalMark as IconMoreVertical } from '../components/icons/modonty-brand-icons';
// 404 / missing-route state: an error is clearer than a generic file-question glyph.
export { ModontyErrorMark as IconFileQuestion } from '../components/icons/modonty-error-mark';
export { ModontyDownloadMark as IconDownload } from '../components/icons/modonty-brand-icons';
export { ModontyAlertTriangleMark as IconAlertTriangle } from '../components/icons/modonty-brand-icons';
export { ModontyAudioMark as IconVolume2 } from '../components/icons/modonty-audio-mark';
export { ModontyAudioMark as IconVolumeX } from '../components/icons/modonty-audio-mark';
export { ModontyPauseMark as IconPause } from '../components/icons/modonty-brand-icons';
export { ModontyCircleMark as IconCircle } from '../components/icons/modonty-brand-icons';
export { ModontyMoreHorizontalMark as IconMoreHorizontal } from '../components/icons/modonty-brand-icons';

// ── Incentives / Marketing ───────────────────────────────────────────────────
export { ModontyOffersMark as IconGift } from '../components/icons/modonty-offers-mark';
export { ModontyOffersMark as IconDiscount } from '../components/icons/modonty-offers-mark';
export { ModontyOffersMark as IconTicket } from '../components/icons/modonty-offers-mark';
export { ModontyDirectionsMark as IconCompass  } from '../components/icons/modonty-directions-mark';

// ── Media player (story / testimonial) ───────────────────────────────────────
export { ModontySkipBackMark as IconSkipBack } from '../components/icons/modonty-brand-icons';
export { ModontySkipForwardMark as IconSkipForward } from '../components/icons/modonty-brand-icons';
// The approved media-control mark is used for the player's terminal control.
export { ModontyPauseMark as IconStop } from '../components/icons/modonty-brand-icons';
export { ModontySpeedMark as IconSpeed } from '../components/icons/modonty-brand-icons';
export { ModontyReplayMark as IconReplay } from '../components/icons/modonty-utility-marks';
// The +15s twin of IconReplay. SkipForward means "next track" everywhere else, so it would
// read as the wrong promise on an article's audio version.
export { ModontyAdvanceMark as IconAdvance } from '../components/icons/modonty-advance-mark';

// ── Devices ──────────────────────────────────────────────────────────────────
export { ModontyMobileMark as IconMobile } from '../components/icons/modonty-brand-icons';
export { ModontyDesktopMark as IconDesktop } from '../components/icons/modonty-brand-icons';

// ── Theme ────────────────────────────────────────────────────────────────────
export { ModontyThemeLightMark as IconSun } from '../components/icons/modonty-brand-icons';
export { ModontyThemeDarkMark as IconMoon } from '../components/icons/modonty-brand-icons';

// ── Trust & commerce ─────────────────────────────────────────────────────────
export { ModontyTrustMark as IconShieldCheck } from '../components/icons/modonty-trust-mark';
export { ModontyPaymentMark as IconWallet } from '../components/icons/modonty-payment-mark';
export { ModontyPartnerMark as IconHandshake } from '../components/icons/modonty-partner-mark';

// ── Controls (counter) ───────────────────────────────────────────────────────
export { ModontyRemoveMark as IconRemove } from '../components/icons/modonty-brand-icons';

// ── Entities ─────────────────────────────────────────────────────────────────
