# ==========================================================================
#  Stop ONLY this repository's Next dev servers.
#
#  Written after a near miss on 27 Aug 2026. `taskkill /f /im node.exe` — what
#  free-resources.bat used to imply — would have killed all sixteen node
#  processes on this machine. Two were ours (a 6,280 MB modonty dev server and
#  a 134 MB sibling). The other fourteen were:
#
#    • Claude's MCP servers   (playwright, context7, mcp/server.mjs)
#    • Codex's runtimes       (the console mobile app, built in another window)
#
#  Reclaiming 6 GB is not worth ending someone else's session. Match the command
#  line, not the image name.
#
#  Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\stop-dev-servers.ps1
#          ... -WhatIf   → list what would be stopped, kill nothing
# ==========================================================================
param([switch]$WhatIf)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$repo = Split-Path -Parent $PSScriptRoot

# Everything we must never touch, by what its command line contains.
$spare = @("@playwright", "context7", "mcp/server.mjs", "mcp\server.mjs", "codex", "OpenAI")

$all = Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue
$mine = @()

foreach ($p in $all) {
  $cmd = $p.CommandLine
  if (-not $cmd) { continue }

  # Ours only: the command line points inside this repo…
  if ($cmd -notlike "*$repo*") { continue }
  # …and it is a Next process. `start-server.js` is the one that matters and the one a
  # narrower pattern missed: the two servers holding 6,280 MB and 134 MB both run it,
  # while the small `next/dist/bin` and `.next/dev/build` entries are the CLI wrapper and
  # the build worker. A dry run that reported "29 MB" while 6.2 GB stayed up is how that
  # gap showed itself.
  if ($cmd -notmatch "next[\\/]dist[\\/]server[\\/]lib[\\/]start-server|next[\\/]dist[\\/]bin|\.next[\\/]dev[\\/]build|next-server|next dev") { continue }
  # …and it is not something we agreed to spare.
  $skip = $false
  foreach ($s in $spare) { if ($cmd -like "*$s*") { $skip = $true } }
  if ($skip) { continue }

  $mine += $p
}

if ($mine.Count -eq 0) {
  Write-Host "      لا سيرفر تطوير لهذا المستودع شغّال." -ForegroundColor DarkGray
  Write-Host ("      (تُركت {0} عملية node أخرى — MCP وكوديكس — كما هي)" -f $all.Count) -ForegroundColor DarkGray
  exit 0
}

$total = 0
foreach ($p in $mine) {
  $proc = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
  $mb = if ($proc) { [int]($proc.WS / 1MB) } else { 0 }
  $total += $mb
  $label = "{0,-7} {1,6} MB" -f $p.ProcessId, $mb

  if ($WhatIf) {
    Write-Host "      [ ] $label" -ForegroundColor DarkGray
  } else {
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
      Write-Host "      [x] $label" -ForegroundColor Green
    } catch {
      Write-Host "      [!] $label — $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

$spared = $all.Count - $mine.Count
Write-Host ("      {0} أُوقفت · {1} MB" -f $mine.Count, $total) -ForegroundColor Green
Write-Host ("      {0} عملية node تُركت (MCP · كوديكس · أدوات أخرى)" -f $spared) -ForegroundColor DarkGray
