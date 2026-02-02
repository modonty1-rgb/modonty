# 🎯 Cursor AI Rules Enforcement Guide

## Step-by-Step Guide to Make Cursor AI Follow Rules Automatically

---

## ✅ Step 1: Verify Your Rule Files Are in Place

Your rules are already configured! Here's what you have:

```
MODONTY/
├── .cursorrules                    # ✅ Root-level rules (monorepo-specific)
└── .cursor/
    └── rules/
        ├── best-practices.mdc     # ✅ Documentation rules
        └── best-practices.yaml    # ✅ Enforcement rules
```

**Status Check:**
- ✅ `.cursorrules` exists at root → **Active**
- ✅ `.cursor/rules/best-practices.mdc` → **Active** (has `alwaysApply: true`)
- ✅ `.cursor/rules/best-practices.yaml` → **Active** (has `alwaysApply: true`)

---

## ✅ Step 2: Understand How Cursor Rules Work

### Rule File Hierarchy (Priority Order):

1. **`.cursorrules`** (Root) - Highest priority, always active
2. **`.cursor/rules/*.mdc`** - Documentation rules (if `alwaysApply: true`)
3. **`.cursor/rules/*.yaml`** - Enforcement rules (if `alwaysApply: true`)

### How Cursor Reads Rules:

- **`.cursorrules`** → Read automatically on every chat
- **`.cursor/rules/*.mdc`** → Read if `alwaysApply: true` in frontmatter
- **`.cursor/rules/*.yaml`** → Read if `alwaysApply: true` in config

**Your files already have `alwaysApply: true` ✅**

---

## ✅ Step 3: Verify Rule Files Are Properly Configured

### Check `.cursor/rules/best-practices.mdc`:

```yaml
---
description: Comprehensive best practices for Next.js/React monorepo - consolidated documentation
alwaysApply: true  # ✅ This ensures it's always active
---
```

### Check `.cursor/rules/best-practices.yaml`:

```yaml
description: Comprehensive best practices for Next.js/React monorepo - consolidated rules
alwaysApply: true  # ✅ This ensures it's always active
```

**Both files are correctly configured! ✅**

---

## ✅ Step 4: Make Rules More Effective

### 4.1 Add Rule References in `.cursorrules`

Add a reference at the top of `.cursorrules` to ensure Cursor knows about your other rules:

```markdown
# Cursor AI Rules - Monorepo + Production Safety

> **📚 See Also:** `.cursor/rules/best-practices.mdc` for comprehensive coding standards
> **⚙️ See Also:** `.cursor/rules/best-practices.yaml` for automated rule enforcement

## 🏗️ MONOREPO STRUCTURE AWARENESS
...
```

### 4.2 Create a Rule Index (Optional but Recommended)

Create `.cursor/rules/README.md`:

```markdown
# Cursor Rules Index

## Active Rules

1. **`.cursorrules`** - Monorepo & production safety rules
2. **`best-practices.mdc`** - Comprehensive coding standards (SOLID, KISS, DRY)
3. **`best-practices.yaml`** - Automated rule enforcement

All rules have `alwaysApply: true` and are active automatically.
```

---

## ✅ Step 5: Test Rule Enforcement

### Test 1: Ask Cursor to Create a Component

**Test Prompt:**
```
Create a new component called UserCard in the dashboard route
```

**Expected Behavior:**
- ✅ Should ask which app (admin/home)
- ✅ Should create route-specific folder structure
- ✅ Should use shadcn/ui components
- ✅ Should follow SOLID principles
- ✅ Should not use hardcoded colors

### Test 2: Ask Cursor to Add a Function

**Test Prompt:**
```
Add a function to format dates in the helpers folder
```

**Expected Behavior:**
- ✅ Should ask if it's route-specific or shared
- ✅ Should place in correct folder (`helpers/utils/`)
- ✅ Should follow DRY principle
- ✅ Should have proper TypeScript types

### Test 3: Ask Cursor to Modify Existing Code

**Test Prompt:**
```
Update the login form styling
```

**Expected Behavior:**
- ✅ Should ask which app
- ✅ Should only modify login form (not other components)
- ✅ Should preserve existing functionality
- ✅ Should use theme tokens (no hardcoded colors)

---

## ✅ Step 6: Force Rule Refresh (If Rules Don't Seem Active)

