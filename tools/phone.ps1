# Тест на настоящем телефоне по USB: поставить APK и открыть приложение.
#   tools\phone.ps1                    — установить и запустить на подключённом телефоне
#   tools\phone.ps1 -Shot out.png      — ещё и скриншот экрана телефона
#   tools\phone.ps1 -Clean             — снести приложение и поставить заново
#   tools\phone.ps1 -Log               — показать последние строки logcat приложения
param(
  [string]$Shot = "",
  [switch]$Clean,
  [switch]$Log,
  [string]$Apk = ""
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root ".toolchain\sdk\platform-tools\adb.exe"
$pkg = "ru.lad.app.debug"
$activity = "$pkg/ru.lad.app.MainActivity"

if (-not (Test-Path $adb)) { throw "Нет adb в $adb" }
if (-not $Apk) { $Apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk" }
if (-not (Test-Path $Apk)) { throw "Нет APK: соберите его (gradlew assembleDebug) или скачайте из CI" }

& $adb start-server | Out-Null
$lines = & $adb devices -l | Select-Object -Skip 1 | Where-Object { $_ -match "\S" }

if (-not $lines) {
  Write-Host @"
Телефон не виден. Проверьте:
  1) на телефоне включены «Для разработчиков» и «Отладка по USB»;
  2) кабель подключён, в уведомлении выбран режим «Передача файлов»;
  3) на телефоне нажали «Разрешить отладку» для этого компьютера.
"@
  exit 1
}

$unauthorized = $lines | Where-Object { $_ -match "unauthorized" }
if ($unauthorized) {
  Write-Host "Телефон подключён, но не авторизован: разблокируйте экран и нажмите «Разрешить отладку по USB»."
  exit 1
}

$device = ($lines | Select-Object -First 1) -split "\s+" | Select-Object -First 1
$model = (& $adb -s $device shell getprop ro.product.model 2>$null) -join ""
$release = (& $adb -s $device shell getprop ro.build.version.release 2>$null) -join ""
Write-Host "Телефон: $($model.Trim()) · Android $($release.Trim()) · $device"

if ($Clean) {
  Write-Host "Удаляю старую версию…"
  & $adb -s $device uninstall $pkg | Out-Null
}

Write-Host "Ставлю APK…"
$out = & $adb -s $device install -r $Apk 2>&1
if ($LASTEXITCODE -ne 0) {
  # подпись поменялась — чистая переустановка
  Write-Host "Конфликт подписи, переустанавливаю с нуля…"
  & $adb -s $device uninstall $pkg | Out-Null
  $out = & $adb -s $device install $Apk 2>&1
  if ($LASTEXITCODE -ne 0) { $out | ForEach-Object { $_ }; throw "Не удалось установить APK" }
}

Write-Host "Открываю приложение…"
& $adb -s $device shell am start -n $activity | Out-Null
Start-Sleep -Seconds 3

if ($Shot) {
  $tmp = "$Shot.tmp.png"
  cmd /c "`"$adb`" -s $device exec-out screencap -p > `"$tmp`""
  Move-Item $tmp $Shot -Force
  Write-Host "Скриншот: $Shot"
}

if ($Log) {
  Write-Host "logcat (последние 40 строк):"
  & $adb -s $device logcat -d -t 40 | Select-String -Pattern "lad|Chrome|chromium|AndroidRuntime" | Select-Object -Last 20
}

Write-Host "Готово. Чтобы видеть экран телефона на мониторе — scrcpy (см. README)."
