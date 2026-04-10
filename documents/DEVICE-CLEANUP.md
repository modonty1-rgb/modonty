# تنظيف الجهاز — خطوات تخفيف الميموري

> استخدم هذا الملف كلما أحسست أن الجهاز ثقيل أثناء التطوير.

---

## الخطوة 1 — إيقاف كل Node processes

في Terminal (bash أو PowerShell):

```powershell
powershell -Command "Get-Process node | Stop-Process -Force; Write-Host 'done'"
```

يحرر ~800 MB إذا كانت متراكمة.

---

## الخطوة 2 — فحص ما يأكل الميموري

```powershell
powershell -Command "Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 15 Name, @{N='MB';E={[math]::Round(\$_.WorkingSet/1MB,0)}} | Format-Table -AutoSize"
```

---

## الخطوة 3 — تشغيل سيرفر واحد فقط

شغّل فقط الـ app اللي تشتغل عليها:

```bash
# modonty فقط
pnpm --filter @modonty/modonty dev > /tmp/modonty-dev.log 2>&1 &

# admin فقط
pnpm --filter @modonty/admin dev > /tmp/admin-dev.log 2>&1 &
```

**لا تشغّل أكثر من سيرفر في نفس الوقت.**

---

## الخطوة 4 — إعادة توصيل Playwright بعد أي إيقاف

1. في الشات اكتب `/mcp`
2. اضغط على **playwright**
3. اضغط **Restart**

---

## ملاحظات مهمة

- **MsMpEng** (Windows Defender) يأكل ~220 MB دائماً — طبيعي، لا تغيره.
- **claude** يأكل ~430 MB — طبيعي، هذا VS Code Extension.
- بعد الريستارت: أعد تشغيل VS Code من جديد عشان يأخذ الـ PATH الصحيح.
- لو Playwright لا يتوصل — اعمل Restart من `/mcp` في الشات.
