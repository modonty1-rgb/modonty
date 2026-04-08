# Toast System - Implementation TODO

**Project:** Console App Toast Notification System  
**Status:** 🟡 In Progress (Core done, refinements needed)  
**Last Updated:** 2026-04-08  
**Owner:** @yourname

---

## 📊 Overview

| Category | Done | Total | % | Priority |
|----------|------|-------|---|----------|
| Core Implementation | 4 | 4 | 100% | ✅ Complete |
| Configuration | 0 | 5 | 0% | 🔴 CRITICAL |
| Hooks & Utils | 0 | 3 | 0% | 🔴 CRITICAL |
| Success Feedback | 0 | 6 | 0% | 🔴 CRITICAL |
| Error Handling | 0 | 2 | 0% | 🔴 CRITICAL |
| Validation Messages | 0 | 3 | 0% | 🟠 HIGH |
| Styling & Theme | 0 | 3 | 0% | 🟠 HIGH |
| Documentation | 0 | 2 | 0% | 🟠 HIGH |
| Accessibility | 0 | 3 | 0% | 🟠 HIGH |
| Testing | 0 | 5 | 0% | 🟠 HIGH |
| **TOTAL** | **4** | **36** | **11%** | |

---

## 🔴 CRITICAL - Must Complete Before Push (4-5 hours)

### Phase 1: Toast Provider Enhancements (30 minutes)

- [ ] **Update ToastProvider with accessibility config**
  - Task: Edit `console/app/components/providers/toast-provider.tsx`
  - Add `visibleToasts={3}` to prevent notification flooding
  - Add `closeButton` for user control
  - Add `containerAriaLabel="إشعارات"` for accessibility
  - Add `expand={false}` for less distracting behavior
  - Add `gap={14}` for visual spacing
  - Add `offset={24}` for screen margins
  - Change `theme="light"` to `theme="system"`
  - Files: `toast-provider.tsx`
  - Estimate: 30 min
  - Acceptance: Config matches best practices, no TS errors

---

### Phase 2: Centralized Toast Hook (45 minutes)

- [ ] **Create useAppToast hook**
  - Task: Create `console/hooks/use-app-toast.ts`
  - Implement success/error/info/warning methods
  - Add duration defaults (error: 5s, others: 4s)
  - Add TypeScript types for options
  - Add JSDoc comments
  - Files: `hooks/use-app-toast.ts` (new)
  - Estimate: 45 min
  - Acceptance: Hook is type-safe, exports all methods, has no lint warnings

- [ ] **Update login form to use hook**
  - Task: Update `console/app/(auth)/login/components/login-form.tsx`
  - Import `useAppToast` instead of direct `toast`
  - Replace `toast.error()` calls with hook method
  - Files: `login-form.tsx`
  - Estimate: 15 min (included above)
  - Acceptance: Form works, shows toast on error

---

### Phase 3: Success Toast Implementation (1 hour)

- [ ] **Add success toast to settings form**
  - Task: Update `console/app/(dashboard)/dashboard/settings/components/settings-form.tsx`
  - Add `toast.success()` on successful save
  - Show success message with `messages.success.saved`
  - Files: `settings-form.tsx`
  - Estimate: 15 min
  - Acceptance: Toast appears on form submit success

- [ ] **Add success toast to profile form**
  - Task: Update `console/app/(dashboard)/dashboard/profile/components/profile-form.tsx`
  - Add `toast.success()` on successful update
  - Files: `profile-form.tsx`
  - Estimate: 15 min
  - Acceptance: Toast appears on profile update

- [ ] **Add success toast to change password form**
  - Task: Update `console/app/(dashboard)/dashboard/settings/components/change-password-form.tsx`
  - Add `toast.success(messages.success.passwordChanged)` after password change
  - Files: `change-password-form.tsx`
  - Estimate: 15 min
  - Acceptance: Toast shows "تم تغيير كلمة المرور بنجاح"

- [ ] **Add success toasts to article actions**
  - Task: Update components using article actions
  - Add success toast for approve, reject, request changes
  - Files: `console/app/(dashboard)/dashboard/articles/components/article-card.tsx` (and related)
  - Estimate: 15 min
  - Acceptance: All article actions show appropriate success toasts

