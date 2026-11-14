import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/* Веб-часть живёт в корне репозитория (app.html + assets) — единый источник правды.
   Перед сборкой она копируется в assets/www, поэтому в APK всегда актуальный прототип. */
val webRoot = rootProject.projectDir.parentFile

val syncWebAssets = tasks.register<Sync>("syncWebAssets") {
    from(webRoot) {
        include("app.html")
        include("assets/**")
        exclude("assets/**/*.bak")
        exclude("assets/fonts/*.txt")
    }
    into(layout.projectDirectory.dir("src/main/assets/www"))
}

tasks.named("preBuild").configure { dependsOn(syncWebAssets) }

android {
    namespace = "ru.lad.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "ru.lad.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "0.2.0"
    }

    /* Подпись берётся из окружения — на GitHub это Secrets, локально переменные среды.
       Без ключа release собирается debug-ключом, чтобы прототип можно было ставить на телефон. */
    signingConfigs {
        val storePath = System.getenv("LAD_KEYSTORE_PATH")
        if (!storePath.isNullOrBlank()) {
            create("release") {
                storeFile = file(storePath)
                storePassword = System.getenv("LAD_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("LAD_KEY_ALIAS") ?: "lad"
                keyPassword = System.getenv("LAD_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            isShrinkResources = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            signingConfig = signingConfigs.findByName("release")
                ?: signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = false
    }

    lint {
        abortOnError = false
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}
