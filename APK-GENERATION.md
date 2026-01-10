# 📱 Generar APK - TWA (Trusted Web Activity)

Tu PWA se convertirá en una app Android nativa (.apk) que se puede instalar directamente.

## ✅ Requisitos (ya verificados):
- ✓ Java JDK 11+ (tienes: 21.0.9)
- ✓ npm (tienes: ya instalado)
- ✓ Bubblewrap (instalando...)
- ✓ Tu PWA en Vercel desplegada

## 📋 Pasos para generar el APK:

### PASO 1: Esperar a que Vercel termine el deploy
- Ve a: https://vercel.com/dashboard
- Busca `Conferente-2.2`
- Espera a que diga "Ready" o "Production" (no "Building")

### PASO 2: Generar el APK (ejecutar en terminal)

Cuando Vercel esté listo, ejecuta:

```powershell
cd e:\conferente-2.2
bubblewrap init --manifest=twa-config.json
```

Responde así a las preguntas:
- "URL domain": `conferente-2-2.vercel.app`
- "Application name": `Conferente`
- "Package ID": `com.conferente.app`
- "Keystore path": presiona ENTER (crea uno nuevo)
- Lo demás: presiona ENTER

### PASO 3: Construir el APK

```powershell
bubblewrap build
```

Esto generará:
- `app-release.apk` - App firmada lista para instalar

### PASO 4: Instalar en tu móvil

#### Opción A - Por USB directo:
```powershell
adb install app-release.apk
```

#### Opción B - Copiar el APK a tu teléfono:
1. Conecta el teléfono por USB
2. Activa "Transferencia de archivos" en el móvil
3. Copia el archivo `app-release.apk` a Downloads del teléfono
4. En el teléfono: Files → Downloads → app-release.apk → Instalar

#### Opción C - Google Play Store (opcional):
1. Sube el APK en Google Play Console
2. La app estará disponible para descargar

## 🎯 El archivo APK

Una vez generado, se encontrará en:
```
e:\conferente-2.2\android\app\build\outputs\apk\release\app-release.apk
```

**Tamaño estimado:** ~50MB (por las librerías de React)

## 🔐 Seguridad

- El APK es firmado digitalmente (Bubblewrap lo hace automáticamente)
- La API key está en variables de entorno en Vercel
- **NUNCA** se incluye en el APK

## 📝 Configuración actual

```json
{
  "appName": "Conferente",
  "packageId": "com.conferente.app",
  "host": "conferente-2-2.vercel.app",
  "version": "1.0.0"
}
```

---

**¿Está Vercel listo?** Dime cuando veas "Ready" y ejecuto el APK por ti.
