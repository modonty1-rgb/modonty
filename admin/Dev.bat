@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\.bin\next.cmd" (
  echo Installing the locked project dependencies...
  cd /d "%~dp0.."
  call pnpm install --frozen-lockfile
  if errorlevel 1 exit /b %errorlevel%
  cd /d "%~dp0"
)

pnpm dev  -p 3001
endlocal