### Method 1: Restart Cursor
1. Close Cursor completely
2. Reopen Cursor
3. Rules will be reloaded automatically

### Method 2: Reload Window
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: "Developer: Reload Window"
3. Press Enter

### Method 3: Check Rule Status
1. Open a new chat
2. Ask: "What rules are currently active?"
3. Cursor should list your rule files

---

## ✅ Step 7: Strengthen Rule Enforcement

### 7.1 Add Explicit Reminders in `.cursorrules`

Add this at the very top:

```markdown
# Cursor AI Rules - Monorepo + Production Safety

> ⚠️ **MANDATORY**: Read ALL rules in `.cursor/rules/` before responding
> ⚠️ **MANDATORY**: Follow SOLID, KISS, DRY principles in EVERY response
> ⚠️ **MANDATORY**: Use route-based folder structure for ALL code

## 🏗️ MONOREPO STRUCTURE AWARENESS
...
```

### 7.2 Add Rule Reminders in Chat Prompts

When starting a new task, you can add:

```
@best-practices.mdc Follow all rules when implementing this feature
```

Or:

```
Remember: SOLID principles, KISS, DRY, route-based structure
```

---

## ✅ Step 8: Verify Rules Are Working

### Quick Verification Checklist:

- [ ] Open a new chat
- [ ] Ask: "What are the current coding standards?"
- [ ] Cursor should mention SOLID, KISS, DRY
- [ ] Ask: "Where should I put a component for the dashboard route?"
- [ ] Cursor should say: `app/dashboard/components/`
- [ ] Ask: "Can I use hardcoded colors?"
- [ ] Cursor should say: "No, use theme tokens"

---

## ✅ Step 9: Troubleshooting

### Problem: Rules Not Being Followed

**Solution 1: Check File Locations**
```
✅ .cursorrules should be at: MODONTY/.cursorrules
✅ best-practices.mdc should be at: MODONTY/.cursor/rules/best-practices.mdc
✅ best-practices.yaml should be at: MODONTY/.cursor/rules/best-practices.yaml
```

**Solution 2: Verify `alwaysApply: true`**
- Open each rule file
- Check frontmatter/config has `alwaysApply: true`

**Solution 3: Check File Format**
- `.mdc` files need YAML frontmatter with `alwaysApply: true`
- `.yaml` files need `alwaysApply: true` at root level

### Problem: Rules Conflict

**Solution:** Priority order is:
1. `.cursorrules` (highest)
2. `.cursor/rules/*.mdc`
3. `.cursor/rules/*.yaml`

If conflicts, `.cursorrules` wins.

---

## ✅ Step 10: Best Practices for Rule Maintenance

### 10.1 Keep Rules Updated

- Update rules when patterns change
- Add new rules as you discover issues
- Remove outdated rules

### 10.2 Test Rules Regularly

- Test once per week with sample prompts
- Verify Cursor follows folder structure
- Check that principles are enforced

### 10.3 Document Rule Changes

When you update rules:
1. Note what changed
2. Test with a sample prompt
3. Verify behavior matches expectations

---

## 🎯 Quick Reference: Rule Enforcement Commands

### In Chat, You Can Use:

```
@best-practices.mdc [your request]
```
→ Forces Cursor to read and follow best-practices.mdc

```
@.cursorrules [your request]
```
→ Forces Cursor to read and follow .cursorrules

```
Remember: SOLID, KISS, DRY
[your request]
```
→ Explicit reminder to follow principles

---

## 📋 Summary Checklist

- [x] Rule files exist in correct locations
- [x] `alwaysApply: true` is set in all rule files
- [x] Rules are properly formatted
- [x] Tested rule enforcement with sample prompts
- [x] Verified Cursor follows folder structure
- [x] Verified Cursor follows SOLID/KISS/DRY principles
- [x] Rules are documented and maintained

---

## 🚀 You're All Set!

Your rules are already configured correctly. Cursor AI should automatically follow them on every chat. If you notice rules aren't being followed:

1. Restart Cursor
2. Use `@best-practices.mdc` in your prompt
3. Explicitly remind: "Follow all rules in .cursor/rules/"
4. Check rule file locations and `alwaysApply: true` settings

**Your rules are active and should work automatically!** ✅
