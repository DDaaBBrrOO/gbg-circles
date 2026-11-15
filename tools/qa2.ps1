# Фокус-прогон: свайпы по зонам и прокрутка, с записью источника жеста.
param([int]$Port = 9333)
$adb = "C:\projects\chords\.toolchain\sdk\platform-tools\adb.exe"
$root = "C:\projects\chords"

function Connect-Cdp {
  $sock = (& $adb shell "cat /proc/net/unix | grep webview_devtools") -join ""
  if (-not $sock) { return $false }
  $name = ($sock -split "webview_devtools_remote_")[1].Trim()
  & $adb forward --remove-all | Out-Null
  & $adb forward "tcp:$Port" "localabstract:webview_devtools_remote_$name" | Out-Null
  Start-Sleep -Milliseconds 700
  return $true
}
function St { (& node "$root\tools\cdp.mjs" "JSON.stringify(window.__lad())" $Port 2>$null) | ConvertFrom-Json }
function Last { & node "$root\tools\cdp.mjs" "document.body.dataset.lastSwipe || '-'" $Port 2>$null }
function SetLast { & node "$root\tools\cdp.mjs" "document.body.dataset.lastSwipe='-';1" $Port | Out-Null }
function Tap($x, $y) { & $adb shell input tap $x $y | Out-Null; Start-Sleep -Milliseconds 900 }
function Swipe($a, $b, $c, $d, $ms) { & $adb shell input swipe $a $b $c $d $ms | Out-Null; Start-Sleep -Milliseconds 900 }

& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
& $adb shell wm dismiss-keyguard | Out-Null
Connect-Cdp | Out-Null
Tap 405 2185

Write-Output "== СВАЙП ВЛЕВО по зонам (перед каждым — режим «Интервалы») =="
foreach ($z in @(
  @{ n = "заголовок"; y = 300 },
  @{ n = "колесо"; y = 900 },
  @{ n = "подсказка"; y = 1550 },
  @{ n = "контролы"; y = 1750 }
)) {
  Tap 200 505
  $a = St
  SetLast
  Swipe 820 $z.y 300 ($z.y + 5) 300
  $b = St
  Write-Output ("  {0,-11}: {1}/{2} -> {3}/{4}  жест={5}" -f $z.n, $a.mode, $a.root, $b.mode, $b.root, (Last))
}

Write-Output "== СВАЙП ВПРАВО по зонам (перед каждым — «Гаммы») =="
foreach ($z in @(
  @{ n = "заголовок"; y = 300 },
  @{ n = "контролы"; y = 1750 }
)) {
  Tap 630 505
  $a = St
  SetLast
  Swipe 300 $z.y 820 ($z.y + 5) 300
  $b = St
  Write-Output ("  {0,-11}: {1} -> {2}  жест={3}" -f $z.n, $a.mode, $b.mode, (Last))
}

Write-Output "== ПРОКРУТКА: вниз, вверх, вниз, вверх =="
Tap 155 2185
foreach ($i in 1..2) {
  $s0 = (St).scroll
  Swipe 540 1750 540 850 260
  $s1 = (St).scroll
  Swipe 540 900 540 1800 260
  $s2 = (St).scroll
  Write-Output ("  цикл {0}: {1} -> {2} -> {3}" -f $i, $s0, $s1, $s2)
}

Write-Output "== ГРИФ: свайп подписей (режим «Аккорд») =="
Tap 660 2185
Tap 540 410
$l = @()
$l += (St).neckLabels
Swipe 780 1350 320 1355 280; $l += (St).neckLabels
Swipe 780 1350 320 1355 280; $l += (St).neckLabels
Swipe 320 1350 780 1355 280; $l += (St).neckLabels
Write-Output ("  " + ($l -join " -> "))