---

### Phase 4: Error Type System (1 hour)

- [ ] **Update Server Action return types**
  - Task: Create type for better error handling
  - Create `lib/types/action.ts` with typed result
  - Define: `type ActionResult<T> = { success: true; data: T } | { success: false; error: ErrorKey }`
  - Update all Server Action return types to use `ErrorKey` not `string`
  - Files: 
    - `lib/types/action.ts` (new)
    - All 12 action files (types only, no logic change)
  - Estimate: 1 hour
  - Acceptance: All actions typed correctly, no `unknown` error types

---

## 🟠 HIGH Priority - Complete Before v1 Release (4-5 hours)

### Phase 5: Validation Messages (1 hour)

- [ ] **Add validation message keys and types**
  - Task: Extend `lib/messages/types.ts`
  - Add `ValidationKey` type with: minLength, maxLength, min, max, email, url, slug_exists
  - Files: `lib/messages/types.ts`
  - Estimate: 15 min
  - Acceptance: New types compile without errors

- [ ] **Add Arabic validation translations**
  - Task: Update `lib/messages/ar.ts`
  - Add validation object with messages
  - Include parameterized messages: `minLength(n)`, `maxLength(n)`, etc.
  - Files: `lib/messages/ar.ts`
  - Estimate: 15 min
  - Acceptance: All validation messages in Arabic, functions work

- [ ] **Export validation messages from index**
  - Task: Update `lib/messages/index.ts`
  - Export validation messages
  - Add helper function: `getValidationMessage(key, param?)`
  - Files: `lib/messages/index.ts`
  - Estimate: 15 min
  - Acceptance: Validation exports properly, no TS errors

- [ ] **Document validation message usage**
  - Task: Create usage examples for forms
  - Show how to use validation messages with Zod
  - Files: `docs/TOAST_SYSTEM.md`
  - Estimate: 15 min
  - Acceptance: Examples are clear and runnable

---

### Phase 6: Tailwind Custom Styling (1.5 hours)

- [ ] **Add custom classNames to ToastProvider**
  - Task: Update `console/app/components/providers/toast-provider.tsx`
  - Add `toastOptions.classNames` with Tailwind classes
  - Style success/error/warning/info variants
  - Add dark mode support with `dark:` prefix
  - Add RTL support with `rtl:` variants
  - Files: `toast-provider.tsx`
  - Estimate: 45 min
  - Acceptance: Toasts styled with Tailwind, variants work, dark mode works

- [ ] **Test styling in browser**
  - Task: Manual testing
  - Test all toast types (success, error, warning, info)
  - Test in light and dark modes
  - Test RTL layout
  - Test on mobile viewport
  - Files: Browser testing
  - Estimate: 45 min
  - Acceptance: No visual issues, proper contrast ratios

---

### Phase 7: Documentation (1 hour)

- [ ] **Create toast system documentation**
  - Task: Create `console/docs/TOAST_SYSTEM.md`
  - Document: Configuration, usage, examples, best practices
  - Include: Success, error, promise, warning patterns
  - Add: Common pitfalls and solutions
  - Files: `docs/TOAST_SYSTEM.md` (new)
  - Estimate: 45 min
  - Acceptance: Documentation is clear, examples run without errors

- [ ] **Create toast pattern examples file**
  - Task: Create `console/docs/TOAST_PATTERNS.tsx` (code examples)
  - Show: Form submission, async operations, error handling
  - Show: Custom error messages, validation feedback
  - Files: `docs/TOAST_PATTERNS.tsx` (new)
  - Estimate: 15 min
  - Acceptance: All patterns compile, examples are runnable

---

### Phase 8: Accessibility Enhancements (1 hour)

- [ ] **Add localized ARIA labels**
  - Task: Update `toast-provider.tsx` with Arabic ARIA labels
  - Set `containerAriaLabel="إشعارات"` (Notifications)
  - Set `toastOptions.closeButtonAriaLabel="إغلاق الإشعار"` (Close notification)
  - Files: `toast-provider.tsx`
  - Estimate: 15 min
  - Acceptance: ARIA attributes present and correct

