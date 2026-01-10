# 📱 Guía Completa para Compilar el APK

## ✅ Estado Actual

**¡Todo está listo!** Los iconos Android han sido generados y configurados correctamente:

- ✅ Iconos generados en todos los tamaños (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- ✅ Adaptive icon configurado para Android 8.0+
- ✅ Proyecto Capacitor Android configurado
- ✅ Iconos copiados a `android/app/src/main/res`
- ✅ AndroidManifest.xml actualizado con iconos personalizados
- ✅ Cambios subidos a GitHub

## 🚀 Compilar el APK - Opciones

### OPCIÓN 1: Android Studio (Recomendado para Control Total)

**Pasos:**

1. **Abrir el proyecto en Android Studio:**
   ```bash
   npm run android:open
   ```
   O manualmente:
   ```bash
   npx cap open android
   ```

2. **Esperar a que Gradle sincronice:**
   - Android Studio abrirá automáticamente
   - Espera a que termine la sincronización de Gradle
   - Puede tomar unos minutos la primera vez

3. **Construir el APK:**
   - En Android Studio: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - O presiona `Ctrl + Shift + A` (Windows) / `Cmd + Shift + A` (Mac) y busca "Build APK"

4. **Ubicación del APK:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   android/app/build/outputs/apk/release/app-release.apk (si firmaste)
   ```

5. **Instalar en tu dispositivo:**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Ventajas:**
- Control total sobre la compilación
- Puedes firmar el APK para distribución
- Puedes ver errores y depurar
- Genera APK optimizado

---

### OPCIÓN 2: Compilar desde Terminal (Gradle)

**Requisitos:**
- Java JDK 11+ instalado (ya lo tienes: 21.0.9)
- Android SDK instalado (se instala con Android Studio)

**Pasos:**

1. **Ir a la carpeta android:**
   ```bash
   cd android
   ```

2. **Compilar el APK de debug:**
   ```bash
   .\gradlew assembleDebug
   ```

3. **Compilar el APK de release (requiere firma):**
   ```bash
   .\gradlew assembleRelease
   ```

4. **Ubicación del APK:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

**Ventajas:**
- Rápido desde terminal
- No requiere abrir Android Studio
- Útil para CI/CD

---

### OPCIÓN 3: PWA Builder (Más Fácil - 5 minutos)

**Pasos:**

1. Ve a: https://www.pwabuilder.com/
2. Pega tu URL: `https://conferente-2-2.vercel.app`
3. Haz click en **"Start"**
4. Espera el análisis (debe mostrar ✓ en todos los checks)
5. Haz click en **"Package for Android"**
6. Configura:
   - **App name:** `Conferente`
   - **Package ID:** `com.conferente.app`
   - **App version:** `1.0.0`
   - **Signing Key:** Generar nuevo (IMPORTANTE: guarda la key)
7. Haz click en **"Generate Package"**
8. Descarga el APK

**Ventajas:**
- Muy fácil y rápido
- No requiere Android Studio
- Ideal para principiantes
- Genera APK firmado automáticamente

**⚠️ IMPORTANTE:** Guarda el signing key en un lugar seguro. Lo necesitarás para actualizar la app.

---

## 🔧 Comandos Útiles

### Scripts NPM Disponibles:

```bash
# Regenerar iconos Android
npm run icons:android

# Regenerar iconos PWA
npm run icons:pwa

# Regenerar todos los iconos
npm run icons:all

# Configurar Capacitor Android (ya hecho)
npm run android:setup

# Abrir proyecto en Android Studio
npm run android:open

# Sincronizar cambios con Capacitor
npm run android:sync
```

### Comandos Capacitor:

```bash
# Construir la app web
npm run build

# Sincronizar cambios con Android
npx cap sync android

# Abrir Android Studio
npx cap open android

# Verificar configuración
npx cap doctor
```

---

## 📦 Firmar el APK para Distribución

Si quieres publicar en Google Play, necesitas firmar el APK:

1. **Generar un keystore (solo una vez):**
   ```bash
   keytool -genkey -v -keystore conferente-release-key.keystore -alias conferente -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configurar en `android/app/build.gradle`:**
   Agrega la configuración de firma (ver documentación de Capacitor)

3. **Compilar APK firmado:**
   ```bash
   cd android
   .\gradlew assembleRelease
   ```

---

## ✅ Verificación Post-Compilación

Después de compilar el APK:

1. ✅ Verifica que el icono se muestra correctamente en el launcher
2. ✅ En Android 8.0+, verifica que el adaptive icon funciona
3. ✅ Verifica que la app se abre correctamente
4. ✅ Verifica que se conecta a tu URL de Vercel
5. ✅ Prueba todas las funcionalidades

---

## 🐛 Solución de Problemas

### Error: "SDK location not found"
```bash
# Crear archivo local.properties en android/
echo sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk > android/local.properties
```

### Error: "Gradle sync failed"
- Abre Android Studio
- File → Invalidate Caches / Restart
- Reintenta

### Error: "Build failed"
- Verifica que Java JDK 11+ está instalado
- Verifica que Android SDK está instalado
- Ejecuta: `npx cap doctor` para verificar

### Iconos no aparecen
- Verifica que los iconos están en `android/app/src/main/res/mipmap-*/`
- Ejecuta: `npx cap sync android`
- Limpia y reconstruye: En Android Studio: `Build` → `Clean Project` → `Rebuild Project`

---

## 📝 Notas Importantes

1. **La carpeta `android/` es generada por Capacitor.** No es necesario subirla a Git (está en .gitignore).

2. **Los iconos están en dos lugares:**
   - `conferente-apk/res/` (respaldo/plantilla)
   - `android/app/src/main/res/` (usado en el APK)

3. **Para actualizar los iconos:**
   ```bash
   npm run icons:android
   Copy-Item -Path "conferente-apk\res\*" -Destination "android\app\src\main\res\" -Recurse -Force
   npx cap sync android
   ```

4. **Para actualizar la app web en el APK:**
   ```bash
   npm run build
   npx cap sync android
   ```

---

## 🎯 Recomendación

**Para empezar rápido:** Usa **OPCIÓN 3 (PWA Builder)** - Es la más fácil y genera un APK funcional en 5 minutos.

**Para desarrollo/control total:** Usa **OPCIÓN 1 (Android Studio)** - Te da más control y permite depurar.

---

## ✅ ¡Todo Listo!

Tu proyecto está completamente configurado y listo para compilar el APK. Solo elige una de las opciones arriba y ¡a compilar! 🚀
