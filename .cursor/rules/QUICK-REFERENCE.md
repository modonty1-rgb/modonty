# 🚀 Quick Reference: Cursor Rules Enforcement

## ✅ Your Rules Are Already Active!

All rules are configured with `alwaysApply: true` and work automatically.

---

## 📍 Rule File Locations

```
MODONTY/
├── .cursorrules                    ← Always active (monorepo rules)
└── .cursor/rules/
    ├── best-practices.mdc         ← Always active (SOLID, KISS, DRY)
    ├── best-practices.yaml        ← Always active (enforcement)
    ├── ENFORCEMENT-GUIDE.md       ← This guide
    └── QUICK-REFERENCE.md         ← Quick tips
```

---

## 🎯 Force Rule Application (If Needed)

### Method 1: Use @ Mentions
```
@best-practices.mdc Create a component for the dashboard
```

### Method 2: Explicit Reminder
```
Remember: SOLID, KISS, DRY, route-based structure
[your request]
```

### Method 3: Reference Rules
```
Follow all rules in .cursor/rules/ when implementing this
[your request]
```

---

## 🔄 Refresh Rules (If Not Working)

1. **Restart Cursor** (Close & Reopen)
2. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **New Chat**: Start fresh chat to reload rules

---

## ✅ Quick Test

Ask Cursor:
```
What are the current coding standards?
```

**Expected Answer:** Should mention SOLID, KISS, DRY, route-based structure, no hardcoded colors, etc.

---

## 📋 Key Rules Summary

- ✅ **Route-based structure**: `app/[route]/components|actions|helpers/` for route-specific, `app/components|actions|helpers/` for shared
- ✅ **SOLID Principles**: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- ✅ **KISS**: Keep it simple, avoid over-engineering
- ✅ **DRY**: Don't repeat yourself, extract common code
- ✅ **No hardcoded colors**: Use theme tokens only
- ✅ **Component limits**: Max 200 lines, max 5 functions
- ✅ **Focus on task only**: Never modify unrelated code

---

## 🆘 Troubleshooting

**Rules not working?**
1. Check file locations (see above)
2. Verify `alwaysApply: true` in rule files
3. Restart Cursor
4. Use `@best-practices.mdc` in prompt

**Need more help?**
→ See `ENFORCEMENT-GUIDE.md` for detailed steps

---

**Your rules are active! They work automatically on every chat.** ✅