- [ ] **Test with screen reader**
  - Task: Manual accessibility testing
  - Test with NVDA (Windows) or JAWS
  - Verify: Toasts announced properly, labels read correctly
  - Check: Keyboard navigation (Tab, Escape keys)
  - Files: Manual testing
  - Estimate: 30 min
  - Acceptance: Screen reader announces toasts, keyboard nav works

- [ ] **Verify WCAG AA compliance**
  - Task: Accessibility audit
  - Check: Color contrast ratios (4.5:1 for text)
  - Verify: Focus indicators visible
  - Test: Keyboard-only navigation
  - Files: Manual review + tools
  - Estimate: 15 min
  - Acceptance: WCAG AA compliance verified

---

## 🟡 MEDIUM Priority - Next Sprint (3-4 hours)

### Phase 9: Testing & QA (2 hours)

- [ ] **Manual browser testing - Login flow**
  - Test: Invalid credentials error toast
  - Test: Successful login (no error)
  - Acceptance: Error toast shows, then clears on input change

- [ ] **Manual browser testing - Settings form**
  - Test: Successful save → success toast
  - Test: Validation error (if applicable) → error toast
  - Acceptance: Both success and error feedback works

- [ ] **Manual browser testing - Profile form**
  - Test: Successful update → success toast
  - Test: Server error → error toast
  - Acceptance: All states handled correctly

- [ ] **Manual browser testing - Article actions**
  - Test: Approve article → success toast
  - Test: Reject article → error toast
  - Test: Request changes → feedback required error
  - Acceptance: All actions show proper feedback

- [ ] **Mobile & RTL testing**
  - Test: Toasts appear correctly in RTL layout
  - Test: Toasts visible and usable on mobile (375px width)
  - Test: Touch interactions work (close button)
  - Acceptance: Mobile layout is responsive, RTL proper

- [ ] **Dark mode testing (if applicable)**
  - Test: Toasts visible in dark mode
  - Test: Color contrast maintained
  - Test: No visual glitches
  - Acceptance: Dark mode works as designed

- [ ] **Performance testing**
  - Test: Bundle size impact
  - Measure: First Contentful Paint (FCP)
  - Profile: Toast rendering performance
  - Acceptance: No regressions detected

- [ ] **Browser compatibility**
  - Test: Chrome, Firefox, Safari, Edge
  - Test: Latest 2 versions of each
  - Acceptance: Works consistently across browsers

---

### Phase 10: Admin App Consolidation (2 hours)

- [ ] **Audit admin toast system**
  - Task: Review `admin/components/ui/toaster.tsx`
  - Compare: With Sonner approach
  - Document: Differences and migration path
  - Files: Manual review
  - Estimate: 30 min
  - Acceptance: Migration plan created

- [ ] **Plan admin migration to Sonner**
  - Task: Create migration spec
  - Document: Step-by-step process
  - Estimate: Effort and timeline
  - Files: `admin/MIGRATE_TO_SONNER.md`
  - Estimate: 30 min
  - Acceptance: Clear migration path documented

- [ ] **Migrate admin to Sonner (future)**
  - Task: Implement Sonner in admin
  - Replace: Radix Toast with Sonner
  - Save: ~12.5 KB bundle size
  - Files: Multiple admin files
  - Estimate: 2 hours (not in this sprint)
  - Acceptance: Admin works identically, bundle smaller

---

## 🟢 LOW Priority - Nice to Have (2-3 hours)

### Phase 11: Advanced Features

- [ ] **Implement toast.promise() for async operations**
  - Task: Add examples and helper function
  - Pattern: Loading → Success/Error
  - Files: `lib/toast-utils.ts`, examples
  - Estimate: 1 hour
  - Acceptance: Examples work, pattern documented

