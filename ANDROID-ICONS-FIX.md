# ✅ Iconos Android Arreglados

## 🎯 Problema Resuelto

Los iconos de la aplicación Android ahora están correctamente configurados en todos los tamaños necesarios:

### ✅ Iconos Generados

- **mipmap-mdpi**: 48x48 px
- **mipmap-hdpi**: 72x72 px  
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px
- **Adaptive Icon** (Android 8.0+): `icon.xml` configurado

### 📁 Ubicación de los Iconos

```
conferente-apk/res/
├── mipmap-mdpi/
│   ├── icon.png
│   └── icon_foreground.png
├── mipmap-hdpi/
│   ├── icon.png
│   └── icon_foreground.png
├── mipmap-xhdpi/
│   ├── icon.png
│   └── icon_foreground.png
├── mipmap-xxhdpi/
│   ├── icon.png
│   └── icon_foreground.png
├── mipmap-xxxhdpi/
│   ├── icon.png
│   └── icon_foreground.png
├── mipmap-anydpi-v26/
│   └── icon.xml (adaptive icon)
└── values/
    ├── colors.xml (color de fondo del icono)
    └── strings.xml
```

## 🔧 Script para Regenerar Iconos

Si necesitas regenerar los iconos en el futuro:

```bash
node scripts/generate-android-icons.mjs
```

## 📱 Compilar el APK

Tienes **3 opciones** para compilar el APK:

### OPCIÓN 1: Usar Capacitor (Recomendado)

Ya tienes Capacitor instalado. Para crear el proyecto Android:

```bash
# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Construir la app web
npm run build

# 3. Agregar plataforma Android
npx cap add android

# 4. Copiar los iconos y recursos a la carpeta android de Capacitor
# Los iconos ya están en conferente-apk/res, necesitarás copiarlos a android/app/src/main/res

# 5. Abrir en Android Studio
npx cap open android

# 6. En Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### OPCIÓN 2: Usar PWA Builder (Más Fácil - 5 minutos)

1. Ve a: https://www.pwabuilder.com/
2. Pega tu URL: `https://conferente-2-2.vercel.app`
3. Haz click en "Start"
4. Click en "Package for Android"
5. Configura:
   - App name: `Conferente`
   - Package ID: `com.conferente.app`
   - App version: `1.0.0`
6. Descarga el APK

**Nota:** PWA Builder usará los iconos de tu PWA (public/icon-512.png), que ya están correctos.

### OPCIÓN 3: Android Studio Manual

Si prefieres usar el proyecto `conferente-apk` directamente:

1. Abre Android Studio
2. File → Open → Selecciona la carpeta `conferente-apk`
3. Espere a que Gradle sincronice
4. Build → Build Bundle(s) / APK(s) → Build APK(s)
5. El APK estará en: `conferente-apk/app/build/outputs/apk/release/app-release.apk`

## 📝 Próximos Pasos

1. **Hacer commit de los cambios:**
   ```bash
   git commit -m "fix: Agregar iconos Android en todos los tamaños mipmap"
   git push
   ```

2. **Compilar el APK** usando una de las 3 opciones arriba

3. **Instalar en tu dispositivo:**
   ```bash
   adb install app-release.apk
   ```
   O copia el APK a tu dispositivo e instálalo manualmente.

## ✅ Verificación

Para verificar que los iconos están correctos:

1. Compila el APK
2. Instálalo en un dispositivo Android
3. Verifica que el icono se muestra correctamente en el launcher
4. En Android 8.0+, verifica que el adaptive icon funciona correctamente

## 🔄 Regenerar Iconos

Si cambias el icono SVG (`public/icon.svg`), regenera todos los iconos:

```bash
# Regenera iconos PWA
node scripts/generate-icons-sharp.mjs

# Regenera iconos Android
node scripts/generate-android-icons.mjs
```
