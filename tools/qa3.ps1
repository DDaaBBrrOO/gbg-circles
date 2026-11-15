# Финальный прогон: вкладки, «свайп → сразу тап», «назад», диалог серии.
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

& $adb shell input keyevent KEYCODE_WAKEUP | Out-Null
& $adb shell wm dismiss-keyguard | Out-Null
Connect-Cdp | Out-Null
Tap 155 2185

Write-Output "== «СВАЙП → СРАЗУ ТАП» (главная → круг свайпом, затем тап по вкладке) =="
Tap 405 2185
Start-Sleep -Milliseconds 300
& $adb shell input swipe 820 1750 300 1755 280 | Out-Null
Start-Sleep -Milliseconds 150
& $adb shell input tap 660 2185 | Out-Null
Start-Sleep -Milliseconds 700
Write-Output ("  после свайпа сразу тап «Гриф»: tab={0} (ожидание neck)" -f (St).tab)

Write-Output "== КНОПКА НАЗАД =="
Tap 405 2185
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 900
Write-Output ("  круг -> {0}" -f (St).tab)
Tap 660 2185
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 900
Write-Output ("  гриф -> {0}" -f (St).tab)
Tap 640 700
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 900
Write-Output ("  теория -> {0}" -f (St).tab)
Tap 915 2185
Start-Sleep -Milliseconds 600
Tap 540 1800
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 900
$s = St
Write-Output ("  серия (старт={0}) назад: confirm={1} tab={2}" -f $s.trainStarted, $s.confirmTrain, $s.tab)
Tap 540 1727
$s = St
Write-Output ("  «Прервать» -> tab={0}" -f $s.tab)

Write-Output "== ГЛАВНАЯ: назад дважды =="
Tap 155 2185
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 700
& $adb shell input keyevent KEYCODE_BACK | Out-Null; Start-Sleep -Milliseconds 1200
& $adb shell am start -n "ru.lad.app.debug/ru.lad.app.MainActivity" | Out-Null
Start-Sleep -Milliseconds 1500
Connect-Cdp | Out-Null
Write-Output ("  приложение после двойного «назад»: tab={0} (ожидание home)" -f (St).tab)
