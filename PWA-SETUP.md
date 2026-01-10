# Conferente - PWA (Progressive Web App)

Tu app ahora está configurada como una **Progressive Web App (PWA) instalable**.

## 🚀 Cómo instalar en tu dispositivo

### En Android:
1. **Abre la app en Chrome/Firefox** en tu teléfono
2. Toca el **menú (⋮)** en la esquina superior derecha
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
4. Confirma la instalación
5. ¡Listo! La app aparecerá en tu pantalla de inicio

### En iPhone/iPad:
1. Abre Safari
2. Toca el botón **Compartir** (↗️)
3. Selecciona **"Agregar a pantalla de inicio"**
4. Elige el nombre y confirma
5. ¡Listo! La app estará en tu pantalla de inicio

### En Desktop (Windows/Mac/Linux):
1. Abre Chrome o Edge
2. Haz clic en el **ícono de instalación** en la barra de direcciones (si aparece)
3. O ve a menú (⋮) → **"Instalar Conferente"**
4. Confirma la instalación

## ✨ Características de la PWA

- **Instalable**: Se instala como una app nativa
- **Offline**: Funciona sin conexión a internet (datos en caché)
- **Rápida**: Carga casi instantáneamente
- **Segura**: Protocolo HTTPS (en producción)
- **Responsiva**: Se adapta a cualquier pantalla
- **Integración**: Aparece en el menu de aplicaciones

## 📦 Para iniciar desarrollo

```bash
npm run dev
```

La app se ejecutará en `http://localhost:3000`

## 🏗️ Para construir para producción

```bash
npm run build
npm run preview
```

## 📋 Configuración PWA

Todo está configurado en:
- `public/manifest.json` - Metadatos de la app
- `public/sw.js` - Service Worker (cache y offline)
- `public/icon-*.png` - Iconos de la app (192x512px)

## 🔐 Seguridad

- La API key está en `.env.local` (NO se incluye en el build)
- El Service Worker cachea solo assets locales
- Las peticiones a Google Gemini API se hacen directamente desde el navegador

## ⚡ Optimizaciones incluidas

- Service Worker para cache inteligente
- Estrategia "network-first" para HTML
- Estrategia "cache-first" para assets estáticos
- Soporte para pantalla de inicio (homescreen)
- Gestos y animaciones nativas

---

¡Tu app está lista para ser instalada como una aplicación real! 🎉
