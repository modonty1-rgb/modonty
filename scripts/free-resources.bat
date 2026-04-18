@echo off
title MODONTY — Free Resources
color 0A
echo.
echo  ==========================================
echo   MODONTY Dev — Resource Cleanup
echo  ==========================================

:: ── RAM before ─────────────────────────────
for /f "tokens=2 delims==" %%A in ('wmic OS get FreePhysicalMemory /value 2^>nul') do set FREE_BEFORE=%%A
for /f "tokens=2 delims==" %%A in ('wmic OS get TotalVisibleMemorySize /value 2^>nul') do set TOTAL=%%A
set /a USED_BEFORE=(%TOTAL% - %FREE_BEFORE%) / 1024
echo.
echo  RAM before: %USED_BEFORE% MB used
echo  ──────────────────────────────────────────

:: ── Kill list ──────────────────────────────
echo.
echo  Cleaning...
echo.

:: Messaging / social
taskkill /f /im WhatsApp.exe        >nul 2>&1 && echo  [x] WhatsApp
taskkill /f /im Telegram.exe        >nul 2>&1 && echo  [x] Telegram desktop
taskkill /f /im Discord.exe         >nul 2>&1 && echo  [x] Discord
taskkill /f /im Slack.exe           >nul 2>&1 && echo  [x] Slack

:: Office / productivity
taskkill /f /im OUTLOOK.EXE         >nul 2>&1 && echo  [x] Outlook
taskkill /f /im WINWORD.EXE         >nul 2>&1 && echo  [x] Word
taskkill /f /im EXCEL.EXE           >nul 2>&1 && echo  [x] Excel
taskkill /f /im POWERPNT.EXE        >nul 2>&1 && echo  [x] PowerPoint
taskkill /f /im ms-teams.exe        >nul 2>&1 && echo  [x] Teams (old)
taskkill /f /im Teams.exe           >nul 2>&1 && echo  [x] Teams
taskkill /f /im msedgewebview2.exe  >nul 2>&1 && echo  [x] Edge WebView2

:: Media / entertainment
taskkill /f /im Spotify.exe         >nul 2>&1 && echo  [x] Spotify
taskkill /f /im vlc.exe             >nul 2>&1 && echo  [x] VLC

:: Dev tools not needed
taskkill /f /im python.exe          >nul 2>&1 && echo  [x] Python
taskkill /f /im python3.exe         >nul 2>&1 && echo  [x] Python3

:: Sync / cloud (heavy background)
taskkill /f /im OneDrive.exe        >nul 2>&1 && echo  [x] OneDrive
taskkill /f /im GoogleDriveFS.exe   >nul 2>&1 && echo  [x] Google Drive
taskkill /f /im Dropbox.exe         >nul 2>&1 && echo  [x] Dropbox

:: ── KEEP (do NOT kill) ─────────────────────
:: Wispr Flow.exe     → voice input, keep
:: Cursor.exe         → IDE, keep
:: Code.exe           → VS Code, keep
:: node.exe           → dev servers, keep
:: chrome.exe         → browser testing, keep
:: msedge.exe         → browser testing, keep
:: WindowsTerminal.exe → terminal, keep
:: bash.exe / git.exe → shell, keep

:: ── RAM after ──────────────────────────────
for /f "tokens=2 delims==" %%A in ('wmic OS get FreePhysicalMemory /value 2^>nul') do set FREE_AFTER=%%A
set /a USED_AFTER=(%TOTAL% - %FREE_AFTER%) / 1024
set /a FREED=(%FREE_AFTER% - %FREE_BEFORE%) / 1024

echo.
echo  ──────────────────────────────────────────
echo  RAM after:  %USED_AFTER% MB used
echo  Freed:      %FREED% MB released
echo  ==========================================
echo.
echo  Ready for dev. Wispr Flow is still running.
echo.
pause
