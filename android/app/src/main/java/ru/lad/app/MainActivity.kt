package ru.lad.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.res.Configuration
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout

/**
 * Тонкая оболочка: весь интерфейс — локальный прототип из assets/www.
 * Ни сети, ни разрешений: страница, шрифты и звук лежат внутри APK.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView
    private lateinit var root: FrameLayout

    private val lightBg = Color.parseColor("#F7F4EC")
    private val darkBg = Color.parseColor("#09090B")

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Android 15 (targetSdk 35) всё равно рисует под системными панелями,
        // поэтому включаем edge-to-edge явно и отдаём отступы контейнеру.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
        }

        // фон окна совпадает с темой системы, чтобы не было светлой полосы под статус-баром
        val systemDark = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) ==
            Configuration.UI_MODE_NIGHT_YES
        val initialBg = if (systemDark) darkBg else lightBg
        window.decorView.setBackgroundColor(initialBg)

        root = FrameLayout(this).apply {
            setBackgroundColor(initialBg)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
        }

        web = WebView(this).apply {
            setBackgroundColor(initialBg)
            // отладка вёрстки через chrome://inspect (только debug-сборка)
            val debuggable = (applicationInfo.flags and
                android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
            WebView.setWebContentsDebuggingEnabled(debuggable)
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                // звук по кнопке не должен требовать второго касания
                mediaPlaybackRequiresUserGesture = false
                // доступ к произвольным файлам не нужен: ассеты открываются всегда
                allowFileAccess = false
                allowContentAccess = false
                setSupportZoom(false)
                builtInZoomControls = false
                displayZoomControls = false
                textZoom = 100
            }

            webViewClient = WebViewClient()
            webChromeClient = WebChromeClient()
            addJavascriptInterface(Bridge(), "LadHost")

            // тему задаёт оболочка: WebView наследует тёмный вид от Material-темы,
            // а не от системной настройки, поэтому передаём её явно
            loadUrl("file:///android_asset/www/app.html?theme=" + if (systemDark) "night" else "air")
        }

        root.addView(web)
        setContentView(root)

        // Отступы снимает контейнер: у самого WebView padding иногда игнорируется
        // при отрисовке поверхности.
        root.setOnApplyWindowInsetsListener { view, insets ->
            val (top, bottom) = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                val bars = insets.getInsets(
                    WindowInsets.Type.systemBars() or WindowInsets.Type.displayCutout(),
                )
                bars.top to bars.bottom
            } else {
                @Suppress("DEPRECATION")
                insets.systemWindowInsetTop to insets.systemWindowInsetBottom
            }
            view.setPadding(0, top, 0, bottom)
            insets
        }
    }

    /** Мостик для страницы: тема влияет на цвет иконок и фон под системными панелями. */
    inner class Bridge {
        @JavascriptInterface
        fun onTheme(dark: Boolean) {
            runOnUiThread { applyTheme(dark) }
        }
    }

    private fun applyTheme(dark: Boolean) {
        val bg = if (dark) darkBg else lightBg
        root.setBackgroundColor(bg)
        web.setBackgroundColor(bg)
        window.decorView.setBackgroundColor(bg)
        applySystemBarIcons(dark)
    }

    private fun applySystemBarIcons(dark: Boolean) {
        val mask = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or
                android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
        else
            android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController ?: return
            controller.setSystemBarsAppearance(if (dark) 0 else mask, mask)
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility =
                if (dark) 0 else View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        }
    }

    override fun onPause() {
        super.onPause()
        web.onPause()
        web.pauseTimers()
    }

    override fun onResume() {
        super.onResume()
        web.resumeTimers()
        web.onResume()
    }

    @Deprecated("Android 13+ предпочитает OnBackInvokedDispatcher")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        web.destroy()
        super.onDestroy()
    }
}
