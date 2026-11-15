# Проверка правок: гриф (ноты/аппликатура), прокрутка по чипам, интервал.
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
function Tap($x, $y, $ms = 900) { & $adb shell input tap $x $y | Out-Null; Start-Sleep -Milliseconds $ms }
function Swipe($a, $b, $c, $d, $ms = 280) { & $adb shell input swipe $a $b $c $d $ms | Out-Null; Start-Sleep -Milliseconds 900 }

& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
& $adb shell wm dismiss-keyguard | Out-Null
& $adb shell am start -n "ru.lad.app.debug/ru.lad.app.MainActivity" | Out-Null
Start-Sleep -Seconds 3
Connect-Cdp | Out-Null

Write-Output "== ГРИФ: свайп в режиме «Ноты» =="
Tap 660 2185
Tap 300 410
$a = St
Swipe 780 1000 320 1005
$b = St
Swipe 320 1000 780 1005
$c = St
Write-Output ("  naturalsOnly: {0} -> {1} -> {2}" -f $a.neckLabels, $b.natural, $c.natural)

Write-Output "== ГРИФ: свайп до «Аппликатуры» (режим «Аккорд») =="
Tap 540 410
$seq = @()
$seq += (St).neckLabels
foreach ($i in 1..4) { Swipe 780 1200 320 1205; $seq += (St).neckLabels }
Write-Output ("  " + ($seq -join " -> "))

Write-Output "== ПРОКРУТКА от ряда чипов (круг, аккорды) =="
Tap 405 2185
Tap 440 505
$s0 = (St).scroll
Swipe 540 1785 540 1100 300
$s1 = (St).scroll
Swipe 540 1500 540 2150 300
$s2 = (St).scroll
Write-Output ("  scroll: {0} -> {1} -> {2}" -f $s0, $s1, $s2)

Write-Output "== ГОРИЗОНТАЛЬНЫЙ свайп по ряду чипов не меняет режим =="
$m0 = (St).mode
Swipe 900 1610 200 1615 300
$m1 = (St).mode
Write-Output ("  mode: {0} -> {1} (ожидание: без изменений)" -f $m0, $m1)
