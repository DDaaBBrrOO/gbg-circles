# QA v2: вкладки, сегменты, свайпы по зонам, «назад», прокрутка.
param([int]$Port = 9333)

$adb = "C:\projects\chords\.toolchain\sdk\platform-tools\adb.exe"
$node = "node"
$root = "C:\projects\chords"

function Connect-Cdp {
  $sock = (& $adb shell "cat /proc/net/unix | grep webview_devtools") -join ""
  if (-not $sock) { Write-Output "  ! WebView не найден"; return $false }
  $name = ($sock -split "webview_devtools_remote_")[1].Trim()
  & $adb forward --remove-all | Out-Null
  & $adb forward "tcp:$Port" "localabstract:webview_devtools_remote_$name" | Out-Null
  Start-Sleep -Milliseconds 700
  return $true
}
function State {
  $json = & $node "$root\tools\cdp.mjs" "JSON.stringify(window.__lad())" $Port 2>$null
  if (-not $json) { return $null }
  return $json | ConvertFrom-Json
}
function Tap($x, $y) { & $adb shell input tap $x $y | Out-Null; Start-Sleep -Milliseconds 800 }
function Swipe($x1, $y1, $x2, $y2, $ms) { & $adb shell input swipe $x1 $y1 $x2 $y2 $ms | Out-Null; Start-Sleep -Milliseconds 900 }
function Back { & $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 1000 }

& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
Start-Sleep -Milliseconds 600
& $adb shell wm dismiss-keyguard | Out-Null
& $adb shell am start -n "ru.lad.app.debug/ru.lad.app.MainActivity" | Out-Null
Start-Sleep -Seconds 3
if (-not (Connect-Cdp)) { exit 1 }

# координаты (1080x2340, плотность 2.8125, WebView начинается с y=97)
$TAB = @{ home = 155; circle = 405; neck = 660; train = 915; y = 2185 }
$SEG = @{ interval = 200; chord = 440; scale = 630; y = 505 }

Write-Output "== 1. ВКЛАДКИ (12 переключений) =="
$fail = 0
foreach ($i in 1..3) {
  foreach ($t in @("circle", "neck", "train", "home")) {
    Tap $TAB[$t] $TAB.y
    $s = State
    if (-not $s -or $s.tab -ne $t) { $fail++; Write-Output ("  FAIL {0} -> {1}" -f $t, $s.tab) }
  }
}
Write-Output ("  промахов: {0} из 12" -f $fail)

Write-Output "== 2. СЕГМЕНТЫ КРУГА (тап по чипу) =="
Tap $TAB.circle $TAB.y
foreach ($m in @("interval", "chord", "scale", "interval")) {
  Tap $SEG[$m] $SEG.y
  $s = State
  $ok = if ($s.mode -eq $m) { "OK" } else { "FAIL" }
  Write-Output ("  {0,-9} -> mode={1,-9} {2}" -f $m, $s.mode, $ok)
}

Write-Output "== 3. СВАЙП ВЛЕВО по зонам (из «Интервалов») =="
foreach ($z in @(
  @{ name = "заголовок"; y = 300 },
  @{ name = "колесо"; y = 900 },
  @{ name = "подсказка"; y = 1270 },
  @{ name = "контролы"; y = 1750 }
)) {
  Tap $SEG.interval $SEG.y
  $r0 = (State).root
  Swipe 820 $z.y 300 ($z.y + 5) 300
  $s = State
  Write-Output ("  {0,-12}: mode={1,-9} root={2} (было {3})" -f $z.name, $s.mode, $s.root, $r0)
}

Write-Output "== 4. СВАЙП ВПРАВО по зонам (из «Гамм») =="
foreach ($z in @(
  @{ name = "заголовок"; y = 300 },
  @{ name = "контролы"; y = 1750 }
)) {
  Tap $SEG.scale $SEG.y
  Swipe 300 $z.y 820 ($z.y + 5) 300
  $s = State
  Write-Output ("  {0,-12}: mode={1}" -f $z.name, $s.mode)
}

Write-Output "== 5. ПРОКРУТКА (главная) =="
Tap $TAB.home $TAB.y
$s0 = (State).scroll
Swipe 540 1750 540 800 250
$s1 = (State).scroll
Swipe 540 800 540 1750 250
$s2 = (State).scroll
Write-Output ("  {0} -> {1} -> {2}" -f $s0, $s1, $s2)

Write-Output "== 6. КНОПКА НАЗАД =="
Tap $TAB.circle $TAB.y; Back
Write-Output ("  с круга: tab={0}" -f (State).tab)
Tap $TAB.neck $TAB.y; Back
Write-Output ("  с грифа: tab={0}" -f (State).tab)
Tap 640 800; Start-Sleep -Milliseconds 700
$theory = (State).topic
Back
Write-Output ("  из теории (topic={0}) -> tab={1}" -f $theory, (State).tab)
Tap $TAB.home $TAB.y; Back
Write-Output ("  на главной: tab={0} (приложение живо)" -f (State).tab)

Write-Output "== 7. СВАЙП ПО ГРИФУ =="
Tap $TAB.neck $TAB.y
$l = @()
$l += (State).neckLabels
Swipe 780 1350 320 1355 300; $l += (State).neckLabels
Swipe 780 1350 320 1355 300; $l += (State).neckLabels
Write-Output ("  {0}" -f ($l -join " -> "))
