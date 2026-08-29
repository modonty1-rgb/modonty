@echo off
setlocal enabledelayedexpansion
title MODONTY - Free Resources
color 0A
echo.
echo  ==========================================
echo   MODONTY Dev - Resource Cleanup
echo  ==========================================

:: --------------------------------------------------------------------------
::  Flags:
::    (none)      kill idle apps + dev servers, then clear build caches
::    /keepnode   leave dev servers running (skips the cache sweep too --
::                deleting .next under a live server is what corrupts it)
::    /apps       apps only: no node kill, no cache sweep
::
::  Why node is killed by default (it used to be on the KEEP list):
::  measured 27 Aug 2026, ONE node process held 5,915 MB while this script
::  reported "Freed: 25 MB". Sparing the single biggest consumer made the
::  cleanup cosmetic. A dev server is cheap to restart; 6 GB is not.
:: --------------------------------------------------------------------------
set KILLNODE=1
set CLEANCACHE=1
if /i "%~1"=="/keepnode" ( set KILLNODE=0 & set CLEANCACHE=0 )
if /i "%~1"=="/apps"     ( set KILLNODE=0 & set CLEANCACHE=0 )

:: -- RAM before ------------------------------------------------------------
for /f "tokens=2 delims==" %%A in ('wmic OS get FreePhysicalMemory /value 2^>nul') do set FREE_BEFORE=%%A
for /f "tokens=2 delims==" %%A in ('wmic OS get TotalVisibleMemorySize /value 2^>nul') do set TOTAL=%%A
set /a USED_BEFORE=(%TOTAL% - %FREE_BEFORE%) / 1024
echo.
echo  RAM before: %USED_BEFORE% MB used
echo  ------------------------------------------

:: -- Idle apps -------------------------------------------------------------
echo.
echo  Closing idle apps...
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

:: -- KEEP (never killed) ---------------------------------------------------
:: Wispr Flow.exe      -> voice input
:: Cursor.exe / Code.exe -> IDE
:: chrome.exe / msedge.exe -> browser testing
:: WindowsTerminal.exe / bash.exe / git.exe -> shell

:: -- Dev servers -----------------------------------------------------------
::  NEVER `taskkill /im node.exe`. Measured 27 Aug 2026, this machine ran 16 node
::  processes and only two were ours: the 6,280 MB modonty dev server and a 134 MB
::  sibling. The rest were Claude's MCP servers (playwright, context7) and Codex's
::  runtimes — the console mobile app being built in another window. A blanket kill
::  takes down someone else's work to reclaim memory this repo is holding.
::
::  So: match on the command line, and only for THIS repo's Next dev server.
if "%KILLNODE%"=="1" (
  echo.
  echo  Dev servers ^(this repo only^):
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-dev-servers.ps1"
)

:: -- RAM after -------------------------------------------------------------
for /f "tokens=2 delims==" %%A in ('wmic OS get FreePhysicalMemory /value 2^>nul') do set FREE_AFTER=%%A
set /a USED_AFTER=(%TOTAL% - %FREE_AFTER%) / 1024
set /a FREED=(%FREE_AFTER% - %FREE_BEFORE%) / 1024

echo.
echo  ------------------------------------------
echo  RAM after:  %USED_AFTER% MB used
echo  Freed:      %FREED% MB released
echo  ==========================================

:: -- Build caches ----------------------------------------------------------
::  Runs only after node is down: deleting .next under a live dev server is
::  exactly what leaves the half-written manifests that make Turbopack panic
::  with 0xc0000142 / "Failed to write app endpoint" on the next start.
if "%CLEANCACHE%"=="1" (
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0clean-caches.ps1" -Yes
)

echo.
echo  Ready for dev. Wispr Flow is still running.
if "%KILLNODE%"=="1" echo  Dev servers were stopped - start them again when you need them.
if "%CLEANCACHE%"=="1" echo  First build after this is slower once. Nothing was lost.
echo.
pause
