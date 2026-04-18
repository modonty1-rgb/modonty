/**
 * Modonty Icon Registry — Single Source of Truth
 * ─────────────────────────────────────────────────────────────
 * SCOPE: apps/modonty only
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
 *   - Like      = ThumbsUp   (LinkedIn uses ThumbsUp)
 *   - Save      = Bookmark   (LinkedIn uses Bookmark)
 *   - Heart     = REMOVED    (ThumbsUp is the unified like icon)
 *   - ThumbsDown = REMOVED   (LinkedIn doesn't use it)
 */

// ── Navigation ───────────────────────────────────────────────────────────────
export { House            as IconHome          } from 'lucide-react';
export { TrendingUp       as IconTrending      } from 'lucide-react';
export { Tags             as IconCategories    } from 'lucide-react';
export { Tag              as IconCategory      } from 'lucide-react';
export { Building2        as IconClients       } from 'lucide-react';
export { Factory          as IconIndustry      } from 'lucide-react';
export { Bookmark         as IconSaved         } from 'lucide-react';
export { Bell             as IconNotifications } from 'lucide-react';
export { Search           as IconSearch        } from 'lucide-react';
export { Menu             as IconMenu          } from 'lucide-react';

// ── Directional ──────────────────────────────────────────────────────────────
export { ArrowRight       as IconBack          } from 'lucide-react';
export { ArrowLeft        as IconForward       } from 'lucide-react';
export { ChevronLeft      as IconChevronLeft   } from 'lucide-react';
export { ChevronRight     as IconChevronRight  } from 'lucide-react';
export { ChevronDown      as IconChevronDown   } from 'lucide-react';
export { ChevronUp        as IconChevronUp     } from 'lucide-react';
export { ArrowUpDown      as IconSort          } from 'lucide-react';

// ── Auth & User ───────────────────────────────────────────────────────────────
export { User             as IconUser          } from 'lucide-react';
export { Users            as IconUsers         } from 'lucide-react';
export { LogIn            as IconLogin         } from 'lucide-react';
export { LogOut           as IconLogout        } from 'lucide-react';
export { Upload           as IconUpload        } from 'lucide-react';

// ── Article Interactions ─────────────────────────────────────────────────────
// ThumbsUp  = the ONE like icon everywhere (article bar + profile tabs)
// ThumbsDown = REMOVED from articles/profile — IconDislike is FAQ /help/faq only
// Heart      = REMOVED
export { ThumbsUp         as IconLike          } from 'lucide-react';
export { ThumbsDown       as IconDislike       } from 'lucide-react';
export { MessageCircle    as IconComment       } from 'lucide-react';
export { Share2           as IconShare         } from 'lucide-react';
export { Eye              as IconViews         } from 'lucide-react';
export { BookOpen         as IconRead          } from 'lucide-react';
export { FileText         as IconArticle       } from 'lucide-react';
export { Newspaper        as IconNews          } from 'lucide-react';
export { Rss              as IconFeed          } from 'lucide-react';
export { LayoutList       as IconArticleList   } from 'lucide-react';
export { Link2            as IconLink          } from 'lucide-react';
export { Sparkles         as IconAi            } from 'lucide-react';
export { Star             as IconFeatured      } from 'lucide-react';
export { Reply            as IconReply         } from 'lucide-react';

// ── Client & Contact ─────────────────────────────────────────────────────────
export { Globe            as IconWebsite       } from 'lucide-react';
export { Phone            as IconPhone         } from 'lucide-react';
export { Mail             as IconEmail         } from 'lucide-react';
export { Copy             as IconCopy          } from 'lucide-react';
export { ExternalLink     as IconExternal      } from 'lucide-react';
export { Linkedin         as IconLinkedin      } from 'lucide-react';
export { Twitter          as IconTwitter       } from 'lucide-react';
export { Facebook         as IconFacebook      } from 'lucide-react';
export { MessageSquare    as IconMessage       } from 'lucide-react';
export { MapPin           as IconMapPin        } from 'lucide-react';

// ── Analytics & Stats ────────────────────────────────────────────────────────
export { ChartColumn      as IconAnalytics     } from 'lucide-react';
export { Sigma            as IconTotal         } from 'lucide-react';
export { Activity         as IconActivity      } from 'lucide-react';

