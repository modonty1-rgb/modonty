# Categories UI/UX — TODO

> آخر تحديث: 2026-04-04
> المرجع: documents/07-design-ui/frontend-master-SKILL.md

---

## مهام معلقة

(لا يوجد)

---

## مهام منتهية

### RTL
- [x] category-form.tsx:64 — `mr-auto` → `ms-auto`
- [x] category-form.tsx:80 — `ml-1` → `ms-1`
- [x] page.tsx:26 — `mr-2` → `me-2`
- [x] delete-category-button.tsx — `mr-2` → `me-2`

### Accessibility
- [x] category-row-actions.tsx — icon buttons: `title` → `aria-label`
- [x] category-table.tsx — row click `window.location.href` → `useRouter().push()`

### UX
- [x] category-table.tsx — date format `format()` → `Intl.DateTimeFormat`
- [x] category-table.tsx — removed unused `date-fns` import
- [x] delete-category-button.tsx — `Dialog` → `AlertDialog` (توحيد مع row actions)
