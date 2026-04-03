@echo off
echo ═══════════════════════════════════════════
echo   MODONTY - Setup Daily Automatic Backup
echo ═══════════════════════════════════════════
echo.

REM Register daily backup at 3:00 AM
schtasks /create /tn "MODONTY-DailyBackup" /tr "C:\Users\w2nad\Desktop\dreamToApp\MODONTY\scripts\backup-auto.bat" /sc daily /st 03:00 /f

if %ERRORLEVEL%==0 (
    echo.
    echo OK! Daily backup scheduled at 3:00 AM
    echo.
    echo To verify: schtasks /query /tn "MODONTY-DailyBackup"
    echo To remove: schtasks /delete /tn "MODONTY-DailyBackup" /f
    echo To run now: schtasks /run /tn "MODONTY-DailyBackup"
) else (
    echo.
    echo FAILED - Try running this file as Administrator
    echo Right-click -^> Run as administrator
)

echo.
pause
