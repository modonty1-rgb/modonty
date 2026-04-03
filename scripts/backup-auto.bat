@echo off
REM ═══════════════════════════════════════════
REM MODONTY Automatic Daily Backup
REM Runs via Windows Task Scheduler
REM ═══════════════════════════════════════════

setlocal enabledelayedexpansion

set "MONGODUMP=C:\Program Files\MongoDB\Tools\100\bin\mongodump.exe"
set "BACKUP_DIR=C:\Users\w2nad\Desktop\dreamToApp\MODONTY\backups"
set "ENV_FILE=C:\Users\w2nad\Desktop\dreamToApp\MODONTY\admin\.env"

REM Generate timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set "DT=%%I"
set "TIMESTAMP=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%"
set "TARGET=%BACKUP_DIR%\auto-%TIMESTAMP%"

REM Read DATABASE_URL from .env
set "URI="
for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
    if "%%a"=="DATABASE_URL" set "URI=%%b"
)

REM Remove quotes from URI
set "URI=!URI:"=!"

if "!URI!"=="" (
    echo %TIMESTAMP% AUTO-BACKUP FAILED: No DATABASE_URL >> "%BACKUP_DIR%\backup-log.txt"
    exit /b 1
)

REM Create backup directory
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Run backup
"%MONGODUMP%" --uri="!URI!" --out="%TARGET%" --quiet

if !ERRORLEVEL!==0 (
    echo %TIMESTAMP% AUTO-BACKUP OK >> "%BACKUP_DIR%\backup-log.txt"
) else (
    echo %TIMESTAMP% AUTO-BACKUP FAILED >> "%BACKUP_DIR%\backup-log.txt"
)

endlocal
