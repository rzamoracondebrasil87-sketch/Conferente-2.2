# 🚀 Deployment - Guía de Publicación

Tu PWA está lista para ser deployada. Aquí están las opciones:

## Opción 1: Vercel (Recomendado - Gratis)

```bash
npm install -g vercel
vercel
```

Vercel automáticamente:
- Detecta Vite
- Construye el proyecto
- Activa HTTPS (requerido para PWA)
- Genera certificados SSL

## Opción 2: Netlify (Gratis)

```bash
npm install -g netlify-cli
netlify deploy
```

O conecta tu repositorio GitHub directamente en netlify.com

## Opción 3: GitHub Pages

```bash
# Editar vite.config.ts:
# base: '/conferente-2.2/' (si es repo personal)
npm run build
# Push a GitHub
```

## Opción 4: Tu propio servidor

```bash
npm run build
# Subir carpeta 'dist/' a tu servidor web
# Asegúrate de servir con HTTPS
```

## ✅ Requisitos para PWA completa

- ✓ HTTPS activado (obligatorio)
- ✓ manifest.json validado
- ✓ Service Worker registrado
- ✓ Iconos en /public
- ✓ API key en variables de entorno

## 🔒 Variables de entorno en producción

**NO HAGAS:**
```env
# ❌ NUNCA en .env expuesto
GEMINI_API_KEY=AIzaSy...
```

**MEJOR:**
1. En Vercel: Dashboard → Settings → Environment Variables
2. En Netlify: Site settings → Build & deploy → Environment
3. En tu servidor: Variables de entorno del sistema

## 📱 Después de deployar

1. Abre en móvil: `https://tunombre.vercel.app` (o tu dominio)
2. Verás un botón de **"Instalar"** en la barra del navegador
3. Toca para instalar como app nativa
4. ¡Listo! Funciona offline y se ejecuta como app

## 🧪 Testear localmente

```bash
npm run build
npm run preview
```

Abre `http://localhost:4173` en Chrome DevTools → Application → Service Workers para ver que está registrado.

## 🎯 Testing PWA

- **Lighthouse**: DevTools → Lighthouse (analiza PWA)
- **Offline**: DevTools → Network → Offline
- **Add to homescreen**: DevTools → Manifest

---

¡Tu PWA está lista para el mundo! 🌍
