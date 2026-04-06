# Toast Messages — Arabic + Centralized + Professional Design

> Goal: All toast messages in Arabic, clear, centralized in one JSON file, professional UI

---

## Plan (Next Version)

### Phase 1: Centralize all messages in one JSON file
- [ ] Create `admin/lib/messages/toast-messages.ts` — all 183+ messages in one file
- [ ] Structure: `section.action.success/error` — e.g. `articles.save.success`
- [ ] Replace all hardcoded strings across 34 files
- [ ] All in Arabic, clear and professional

### Phase 2: Improve toast UI design
- [ ] Add icons (CheckCircle success, XCircle error, AlertTriangle warning)
- [ ] Better colors (green success, red error, amber warning)
- [ ] Consistent timing (success: 3s, error: 5s)

### Phase 3: Make messages clear and helpful
- [ ] Generic "Success"/"Error" → specific action context
- [ ] Add helpful descriptions (what happened, what to do next)
- [ ] Consistent Arabic wording across all sections

---

## Done ✅

_(Move items here as they get fixed)_
