# Локальная проверка на компьютере: поднимает сервер и открывает витрину с живыми телефонами.
#   tools/dev.ps1                 — витрина index.html в обычном окне
#   tools/dev.ps1 -App            — только приложение, окно 430×900
#   tools/dev.ps1 -App -Theme night -Screen circle
param(
  [switch]$App,
  [string]$Theme = "",
  [string]$Screen = "",
  [int]$Port = 5180
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }

$listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  Start-Process -FilePath "node" -ArgumentList @("`"$root\tools\serve.mjs`"", $Port) -WorkingDirectory $root -WindowStyle Minimized
  Start-Sleep -Milliseconds 800
}

$query = @()
if ($Theme) { $query += "theme=$Theme" }
if ($Screen) { $query += "screen=$Screen" }
$qs = if ($query.Count) { "?" + ($query -join "&") } else { "" }
$profile = Join-Path $env:TEMP "lad-chrome"

if ($App) {
  $url = "http://127.0.0.1:$Port/app.html$qs"
  & $chrome "--app=$url" --window-size=430,900 --window-position=80,40 "--user-data-dir=$profile" --no-first-run --no-default-browser-check 2>$null
} else {
  $url = "http://127.0.0.1:$Port/index.html$qs"
  & $chrome "--app=$url" --window-size=1500,960 --window-position=40,20 "--user-data-dir=$profile" --no-first-run --no-default-browser-check 2>$null
}

Write-Host "Открыто: $url"
Write-Host "Приложение напрямую: http://127.0.0.1:$Port/app.html$qs"
