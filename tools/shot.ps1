param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Out,
  [int]$W = 500,
  [int]$H = 996
)
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$tmp = Join-Path $env:TEMP ("chr" + [guid]::NewGuid().ToString("N").Substring(0, 6))
& $chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --force-device-scale-factor=1 `
  --window-size="$W,$H" --user-data-dir=$tmp --virtual-time-budget=6000 `
  --screenshot="$Out" $Url 2>&1 | Out-Null
if (Test-Path $Out) { "ok $Out" } else { "fail $Out" }
