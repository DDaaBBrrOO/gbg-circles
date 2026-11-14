package ru.lad.app

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.view.WindowInsets
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * Тонкая оболочка: весь интерфейс — локальный прототип из assets/www.
 * Ни сети, ни разрешений: страница, шрифты и звук лежат внутри APK.
 */
class MainActivity : Activity() {

    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.statusBarColor = Color.parseColor("#09090B")
        window.navigationBarColor = Color.parseColor("#09090B")

        // Android 15 (targetSdk 35) всё равно рисует под системными панелями,
        // поэтому включаем edge-to-edge явно и отдаём отступы WebView сами.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
        }

        web = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#09090B"))
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

            setOnApplyWindowInsetsListener { view, insets ->
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

            loadUrl("file:///android_asset/www/app.html?theme=night")
        }

        setContentView(web)
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