// ── UI Controls ──────────────────────────────────────────────────────────────
export { EllipsisVertical as IconMore          } from 'lucide-react';
export { X                as IconClose         } from 'lucide-react';
export { Plus             as IconAdd           } from 'lucide-react';
export { Filter           as IconFilter        } from 'lucide-react';
export { SlidersHorizontal as IconFilters      } from 'lucide-react';
export { LayoutGrid       as IconGrid          } from 'lucide-react';
export { List             as IconList          } from 'lucide-react';
export { FolderOpen       as IconFolder        } from 'lucide-react';
export { Image            as IconImage         } from 'lucide-react';
export { Code             as IconCode          } from 'lucide-react';
export { Briefcase        as IconBriefcase     } from 'lucide-react';
export { Lightbulb        as IconLightbulb     } from 'lucide-react';
export { Zap              as IconZap           } from 'lucide-react';
export { Rocket           as IconRocket        } from 'lucide-react';
export { Target           as IconTarget        } from 'lucide-react';
export { Clock            as IconClock         } from 'lucide-react';
export { AlignJustify     as IconAlignJustify  } from 'lucide-react';
export { AlignJustify     as IconContent       } from 'lucide-react';
export { Play             as IconPlay          } from 'lucide-react';
export { FileCheck        as IconFileCheck     } from 'lucide-react';
export { Scale            as IconScale         } from 'lucide-react';
export { Hash             as IconHash          } from 'lucide-react';
export { Languages        as IconLanguages     } from 'lucide-react';
export { SearchX          as IconSearchX       } from 'lucide-react';
export { Calendar         as IconCalendar      } from 'lucide-react';
export { Ellipsis as IconEllipsis } from 'lucide-react'; // أفقي (≠ EllipsisVertical)
export { Check as IconCheck } from 'lucide-react';
export { ArrowUp     as IconScrollTop  } from 'lucide-react';
export { RefreshCw   as IconRefresh    } from 'lucide-react';

// ── Status & Feedback ────────────────────────────────────────────────────────
export { CheckCircle2 as IconCheckCircle } from 'lucide-react';
export { BadgeCheck       as IconVerified      } from 'lucide-react';
export { CircleCheck      as IconSuccess       } from 'lucide-react';
export { AlertCircle      as IconError         } from 'lucide-react';
export { CircleHelp       as IconHelp          } from 'lucide-react';
export { Info             as IconInfo          } from 'lucide-react';
export { Loader2          as IconLoading       } from 'lucide-react';

// ── Settings ─────────────────────────────────────────────────────────────────
export { Lock             as IconLock          } from 'lucide-react';
export { Shield           as IconShield        } from 'lucide-react';
export { Palette          as IconTheme         } from 'lucide-react';
export { Trash2           as IconDelete        } from 'lucide-react';
export { Settings         as IconSettings      } from 'lucide-react';

// ── Aliases & extras (same Lucide icon, second export name) ───────────────────
export { ArrowRight       as IconArrowRight    } from 'lucide-react';
export { Bell             as IconBell          } from 'lucide-react';
export { UserPlus         as IconRegister      } from 'lucide-react';
export { MessageCircleQuestion as IconFaqQuestion } from 'lucide-react';
export { HelpCircle       as IconHelpCircle    } from 'lucide-react';
export { Chrome           as IconChrome        } from 'lucide-react';
export { EyeOff           as IconEyeOff        } from 'lucide-react';
export { Link2Off         as IconLinkOff       } from 'lucide-react';
export { History          as IconHistory       } from 'lucide-react';
export { Send             as IconSend          } from 'lucide-react';
export { MoreVertical     as IconMoreVertical  } from 'lucide-react';
export { FileQuestion     as IconFileQuestion  } from 'lucide-react';
export { Download         as IconDownload      } from 'lucide-react';
export { AlertTriangle    as IconAlertTriangle } from 'lucide-react';
export { Volume2          as IconVolume2       } from 'lucide-react';
export { VolumeX          as IconVolumeX       } from 'lucide-react';
export { Pause            as IconPause         } from 'lucide-react';
export { Circle           as IconCircle        } from 'lucide-react';
export { MoreHorizontal   as IconMoreHorizontal } from 'lucide-react';
