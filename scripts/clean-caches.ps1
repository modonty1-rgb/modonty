# ==========================================================================
#  MODONTY — Cache Cleanup
#
#  Deletes only what a build REGENERATES. Nothing here is source, and nothing
#  here is a dependency: `node_modules` is left alone on purpose, because
#  removing it turns a 30-second rebuild into a 10-minute reinstall.
#
#  Measured 27 Aug 2026: modonty/.next alone was 15,098 MB. Next's dev cache
#  grows without bound across long sessions — it is the single biggest thing
#  this repo leaves on the disk.
#
#  Usage:
#    powershell -NoProfile -ExecutionPolicy Bypass -File scripts\clean-caches.ps1
#    ... -WhatIf     → report sizes, delete nothing
#    ... -Deep       → also drop the pnpm store (next install re-downloads)
# ==========================================================================
param(
  [switch]$WhatIf,
  [switch]$Deep,
  # Set by free-resources.bat, which has already stopped node before calling here.
  # Without it the node check below blocks on Read-Host and the batch file hangs.
  [switch]$Yes
)

$ErrorActionPreference = "Stop"
# The console defaults to the OEM code page, which renders every Arabic line as `?`.
# The file itself is UTF-8 with a BOM — without that, PowerShell 5.1 reads it as ANSI and
# the script does not even parse.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot

function Get-SizeMB {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return -1 }
  $sum = (Get-ChildItem -LiteralPath $Path -Recurse -Force -File -ErrorAction SilentlyContinue |
          Measure-Object -Property Length -Sum).Sum
  if ($null -eq $sum) { return 0 }
  return [int]($sum / 1MB)
}

# A dev server holds open handles inside .next; deleting under it is what leaves
# the corrupt manifests that make Turbopack panic on the next run.
$node = Get-Process node -ErrorAction SilentlyContinue
if ($node) {
  Write-Host ""
  Write-Host " ⚠  $($node.Count) عملية node ما زالت شغّالة." -ForegroundColor Yellow
  Write-Host "    أوقف سيرفرات التطوير أولاً، وإلا بقيت ملفّات مقفلة وانكسر البناء التالي." -ForegroundColor Yellow
  Write-Host "    الإيقاف:  taskkill /F /IM node.exe" -ForegroundColor DarkGray
  if (-not $WhatIf -and -not $Yes) {
    $answer = Read-Host "    أكمل رغم ذلك؟ (y/N)"
    if ($answer -ne "y") { Write-Host " أُلغي." -ForegroundColor DarkGray; exit 1 }
  }
}

$targets = @(
  @{ Name = "modonty/.next";      Path = "modonty\.next";                    Note = "كاش بناء مدونتي" }
  @{ Name = "admin/.next";        Path = "admin\.next";                      Note = "كاش بناء الأدمن" }
  @{ Name = "console/.next";      Path = "console\.next";                    Note = "كاش بناء الكونسول" }
  @{ Name = "console-mobile/.expo"; Path = "console-mobile\.expo";           Note = "كاش إكسبو" }
  @{ Name = ".turbo";             Path = ".turbo";                           Note = "كاش تيربو" }
  @{ Name = "node_modules/.cache";Path = "node_modules\.cache";              Note = "كاش الأدوات" }
  @{ Name = "modonty/node_modules/.cache"; Path = "modonty\node_modules\.cache"; Note = "" }
  @{ Name = "admin/node_modules/.cache";   Path = "admin\node_modules\.cache";   Note = "" }
  @{ Name = "console/node_modules/.cache"; Path = "console\node_modules\.cache"; Note = "" }
)

if ($Deep) {
  $targets += @{ Name = ".pnpm-store"; Path = ".pnpm-store"; Note = "مخزن الحزم — التثبيت التالي يعيد تنزيله" }
}

Write-Host ""
Write-Host " ==========================================" -ForegroundColor Cyan
Write-Host "  MODONTY — تنظيف الكاشات" -ForegroundColor Cyan
Write-Host " ==========================================" -ForegroundColor Cyan
Write-Host ""

$freed = 0
$missing = 0

foreach ($t in $targets) {
  $full = Join-Path $root $t.Path
  $mb = Get-SizeMB -Path $full

  if ($mb -lt 0) { $missing++; continue }

  $label = "{0,-32} {1,8} MB" -f $t.Name, $mb

  if ($WhatIf) {
    Write-Host "  [ ] $label" -ForegroundColor DarkGray
  } else {
    try {
      Remove-Item -LiteralPath $full -Recurse -Force -ErrorAction Stop
      Write-Host "  [x] $label" -ForegroundColor Green
      $freed += $mb
    } catch {
      # A locked file means a process still owns it — say so instead of pretending.
      Write-Host "  [!] $label  — مقفل: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

Write-Host ""
Write-Host " ------------------------------------------"
if ($WhatIf) {
  $total = 0
  foreach ($t in $targets) {
    $mb = Get-SizeMB -Path (Join-Path $root $t.Path)
    if ($mb -gt 0) { $total += $mb }
  }
  Write-Host ("  سيُحرَّر: {0} MB  ({1:N2} GB)" -f $total, ($total / 1024)) -ForegroundColor Yellow
  Write-Host "  (WhatIf — لم يُحذف شيء)" -ForegroundColor DarkGray
} else {
  Write-Host ("  حُرِّر: {0} MB  ({1:N2} GB)" -f $freed, ($freed / 1024)) -ForegroundColor Green
}
if ($missing -gt 0) { Write-Host "  $missing مساراً غير موجود (نظيف أصلاً)" -ForegroundColor DarkGray }
Write-Host " =========================================="
Write-Host ""
Write-Host " البناء التالي أبطأ مرّة واحدة — هذا هو الثمن، ولا شيء ضاع." -ForegroundColor DarkGray
if (-not $Deep) {
  Write-Host " لإسقاط مخزن الحزم أيضاً:  ... -Deep" -ForegroundColor DarkGray
}
Write-Host ""