- [ ] **Add custom error handler utility**
  - Task: Create `lib/error-handlers.ts`
  - Function: `handleAsyncError(error, defaultMsg)`
  - Function: `handleNetworkError(error)`
  - Function: `handleValidationError(errors)`
  - Files: `lib/error-handlers.ts` (new)
  - Estimate: 1 hour
  - Acceptance: Utilities are type-safe and reusable

- [ ] **Create Storybook stories for toasts**
  - Task: Add toast stories for documentation
  - Stories: Success, error, warning, info, loading
  - Files: `stories/toast.stories.tsx`
  - Estimate: 1 hour
  - Acceptance: Stories render without errors

---

## ✅ Completed Tasks

- [x] Create message files (types.ts, ar.ts, index.ts)
- [x] Install Sonner package
- [x] Create ToastProvider component
- [x] Integrate into root layout via Providers
- [x] Replace hardcoded error messages in 12 files
- [x] Verify TypeScript compilation
- [x] Verify build succeeds
- [x] Code review & gap analysis

---

## 📋 Definitions

### CRITICAL 🔴
Must be done before code goes to production. Affects core functionality or user experience critically. ~4-5 hours work.

### HIGH 🟠
Should be done before v1 release. Affects polish, accessibility, performance. ~4-5 hours work.

### MEDIUM 🟡
Should be done next sprint. Affects testing and completeness. ~3-4 hours work.

### LOW 🟢
Nice to have. Affects developer experience and advanced use cases. ~2-3 hours work.

---

## 🎯 Success Criteria

### For "Ready to Push"
- [ ] All 🔴 CRITICAL tasks completed
- [ ] TypeScript: `pnpm tsc --noEmit` = 0 errors
- [ ] Build: `pnpm build` succeeds
- [ ] Manual testing: All 8 form flows tested and working
- [ ] Toast feedback: Success and error toasts appear correctly
- [ ] No console errors in dev tools
- [ ] No WCAG violations (accessibility)
- [ ] Code review sign-off obtained

### For "v1 Release Quality"
- [ ] All 🔴 CRITICAL + 🟠 HIGH tasks completed
- [ ] Full test suite passing
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Admin migration planned (for v1.1)

---

## 📅 Timeline Estimate

| Phase | Hours | Days | Status |
|-------|-------|------|--------|
| Core Implementation (Done) | 4 | 1 | ✅ |
| 🔴 CRITICAL Tasks | 4.5 | 0.5 | ⏳ |
| 🟠 HIGH Tasks | 4.5 | 0.5 | ⏳ |
| 🟡 MEDIUM Tasks (Testing) | 3 | 0.5 | ⏳ |
| 🟢 LOW Tasks | 3 | 0.5 | ⏳ |
| **TOTAL** | **~19.5** | **~3.5 days** | |

**Recommendation:** Block 4 hours this week for CRITICAL tasks, then schedule rest for next sprint.

---

## 👥 Assignment Suggestions

| Task Group | Suggested Owner | Effort |
|------------|-----------------|--------|
| CRITICAL (Config + Hooks) | Developer A | 2 hours |
| CRITICAL (Success Toasts) | Developer A or B | 1 hour |
| CRITICAL (Error Types) | Developer B | 1 hour |
| HIGH (Validation + Styling) | Designer/Developer B | 2.5 hours |
| HIGH (Documentation) | Tech Writer or Dev A | 1 hour |
| HIGH (Accessibility) | Accessibility Specialist | 1 hour |
| MEDIUM (Testing) | QA + Developer A | 3 hours |
| LOW (Advanced) | Developer B | 2-3 hours |

---

## 📝 Notes

- All file paths relative to `console/` directory
- No breaking changes planned
- TypeScript strict mode maintained throughout
- All changes follow CLAUDE.md project guidelines
- RTL (Arabic) support is mandatory for all changes
- Accessibility (WCAG AA) is required before ship

---

## 🔗 Related Documents

- Code Review: `CODE_REVIEW_TOAST_SYSTEM.md`
- Project Instructions: `../../CLAUDE.md`
- Architecture Docs: `../../documents/`

---

**Last Updated By:** Claude  
**Last Review:** 2026-04-08  
**Next Review:** After CRITICAL tasks complete
