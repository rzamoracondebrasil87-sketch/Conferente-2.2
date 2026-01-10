# 📱 Generar APK - Método Rápido (PWA Builder)

Tu app está lista en Vercel. Aquí hay **3 formas** de convertirla en APK:

## ✨ OPCIÓN 1 - La más fácil (PWA Builder - 5 minutos)

1. Ve a: https://www.pwabuilder.com/
2. Pega tu URL: `https://conferente-2-2.vercel.app`
3. Haz click en "Start"
4. Verás un análisis de tu PWA
5. Click en "Package for Android" (abajo)
6. Descarga el APK automáticamente
7. Instala en tu móvil

**¡Listo!** El APK se genera en unos segundos.

---

## 🔧 OPCIÓN 2 - Con Android Studio (Más control)

### Paso 1: Descargar Android Studio
- Ve a: https://developer.android.com/studio
- Instala (descarga ~1GB)

### Paso 2: Crear el proyecto
```
File → New → New Project
```

### Paso 3: Crear un WebView Activity
- Selecciona "Empty Activity"
- Naming: `MainActivity`
- Finish

### Paso 4: Editar MainActivity.java
Reemplaza el contenido con:

```java
package com.conferente.app;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        WebView webView = findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.loadUrl("https://conferente-2-2.vercel.app");
    }
}
```

### Paso 5: Build → Build Bundle(s) / APK(s)
- Genera el APK
- Instala en tu teléfono

---

## 📲 OPCIÓN 3 - Instalar directamente desde navegador

Tu app **ya es instalable** como PWA:

1. Abre en Android: https://conferente-2-2.vercel.app
2. Toca el botón de **"Instalar"** (Chrome/Firefox)
3. ¡Listo! Tienes la app en tu pantalla de inicio

**Ventaja:** No necesitas APK, funciona igual y toma menos espacio.

---

## 🎯 Recomendación

**La forma más rápida y fácil es OPCIÓN 1 (PWA Builder):**
- Solo 5 minutos
- No requiere instalar nada
- Genera APK firma automáticamente
- Listo para Google Play Store

---

## 📋 Si generas un APK:

El archivo descargado será:
```
conferente-2-2-release.apk (~50-80MB)
```

Para instalar en tu móvil:
1. Transfiere por USB a la carpeta `Downloads`
2. O usa `adb install` desde PowerShell

---

**¿Quieres que genere el APK con PWA Builder ahora?**
