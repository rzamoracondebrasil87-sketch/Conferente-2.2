# 🚀 PWA Builder - Guía Completa con ICON0

## 📝 Antes de empezar

Tu PWA está perfecta. El icono ya está configurado en:
```
public/icon-512.png (512x512px)
manifest.json (referencia del icono)
```

## 🎯 Pasos en PWA Builder

### PASO 1: Ir a PWA Builder
```
https://www.pwabuilder.com/
```

### PASO 2: Ingresar tu URL
Pega exactamente esto en el campo:
```
https://conferente-2-2.vercel.app
```

Haz click en **"Start"**

### PASO 3: Esperar análisis
Verás un análisis. Debe mostrar:
- ✓ Web Manifest detectado
- ✓ Icons encontrados
- ✓ Service Worker registrado
- ✓ HTTPS activado

Esto significa que **TODO ESTÁ BIEN**.

### PASO 4: Ir a "Package for Android"
Baja y busca la sección que dice:
```
Google Play
Package for Android
```

Haz click en **"Package"** o **"Download"**

### PASO 5: Configurar el APK

Verás un formulario. **Llena así:**

```
App name:           Conferente
Package ID:         com.conferente.app
App version:        1.0.0
Signing Key:        [Generar nuevo]
```

**MÁS IMPORTANTE:**
- Descarga y **guarda tu signing key** en un lugar seguro
- Es el certificado para actualizar la app en el futuro

### PASO 6: Descargar APK
```
conferente-release.apk (~50-80MB)
```

---

## ⚠️ CONSEJOS IMPORTANTES

### 🔐 Seguridad
1. **Signing Key** - GUARDA EN UN LUGAR SEGURO
   - Sin esto, no puedes actualizar la app en Google Play
   - Si la pierdes, no puedes actualizar la app jamás
   - Copia en un USB o nube encriptada

2. **API Key en Vercel**
   - ✓ NUNCA está en el APK (está en env variables)
   - ✓ Si la comprometen, puedes cambiarla desde Vercel
   - ✓ El APK seguirá funcionando

### 📱 Instalación en móvil

**Opción A - USB directo:**
```powershell
adb install conferente-release.apk
```

**Opción B - Copiar archivo:**
1. Conecta móvil por USB
2. Copia `conferente-release.apk` a Downloads/
3. En móvil: Files → Downloads → Instalar

### 🔄 Actualizaciones futuras
1. Haces cambios en tu código
2. `git push` a GitHub
3. Vercel se redeploya automáticamente
4. Tu app PWA se actualiza (sin APK nuevo)

Para actualizaciones del APK mismo (version bump):
```powershell
# En vite.config.ts o package.json, aumenta version
# Regenera APK en PWA Builder
```

### 📊 Testing importante

Después de instalar el APK:
1. **Prueba offline:**
   - Activa airplane mode
   - La app sigue funcionando (Service Worker cachea)

2. **Prueba API:**
   - Activa internet nuevamente
   - Verifica que Gemini API funcione
   - La API key viene de Vercel (segura)

3. **Prueba notificaciones:**
   - Si la app usa notificaciones, testéalas

### 🎨 Icono en la app

PWA Builder **automáticamente:**
- ✓ Usa el icono del manifest.json
- ✓ Crea variantes (192x192, 512x512)
- ✓ Adapta para Android
- ✓ Lo pone en la pantalla de inicio

**Tu icono está perfecto** (512x512px PNG con logo)

### 📦 Tamaño esperado
- APK base: ~40MB
- Con assets: ~50-80MB (normal para React)

Si quieres reducir:
1. Usa dynamic imports en React
2. Lazy load componentes
3. Comprime imágenes

### 🚀 Google Play Store (opcional)

Para publicar en Google Play:
1. Necesitas cuenta de desarrollador ($25 pago único)
2. Subes el APK en Google Play Console
3. Tus usuarios descargan desde Play Store
4. Las actualizaciones se hacen automáticamente

Sin Play Store:
- Distribuyes el APK directamente
- Usuarios lo instalan manualmente
- Funciona igual de bien

---

## 📋 Checklist Final

- [ ] URL en PWA Builder: `https://conferente-2-2.vercel.app`
- [ ] Icono detectado (512x512px)
- [ ] Manifest.json válido
- [ ] Service Worker registrado
- [ ] Package ID: `com.conferente.app`
- [ ] Signing Key guardado en lugar seguro
- [ ] APK descargado
- [ ] APK instalado en móvil
- [ ] Testeado offline
- [ ] Testeado API Gemini
- [ ] Icono aparece en pantalla de inicio

---

## 🆘 Si algo falla

**Error: "Manifest not found"**
- Recarga la página de PWA Builder
- Verifica que https://conferente-2-2.vercel.app/manifest.json sea accesible

**Error: "Icono no encontrado"**
- Verifica que https://conferente-2-2.vercel.app/icon-512.png exista
- Recarga

**APK no instala en móvil**
- Activa "Instalar apps desconocidas" en Settings → Apps
- Intenta nuevamente

**APK instala pero muestra pantalla blanca**
- Abre navegador en el móvil y prueba la URL directa
- Verifica internet
- Force stop la app y abre nuevamente

---

¡**Ya estás listo!** 🎉

**Siguiente paso:**
1. Abre PWA Builder
2. Pega tu URL
3. Package for Android
4. Descarga y instala

¿Necesitas ayuda en algún paso?
