# Эмулятор без Android Studio: создать AVD, запустить, поставить APK и открыть приложение.
#   tools\emulator.ps1                 — запуск эмулятора и установка текущего debug APK
#   tools\emulator.ps1 -Shot out.png   — ещё и скриншот экрана
#   tools\emulator.ps1 -Fresh          — пересоздать AVD (если образ обновился)
param(
  [string]$Shot = "",
  [switch]$Fresh
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sdk = Join-Path $root ".toolchain\sdk"
$env:JAVA_HOME = Join-Path $root ".toolchain\jdk-17.0.21+9"

$adb = Join-Path $sdk "platform-tools\adb.exe"
$emulator = Join-Path $sdk "emulator\emulator.exe"
$avdmanager = Join-Path $sdk "cmdline-tools\latest\bin\avdmanager.bat"
$avd = "lad35"
$image = "system-images;android-35;google_apis;x86_64"
$avdDir = Join-Path $env:USERPROFILE ".android\avd\$avd.avd"
$pkg = "ru.lad.app.debug"

if (-not (Test-Path $adb)) { throw "Нет Android SDK в $sdk — см. README, раздел про эмулятор" }

if ($Fresh -and (Test-Path $avdDir)) { Remove-Item $avdDir -Recurse -Force }

if (-not (Test-Path $avdDir)) {
  Write-Host "Создаю AVD $avd…"
  cmd /c "echo no| `"$avdmanager`" create avd -n $avd -k `"$image`" -d pixel_7 --force"
}

$device = (& $adb devices) -join "`n"
if ($device -notmatch "emulator-\d+\s+device") {
  Write-Host "Запускаю эмулятор (первый старт — до двух минут)…"
  Start-Process -FilePath $emulator -ArgumentList @("-avd", $avd, "-no-snapshot-save", "-gpu", "auto", "-memory", "3072", "-netdelay", "none", "-netspeed", "full")
  & $adb wait-for-device | Out-Null
  $tries = 0
  do {
    Start-Sleep -Seconds 2
    $boot = (& $adb shell getprop sys.boot_completed 2>$null) -join ""
    $tries++
  } while ($boot.Trim() -ne "1" -and $tries -lt 90)
  if ($boot.Trim() -ne "1") { throw "Эмулятор не загрузился за 3 минуты" }
  Start-Sleep -Seconds 3
}

$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { throw "Нет APK: соберите его (gradlew assembleDebug) или скачайте из CI" }

Write-Host "Ставлю APK…"
$out = & $adb install -r $apk 2>&1
if ($LASTEXITCODE -ne 0) {
  # подпись поменялась (например, раньше ставили релизный ключ) — чистая переустановка
  Write-Host "Конфликт подписи, переустанавливаю с нуля…"
  & $adb uninstall $pkg | Out-Null
  $out = & $adb install $apk 2>&1
  if ($LASTEXITCODE -ne 0) { $out | ForEach-Object { $_ }; throw "Не удалось установить APK" }
}

Write-Host "Открываю приложение…"
& $adb shell am start -n "$pkg/ru.lad.app.MainActivity" | Out-Null

if ($Shot) {
  Start-Sleep -Seconds 14
  $tmp = "$Shot.tmp.png"
  cmd /c "`"$adb`" exec-out screencap -p > `"$tmp`""
  Move-Item $tmp $Shot -Force
  Write-Host "Скриншот: $Shot"
}

Write-Host "Готово. Устройство: $(((& $adb devices) -split "`n" | Select-String 'emulator') -join ' ')"
