# Client System - Global TODO List

> **Purpose:** Comprehensive tracking of all missing features, business logic gaps, and improvements needed for the client system based on business model requirements.

> **Last Updated:** 2025-01-27  
> **Status:** Planning Phase - No implementation yet

---

## 📋 Table of Contents

1. [Critical Missing Features (Priority 1)](#critical-missing-features-priority-1)
2. [High Priority Features (Priority 2)](#high-priority-features-priority-2)
3. [Medium Priority Features (Priority 3)](#medium-priority-features-priority-3)
4. [Business Logic Gaps](#business-logic-gaps)
5. [Data Integrity Fixes](#data-integrity-fixes)
6. [Enhancement Opportunities](#enhancement-opportunities)

---

## 🚨 Critical Missing Features (Priority 1)

### 1. Monthly Article Limit Validation

**Status:** ❌ Not Implemented  
**Priority:** Critical  
**Impact:** High - Core business logic missing, allows unlimited article creation  
**Estimated Time:** 4-6 hours  
**Complexity:** Low

**Description:**
Currently, there is no validation when creating articles to check if a client has exceeded their monthly article limit (`articlesPerMonth`). Admins can create unlimited articles for any client, which violates the subscription tier limits.

**Required Implementation:**
- Add validation in `createArticle()` function
- Check client's `articlesPerMonth` limit
- Count articles created this month (PUBLISHED + SCHEDULED status)
- Block article creation if limit reached
- Show clear error message to admin

**Files to Modify:**
- `admin/app/(dashboard)/articles/actions/articles-actions.ts` - Add validation logic in `createArticle()`

**Business Rules:**
- Only count PUBLISHED and SCHEDULED articles
- Count from start of current month
- Check subscription status (must be ACTIVE)
- Check subscription expiration date
- Check payment status (should be PAID for active delivery)

**Acceptance Criteria:**
- [ ] Validation checks `articlesPerMonth` before creating article
- [ ] Validation checks subscription status (must be ACTIVE)
- [ ] Validation checks subscription expiration date
- [ ] Validation checks payment status
- [ ] Counts only PUBLISHED and SCHEDULED articles
- [ ] Counts from start of current month
- [ ] Returns clear error message when limit reached
- [ ] Admin can see remaining articles for client

---

### 2. Subscription Expiration Handling

**Status:** ❌ Not Implemented  
**Priority:** Critical  
**Impact:** High - Core business model relies on subscription management  
**Estimated Time:** 8-12 hours  
**Complexity:** Medium

**Description:**
There is no automatic expiration logic or warnings for subscriptions. Subscription status is manually set, and there's no cron job or scheduled task to check expiration dates.

**Required Implementation:**
- Scheduled job/cron to check `subscriptionEndDate` daily
- Auto-update status to EXPIRED when date passes
- Email notifications before expiration (7 days, 3 days, 1 day)
- Dashboard warnings for expiring subscriptions
- Admin alerts for expiring subscriptions

**Files to Create:**
- `admin/app/api/cron/subscription-check/route.ts` - Scheduled task endpoint
- `admin/helpers/subscriptions/check-expiration.ts` - Expiration logic
- `admin/helpers/subscriptions/send-expiration-warnings.ts` - Email notifications

**Business Rules:**
- Check expiration daily (via cron or scheduled task)
- Update status to EXPIRED automatically
- Send warning emails at 7, 3, and 1 days before expiration
- Show warnings in admin dashboard
- Show warnings in client dashboard (when implemented)

**Acceptance Criteria:**
- [ ] Scheduled task runs daily to check expiration
- [ ] Auto-updates status to EXPIRED when date passes
- [ ] Sends email warning 7 days before expiration
- [ ] Sends email warning 3 days before expiration
- [ ] Sends email warning 1 day before expiration
- [ ] Shows warnings in admin dashboard
- [ ] Prevents article creation for expired subscriptions
- [ ] Admin can manually renew/extend subscription

---

### 3. Client Dashboard/Portal

**Status:** ❌ Not Implemented  
**Priority:** Critical  
**Impact:** Critical - Core value proposition missing  
**Estimated Time:** 40-60 hours  
**Complexity:** High

**Description:**
There is no dedicated client-facing dashboard. Clients cannot view their own articles, analytics, subscription status, or content calendar. Only admins can view client data.

**Required Implementation:**
- Client authentication (separate from admin)
- Client dashboard route (e.g., `/client-portal` or separate app)
- Client-specific views:
  - My Articles (list of client's articles)
  - My Analytics (client's analytics dashboard)
  - Subscription Status (current tier, dates, status)
  - Content Calendar (monthly delivery schedule)
  - Download Customized Versions (Premium feature)
  - Account Settings

**Files to Create:**
- `client-portal/` - New app or routes for client dashboard
- `client-portal/app/(dashboard)/page.tsx` - Dashboard home
- `client-portal/app/(dashboard)/articles/page.tsx` - My Articles
- `client-portal/app/(dashboard)/analytics/page.tsx` - My Analytics
- `client-portal/app/(dashboard)/subscription/page.tsx` - Subscription Status
- `client-portal/app/(dashboard)/calendar/page.tsx` - Content Calendar
- `client-portal/app/(dashboard)/downloads/page.tsx` - Downloads (Premium)
- `client-portal/lib/auth.ts` - Client authentication
- `client-portal/middleware.ts` - Client access control

**Business Rules:**
- Clients can only see their own data
- Clients cannot access admin features
- Premium clients see additional features (downloads, customized versions)
- Clients see subscription status and expiration warnings
- Clients can view analytics for their articles only

**Acceptance Criteria:**
- [ ] Client authentication system implemented
- [ ] Client dashboard accessible at dedicated route
- [ ] Clients can view their articles list
- [ ] Clients can view their analytics
- [ ] Clients can see subscription status
- [ ] Clients can see content calendar
- [ ] Premium clients can download customized versions
- [ ] Clients cannot access other clients' data
- [ ] Clients cannot access admin features
- [ ] Responsive design for mobile access

---

### 4. Payment Integration

**Status:** ❌ Not Implemented  
**Priority:** Critical  
**Impact:** Critical - Revenue collection missing  
**Estimated Time:** 20-30 hours  
**Complexity:** High

**Description:**
Payment status is manual with no actual payment processing. There's no payment gateway integration, invoice generation, or payment tracking.

**Required Implementation:**
- Payment gateway integration (Stripe, PayPal, or local gateways)
- Invoice generation
- Payment webhooks
- Payment history tracking
- Automatic status updates (PENDING → PAID)
- Payment reminders for overdue

**Files to Create:**
- `admin/app/api/payments/webhook/route.ts` - Payment webhook handler
- `admin/helpers/payments/generate-invoice.ts` - Invoice generation
- `admin/helpers/payments/process-payment.ts` - Payment processing
- `admin/components/payments/invoice-preview.tsx` - Invoice preview
- `admin/components/payments/payment-history.tsx` - Payment history

**Business Rules:**
- Generate invoice when subscription created
- Update payment status automatically via webhook
- Send payment confirmation email
- Track payment history per client
- Send reminders for overdue payments
- Support multiple payment methods

**Acceptance Criteria:**
- [ ] Payment gateway integrated (Stripe/PayPal/local)
- [ ] Invoice generation working
- [ ] Payment webhooks processing correctly
- [ ] Payment status updates automatically
- [ ] Payment history tracked per client
- [ ] Payment confirmation emails sent
- [ ] Overdue payment reminders sent
- [ ] Admin can view payment history
- [ ] Admin can manually mark payment as paid
- [ ] Support for refunds (if needed)

---

## 🔴 High Priority Features (Priority 2)

### 5. Email Notification System

**Status:** ❌ Not Implemented  
**Priority:** High  
**Impact:** High - Client communication critical  
**Estimated Time:** 12-16 hours  
**Complexity:** Medium

**Description:**
No email notifications for clients. Missing notifications for new articles, subscription renewals, payment reminders, and content delivery.

**Required Implementation:**
- Email service integration (Resend, SendGrid, etc.)
- Email templates (HTML + text)
- Notification triggers:
  - Article published → notify client
  - Subscription expiring → reminder emails
  - Payment due → payment reminder
  - New article available → delivery notification
  - Subscription activated → welcome email
  - Subscription expired → expiration notice

**Files to Create:**
- `admin/lib/email/client.ts` - Email service client
- `admin/lib/email/templates/` - Email templates directory
- `admin/lib/email/templates/article-published.tsx` - Article published template
- `admin/lib/email/templates/subscription-expiring.tsx` - Expiration reminder
- `admin/lib/email/templates/payment-reminder.tsx` - Payment reminder
- `admin/lib/email/templates/welcome.tsx` - Welcome email
- `admin/helpers/notifications/send-article-notification.ts` - Article notification
- `admin/helpers/notifications/send-subscription-reminder.ts` - Subscription reminder

**Business Rules:**
- Send email when article is published
- Send email when subscription is about to expire
- Send email when payment is due
- Send welcome email when subscription activated
- Allow clients to manage email preferences
- Support Arabic and English emails

**Acceptance Criteria:**
- [ ] Email service integrated
- [ ] Email templates created (HTML + text)
- [ ] Article published notification working
- [ ] Subscription expiration reminders working
- [ ] Payment reminders working
- [ ] Welcome email sent on activation
- [ ] Clients can manage email preferences
- [ ] Email delivery tracking (opened, clicked)
- [ ] Support for Arabic content

---

### 6. Content Delivery Workflow

**Status:** ❌ Not Implemented  
**Priority:** High  
**Impact:** High - Core service delivery missing  
**Estimated Time:** 16-24 hours  
**Complexity:** Medium-High

**Description:**
No structured content delivery process. Missing monthly delivery tracking, customized version generation (Premium), content approval workflow, and download links.

**Required Implementation:**
- Article delivery status tracking
- Customized version generation (if different from main article)
- Client download portal
- Delivery confirmation system
- Monthly delivery reports
- Content calendar per client

**Files to Create:**
- `admin/app/(dashboard)/deliveries/page.tsx` - Delivery management
- `admin/helpers/deliveries/track-delivery.ts` - Delivery tracking
- `admin/helpers/deliveries/generate-customized-version.ts` - Customized version
- `admin/helpers/deliveries/create-download-link.ts` - Download link generation
- `admin/components/deliveries/delivery-status.tsx` - Delivery status component
- `admin/components/deliveries/monthly-report.tsx` - Monthly report

**Business Rules:**
- Track delivery status per article
- Generate customized version for Premium clients
- Create secure download links (expiring)
- Send delivery confirmation email
- Generate monthly delivery reports
- Show delivery calendar per client

**Acceptance Criteria:**
- [ ] Delivery status tracking implemented
- [ ] Customized version generation working (Premium)
- [ ] Download links generated securely
- [ ] Delivery confirmation emails sent
- [ ] Monthly delivery reports generated
- [ ] Content calendar shows delivery schedule
- [ ] Admin can track delivery status
- [ ] Clients can download their articles (Premium)
- [ ] Download links expire after set time

---

### 7. Client Access Control

**Status:** ⚠️ Partially Implemented  
**Priority:** High  
**Impact:** High - Security and multi-tenancy concern  
**Estimated Time:** 12-16 hours  
**Complexity:** Medium

**Description:**
Schema supports client access (`User.clientAccess`), but no enforcement. No middleware or checks to enforce client access, and no client login flow.

**Required Implementation:**
- Client authentication flow
- Middleware to check client access
- Client-specific data filtering
- Client dashboard access control
- Role-based access control (CLIENT role)

**Files to Create/Modify:**
- `client-portal/lib/auth.ts` - Client authentication
- `client-portal/middleware.ts` - Client access middleware
- `admin/lib/auth.ts` - Update to support client access
- `admin/helpers/auth/check-client-access.ts` - Access check utility

**Business Rules:**
- Clients can only access their own data
- Clients cannot access admin routes
- Admin can access all clients
- CLIENT role users restricted to their assigned clients
- Session management for client users

**Acceptance Criteria:**
- [ ] Client authentication flow implemented
- [ ] Middleware enforces client access
- [ ] Clients can only see their own data
- [ ] Clients cannot access admin features
- [ ] Admin can access all clients
- [ ] CLIENT role properly restricted
- [ ] Session management working
- [ ] Access control tested and secure

---

### 8. Monthly Delivery Tracking

**Status:** ❌ Not Implemented  
**Priority:** High  
**Impact:** Medium - Important for operations visibility  
**Estimated Time:** 8-12 hours  
**Complexity:** Medium

**Description:**
No tracking of articles delivered per month per client. No dashboard showing delivery progress or monthly delivery reports.

**Required Implementation:**
- Dashboard showing articles delivered this month vs. limit
- Monthly delivery reports
- Content calendar per client
- Delivery history tracking
- Progress indicators

**Files to Create:**
- `admin/app/(dashboard)/clients/[id]/components/delivery-tracking.tsx` - Delivery tracking component
- `admin/helpers/deliveries/get-monthly-delivery.ts` - Monthly delivery query
- `admin/helpers/deliveries/generate-delivery-report.ts` - Report generation
- `admin/components/deliveries/delivery-calendar.tsx` - Calendar component

**Business Rules:**
- Track articles delivered per month per client
- Show progress: X articles delivered / Y articles limit
- Generate monthly reports
- Show delivery calendar
- Track delivery history

**Acceptance Criteria:**
- [ ] Dashboard shows monthly delivery progress
- [ ] Monthly delivery reports generated
- [ ] Content calendar per client working
- [ ] Delivery history tracked
- [ ] Progress indicators visible
- [ ] Admin can view delivery stats
- [ ] Clients can view their delivery calendar (when portal implemented)

---

## 🟡 Medium Priority Features (Priority 3)

### 9. Renewal Management

**Status:** ❌ Not Implemented  
**Priority:** Medium  
**Impact:** Medium - Important for retention  
**Estimated Time:** 8-12 hours  
**Complexity:** Medium

**Description:**
No renewal workflow or tracking. Missing renewal reminders, renewal process, and renewal analytics.

**Required Implementation:**
- Renewal reminders (email + dashboard)
- Renewal workflow
- Subscription extension logic
- Renewal analytics
- Renewal rate tracking

**Files to Create:**
- `admin/app/(dashboard)/renewals/page.tsx` - Renewal management
- `admin/helpers/renewals/send-renewal-reminder.ts` - Renewal reminders
- `admin/helpers/renewals/process-renewal.ts` - Renewal processing
- `admin/components/renewals/renewal-analytics.tsx` - Renewal analytics

**Business Rules:**
- Send renewal reminders before expiration
- Process renewal (extend subscription)
- Track renewal rate
- Show renewal analytics
- Support tier upgrades/downgrades on renewal

**Acceptance Criteria:**
- [ ] Renewal reminders sent
- [ ] Renewal workflow implemented
- [ ] Subscription extension working
- [ ] Renewal analytics tracked
- [ ] Renewal rate calculated
- [ ] Admin can process renewals
- [ ] Clients can renew (when portal implemented)

---

### 10. Onboarding Workflow

**Status:** ❌ Not Implemented  
**Priority:** Medium  
**Impact:** Medium - Important for client success  
**Estimated Time:** 12-16 hours  
**Complexity:** Medium

**Description:**
No structured client onboarding process. Missing onboarding checklist, welcome email sequence, setup wizard, and initial content delivery.

**Required Implementation:**
- Onboarding checklist
- Welcome email sequence
- Setup wizard
- Initial content delivery
- Onboarding progress tracking

**Files to Create:**
- `admin/app/(dashboard)/clients/[id]/onboarding/page.tsx` - Onboarding page
- `admin/components/onboarding/checklist.tsx` - Onboarding checklist
- `admin/components/onboarding/wizard.tsx` - Setup wizard
- `admin/helpers/onboarding/send-welcome-sequence.ts` - Welcome emails
- `admin/helpers/onboarding/track-progress.ts` - Progress tracking

**Business Rules:**
- Show onboarding checklist for new clients
- Send welcome email sequence
- Guide through setup wizard
- Deliver initial content
- Track onboarding progress

**Acceptance Criteria:**
- [ ] Onboarding checklist implemented
- [ ] Welcome email sequence sent
- [ ] Setup wizard working
- [ ] Initial content delivered
- [ ] Onboarding progress tracked
- [ ] Admin can see onboarding status
- [ ] Clients guided through setup

---

## 🔧 Business Logic Gaps

### Article Creation Validation

**Missing Checks:**
- [ ] Monthly article limit validation
- [ ] Subscription status check (must be ACTIVE)
- [ ] Subscription expiration date check
- [ ] Payment status check (should be PAID for active delivery)

**Files to Modify:**
- `admin/app/(dashboard)/articles/actions/articles-actions.ts` - Add validation in `createArticle()`

---

### Subscription Management

**Missing Logic:**
- [ ] Automatic expiration detection
- [ ] 18-month calculation (12 months paid = 18 months content)
- [ ] Subscription renewal workflow
- [ ] Tier upgrade/downgrade logic

**Files to Create/Modify:**
- `admin/helpers/subscriptions/calculate-end-date.ts` - Auto-calculate end date
- `admin/helpers/subscriptions/process-renewal.ts` - Renewal logic
- `admin/helpers/subscriptions/upgrade-downgrade.ts` - Tier changes

---

### Content Delivery

**Missing Logic:**
- [ ] Monthly delivery scheduling
- [ ] Delivery tracking
- [ ] Customized version generation (Premium)
- [ ] Delivery confirmation

**Files to Create:**
- `admin/helpers/deliveries/schedule-monthly-delivery.ts` - Monthly scheduling
- `admin/helpers/deliveries/track-delivery.ts` - Delivery tracking
- `admin/helpers/deliveries/generate-customized.ts` - Customized version

---

## 🛠️ Data Integrity Fixes

### Articles Per Month Calculation

**Issue:** `articlesPerMonth` can be manually overridden, not enforced from tier

**Fix:**
- [ ] Auto-calculate from tier in form
- [ ] Make it read-only or computed field
- [ ] Validate tier → articlesPerMonth mapping

**Files to Modify:**
- `admin/app/(dashboard)/clients/components/client-form.tsx` - Auto-calculate from tier
- `admin/app/(dashboard)/clients/components/subscription-tier-cards.tsx` - Ensure mapping is correct

---

### Subscription End Date Calculation

**Issue:** Should auto-calculate 18 months from start date for 12-month payment

**Fix:**
- [ ] Auto-calculate: `subscriptionEndDate = subscriptionStartDate + 18 months`
- [ ] Update when subscription start date changes
- [ ] Show calculation in UI

**Files to Modify:**
- `admin/app/(dashboard)/clients/components/client-form.tsx` - Auto-calculate end date
- `admin/app/(dashboard)/clients/actions/clients-actions.ts` - Ensure calculation in server action

---

## 🎨 Enhancement Opportunities

### Analytics Enhancements

- [ ] Real-time analytics updates
- [ ] Advanced analytics filters
- [ ] Export analytics data
- [ ] Analytics comparison (month-over-month)
- [ ] Top performing articles insights

### Client Experience

- [ ] Client mobile app (mentioned in business model)
- [ ] Push notifications for new articles
- [ ] Client feedback system
- [ ] Client support chat
- [ ] Client knowledge base

### Admin Experience

- [ ] Bulk subscription updates
- [ ] Subscription analytics dashboard
- [ ] Client health scores
- [ ] Automated client reports
- [ ] Client communication log

### Content Management

- [ ] Article templates per client
- [ ] Content approval workflow (Premium)
- [ ] Content refresh system (Premium)
- [ ] Keyword ranking tracking (Premium)
- [ ] CMS integration (WordPress, Shopify) (Premium)

---

## 📊 Implementation Progress Tracking

### Overall Progress

- **Total Features:** 10 critical/high priority + enhancements
- **Completed:** 0
- **In Progress:** 0
- **Not Started:** 10

### Priority Breakdown

- **Priority 1 (Critical):** 4 features - 0% complete
- **Priority 2 (High):** 4 features - 0% complete
- **Priority 3 (Medium):** 2 features - 0% complete

---

## 📝 Notes

- This TODO list is based on comprehensive audit of client system
- All items are aligned with business model requirements (BUSINESS_MODEL.md)
- Estimated times are rough estimates and may vary
- Priority levels are based on business impact
- No code implementation should be done until explicit approval

---

**Last Audit Date:** 2025-01-27  
**Next Review:** TBD  
**Maintained By:** Development Team
